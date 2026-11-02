# Treino — API de clientes e usuários

Projeto de estudo de uma API HTTP com Node.js, Express e PostgreSQL. Implementa cadastro, consulta, atualização e exclusão de clientes, além de cadastro e autenticação de usuários com JWT em cookie.

## Tecnologias

- Node.js e Express
- PostgreSQL e `pg`
- `bcrypt` para hash de senhas
- `jsonwebtoken` para gerar e validar tokens JWT
- `cookie-parser` para ler cookies
- Nodemon para desenvolvimento

## Como executar

### 1. Instalar as dependências

Com Node.js, npm e PostgreSQL instalados, abra o terminal na pasta do projeto e execute:

```bash
npm install
```

### 2. Preparar o banco

No pgAdmin ou no terminal do PostgreSQL, crie o banco:

```sql
CREATE DATABASE treino;
```

Conecte-se ao banco `treino` antes de executar o SQL abaixo. Este é um esquema mínimo sugerido a partir das consultas presentes no código; o projeto ainda não possui migrations.

```sql
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE follows (
    follower_id INTEGER NOT NULL REFERENCES users(id),
    following_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id <> following_id)
);
```

A tabela `follows` registra quem segue quem. A chave primária composta impede relações duplicadas, e o `CHECK` impede seguir a si mesmo. Execute a criação dessa tabela se já tiver as demais. As referências atuais não usam `ON DELETE CASCADE`: relações existentes impedem excluir o usuário até que os follows dele sejam removidos.

A conexão está configurada diretamente em `controllers/controllers.js`, `controllers/authControllers.js` e `controllers/follow.js`. Ajuste os campos do objeto `Pool` nos três arquivos conforme seu PostgreSQL local:

| Campo | Configuração atual |
| --- | --- |
| `host` | `localhost` |
| `port` | `5432` |
| `database` | `treino` |
| `user` | `postgres` |
| `password` | Ajuste para a senha do seu banco |

O código atual não carrega configurações de um arquivo `.env`.

### 3. Iniciar o servidor

```bash
node index.js
```

Para reiniciar automaticamente durante o desenvolvimento:

```bash
npx nodemon index.js
```

URL base: `http://localhost:3000`.

## Rotas

Envie os corpos das requisições em JSON, com o cabeçalho `Content-Type: application/json`.

### Clientes

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/client` | Lista todos os clientes |
| GET | `/client/:id` | Consulta um cliente pelo ID |
| POST | `/client` | Cadastra um cliente |
| PUT | `/client/:id` | Atualiza nome e e-mail de um cliente |
| DELETE | `/client/:id` | Exclui um cliente |

Corpo para cadastro e atualização:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com"
}
```

### Usuários e autenticação

| Método | Rota | Descrição | Exige cookie de autenticação |
| --- | --- | --- | --- |
| GET | `/users` | Lista ID, nome e e-mail dos usuários | Não |
| GET | `/users/:id` | Retorna o nome de um usuário pelo ID | Não |
| POST | `/users/register` | Cadastra um usuário | Não |
| POST | `/users/login` | Autentica e define o cookie `token` | Não |
| GET | `/users/perfil` | Consulta o perfil do usuário autenticado | Sim |
| POST | `/users/logout` | Remove o cookie `token` | Não |
| POST | `/users/delete` | Exclui a conta do usuário autenticado | Sim |

Corpo para cadastro em `/users/register`:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "senha-de-exemplo"
}
```

Corpo para login em `/users/login`:

```json
{
  "email": "maria@example.com",
  "password": "senha-de-exemplo"
}
```

O cadastro retorna os dados do usuário sem a senha. O login retorna o nome e grava um JWT com validade de uma hora no cookie `token`, configurado com `httpOnly`. As rotas protegidas leem esse cookie; não há leitura do cabeçalho `Authorization` no middleware atual.

### Fluxo para testar no Postman ou Insomnia

1. Cadastre um usuário com `POST /users/register`.
2. Faça login com `POST /users/login`.
3. Mantenha o armazenamento de cookies habilitado e use o mesmo host nas requisições.
4. Acesse `GET /users/perfil` para consultar o perfil autenticado.
5. Use `POST /users/logout` para encerrar a sessão no cliente, ou `POST /users/delete` para excluir a conta autenticada.

### Follows e consulta com JOIN

As duas rotas abaixo exigem o cookie `token` recebido no login e não precisam de corpo JSON.

| Método atual | Rota | Comportamento |
| --- | --- | --- |
| GET | `/follow/:id` | Faz o usuário autenticado seguir a pessoa de ID `:id` |
| GET | `/follow/:id/following` | Lista as pessoas que o usuário autenticado segue |

Exemplo: com Clodoaldo (ID 5) autenticado, `GET /follow/1` cria a relação `(5, 1)`, fazendo ele seguir Sarah. Depois, `GET /follow/5/following` retorna:

```json
[
  { "id": 1, "name": "sarah" }
]
```

Na implementação atual de `getFollowing`, o ID consultado vem de `req.user.id`, e não de `req.params.id`. Portanto, trocar o ID na URL não muda a pessoa consultada. Se não houver relações, a resposta é `[]`.

A consulta usa os seguintes conceitos:

```sql
SELECT u.id, u.name
FROM follows AS f
JOIN users AS u ON u.id = f.following_id
WHERE f.follower_id = $1
ORDER BY u.id;
```

- `f` e `u` são apelidos de `follows` e `users`.
- O `ON` conecta o ID da pessoa seguida ao cadastro em `users`.
- O `WHERE` filtra as relações de quem está seguindo.
- No controller, `$1` recebe o ID autenticado pelo array de parâmetros de `pool.query`.
- O `SELECT` retorna somente o ID e o nome das pessoas seguidas.

A criação do follow ainda utiliza GET; uma melhoria pendente é trocar essa ação para POST. Listagem de seguidores e unfollow ainda não foram implementados.

## Estrutura

```text
Treino/
├── controllers/
│   ├── authControllers.js   # Usuários, login, perfil e exclusão de conta
│   ├── controllers.js       # CRUD de clientes
│   └── follow.js            # Criação de follows e consulta com JOIN
├── middleware/
│   └── authMiddleware.js    # Validação do JWT recebido por cookie
├── router/
│   ├── authRouter.js        # Rotas de usuários
│   ├── router.js            # Rotas de clientes
│   └── follows.js           # Rotas de follows
├── .gitignore
├── index.js                # Configuração e inicialização do Express
├── package-lock.json
└── package.json
```

## Estado do projeto

Projeto em desenvolvimento para estudos. Ainda não há testes automatizados configurados; `npm test` executa apenas o comando padrão que retorna erro.

Pontos conhecidos no código atual:

- As credenciais do banco e a chave JWT estão definidas diretamente nos arquivos JavaScript.
- As rotas de clientes e as consultas públicas de usuários não exigem autenticação.
- O login de um e-mail inexistente pode retornar erro 500 devido à verificação de `user.rows[0].length`.
- A atualização de um cliente inexistente precisa corrigir a chamada `res.send(404).status(...)`.

## Licença

ISC, conforme declarado no `package.json`.
