const jwt = require('jsonwebtoken');
//variavel de ambiente
require('dotenv').config();
//Módulo "utils" fornece funções para imprimir string formatadas
const {promisify} = require('util')
module.exports = {
    eAdmin:async function(req, res, next){
        // return res.json({message:'Validar token.'})
        //receber o cabeção da requisição
        const authHeader = req.headers.authorization;
        if(!authHeader){
            return res.status(401).json({message:'Erro: Necessário realizar o login para acessar a página!'})
        }
        const token = authHeader.split(' ')[1];
        if(!token){
            return res.status(401).json({message:'Erro: Necessário enviar o token!'})
        }
        try {
            //validar token
            const decode = await promisify(jwt.verify)(token, process.env.SECRET);
            // console.log(decode)
            req.userId = decode.id;
            return next();
        } catch (error) {
            return res.status(401).json({message:'Erro: Necessário realizar o login para acessar a página!'})
        }

    }
}