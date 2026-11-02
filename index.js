const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
const routerClient = require('./router/router.js')
const routerUsers = require('./router/authRouter.js')
app.use('/client', routerClient)
app.use('/users', routerUsers)


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});