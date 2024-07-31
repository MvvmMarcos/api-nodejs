const express = require('express');
const app = express();
//Incluir o módulo para gerenciar diretórios e caminhos
const path = require('path');
//importar a biblioteca para permitir coneção externa;
const cors = require('cors')
//receber dados do body via json
app.use(express.json());
// criar o middleware para permitir requisição externa
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin","*");
    //indicar os tipos de metodos
    res.header("Access-Control-Allow-Methods","GET, PUT, POST, DELETE");
    ///permitir envio de dados a api
    res.header("Access-Control-Allow-Headers","Content-Type, Authorization");
    //executar o cors
    app.use(cors());
    //quando não houver erro deve continuar o processamento
    next();
})
//local dos arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));
//controllers
const UserController = require('./controllers/UserController');
const ProfileController = require('./controllers/ProfileController');
const SituationsController = require('./controllers/SituationsController');
const LoginController = require('./controllers/LoginController');
const RecoverPasswordToken = require('./controllers/RecoverPasswordTokenController')
//controller com o route la dentro
app.use('/', UserController);
app.use('/', ProfileController);
app.use('/', SituationsController);
app.use('/', LoginController);
app.use('/', RecoverPasswordToken);
//base de dados
require('./db/models');

app.listen(3000)