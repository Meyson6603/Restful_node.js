const express = require('express');
const cors = require('cors')
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true 
}));
const routerClient = require('./router/router.js')
const routerUsers = require('./router/authRouter.js')
const routerFollow = require('./router/follows.js')
app.use('/client', routerClient)
app.use('/users', routerUsers)
app.use('/follow', routerFollow)


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});