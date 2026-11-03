'use client'; // Diz ao Next.js que esta tela roda no navegador do utilizador

import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin(e) {
    e.preventDefault();

    // Fazemos a chamada à sua API Node.js!
    const response = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit', // No modo de teste inicial, vamos ver apenas a resposta
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert(`Sucesso: ${data.message}`);
    } else {
      alert(`Erro: ${data.Error}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96 flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Barbearia SaaS</h2>
        
        <input 
          type="email" 
          placeholder="Seu E-mail" 
          className="border p-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input 
          type="password" 
          placeholder="Sua Senha" 
          className="border p-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Entrar
        </button>
      </form>
    </div>
  );
}