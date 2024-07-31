// Incluir as bibliotecas
// Gerencia as requisições, rotas e URLs, entre outra funcionalidades
const express = require('express');
// Chamar a função express
const router = express.Router();
// Criptografar senha
const bcrypt = require('bcryptjs');
// Incluir o arquivo com as variáveis de ambiente
require('dotenv').config();
// Validar input do formulário
const yup = require('yup');
// Incluir a conexão com banco de dados
const db = require("../db/models");
// Incluir o arquivo responsável em salvar os logs
const logger = require('../services/loggerServices');
// Enviar e-mail
const nodemailer = require('nodemailer');

// Criar a rota recuperar senha
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/recover-password-token
router.post("/recover-password-token", async (req, res) => {

    // Receber os dados enviados no corpo da requisição
    var data = req.body;
    //console.log(data);

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        email: yup.string("Erro: Necessário preencher o campo e-mail!")
            .required("Erro: Necessário preencher o campo e-mail!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Retornar objeto como resposta
        return res.status(400).json({
            error: true,
            message: error.errors
        });
    }

    // Recuperar o registro do banco de dados
    const user = await db.Users.findOne({

        // Indicar quais colunas recuperar
        attributes: ['id', 'name'],

        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            email: data.email
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (!user) {

        // Salvar o log no nível info
        logger.info({ message: "Tentativa recuperar senha com e-mail incorreto.", email: data.email, date: new Date() });

        // Retornar objeto como resposta
        return res.status(400).json({
            error: true,
            message: "Erro: E-mail não está cadastrado!"
        });
    }

    // Chamar a função verificar se algum usuário está utilizando o token
    await verifyUser(data);

    // Função para verificar se algum usuário está utilizando o token
    async function verifyUser(data) {

        // Gerar o token
        data.recoverPasswordToken = Math.random().toString(36).slice(-6);

        // Recuperar usuário no banco de dados com o token gerado
        const user = await db.Users.findOne({
            attributes: ['id'],
            where: {
                recoverPasswordToken: data.recoverPasswordToken
            }
        });

        // Verificar se encontrou usuário com o token gerado, chama novamente a função para gerar novo token e vertificar se o mesmo existe, isto é, usar função recursiva
        if (user) {

            // Chamar a função verificar se algum usuário está utilizando o token
            verifyUser(data);
        }
    }

    // Editar o registro no banco de dados
    await db.Users.update({ recoverPasswordToken: data.recoverPasswordToken }, {
        where: { id: user.id }
    }).then(() => {

        // Criar a variável com as credenciais do servidor para enviar e-mail
        var transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Criar a variável com o conteúdo do e-mail
        var message_content = {
            from: process.env.EMAIL_FROM_PASS, // Rementente
            to: data.email, // E-mail do destinatário
            subject: "Recuperar senha", // Título do e-mail

            text: `Prezado(a) ${user.name} \n\nVocê solicitou alteração de senha.\n\nPara recuperar a sua senha, use o código de verificação: ${data.recoverPasswordToken}\n\nSe você não solicitou essa alteração, nenhuma ação é necessária. Sua senha permanecerá a mesma até que você ative este código.\n\nEsta mensagem foi enviada a você pela empresa ${process.env.NAME_EMP}.\n\nVocê está recebendo porque está cadastrado no banco de dados da empresa ${process.env.NAME_EMP}.Nenhum e-mail enviado pela empresa ${process.env.NAME_EMP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.\n\n`, // Conteúdo do e-mail somente texto

            html: `Prezado(a) ${user.name} <br><br>Você solicitou alteração de senha.<br><br>Para recuperar a sua senha, use o código de verificação: ${data.recoverPasswordToken}<br><br>Se você não solicitou essa alteração, nenhuma ação é necessária. Sua senha permanecerá a mesma até que você ative este código.<br><br>Esta mensagem foi enviada a você pela empresa ${process.env.NAME_EMP}.<br><br>Você está recebendo porque está cadastrado no banco de dados da empresa ${process.env.NAME_EMP}.Nenhum e-mail enviado pela empresa ${process.env.NAME_EMP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.<br><br>`, // Conteúdo do e-mail com HTML

        }

        // Enviar e-mail
        transport.sendMail(message_content, function (err) {
            if (err) {

                // Salvar o log no nível warn
                logger.warn({ message: "E-mail recuperar senha não enviado.", email: data.email, date: new Date() });

                // Retornar objeto como resposta
                return res.status(400).json({
                    error: true,
                    message: "Erro: E-mail com as intruções para recuperar a senha não enviado, tente novamente ou entre em contato com o e-mail: " + process.env.EMAIL_ADM
                });


            } else {

                // Salvar o log no nível info
                logger.info({ message: "Enviado e-mail com instruções para recuperar a senha.", email: data.email, date: new Date() });

                // Retornar objeto como resposta
                return res.json({
                    error: false,
                    message: "Enviado e-mail com instruções para recuperar a senha. Acesse a sua caixa de e-mail para recuperar a senha!"
                });
            }
        })
    }).catch(() => {

        // Salvar o log no nível warn
        logger.warn({ message: "E-mail recuperar senha não enviado. Erro editar usuário no banco de dados.", email: data.email, date: new Date() });

        // Retornar objeto como resposta
        return res.json({
            error: true,
            message: "Erro: Link recuperar senha não enviado, entre em contato com o suporte: " + process.env.EMAIL_ADM,
        });

    })
});

// Criar a rota validar o token recuperar senha
// Endereço para acessar a api através de aplicação externa: http://localhost:8080/validate-recover-password-token
router.post('/validate-recover-password-token', async (req, res) => {

    // Receber os dados enviados no corpo da requisição
    var data = req.body;

    // Validar os campos utilizando o yup
    const schema = yup.object().shape({
        recoverPasswordToken: yup.string("Erro: Necessário enviar o token!")
            .required("Erro: Necessário enviar o token!")
    });

    // Verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        // Retornar objeto como resposta
        return res.status(400).json({
            error: true,
            message: error.errors
        });
    }

    // Recuperar o registro do banco de dados
    const user = await db.Users.findOne({

        // Indicar quais colunas recuperar
        attributes: ['id'],

        // Acrescentado condição para indicar qual registro deve ser retornado do banco de dados
        where: {
            recoverPasswordToken: data.recoverPasswordToken
        }
    });

    // Acessa o IF se encontrar o registro no banco de dados
    if (user) {

        // Salvar o log no nível info
        logger.info({ message: "Validar token recuperar senha, token válido.", date: new Date() });

        // Retornar objeto como resposta
        return res.json({
            error: false,
            message: "Token recuperar senha válido!",
        });
    } else {

        // Salvar o log no nível info
        logger.info({ message: "Validar token recuperar senha, chave inválido.", date: new Date() });

        // Retornar objeto como resposta
        return res.status(400).json({
            error: true,
            message: "Erro: Token recuperar senha inválido!",
        });
    }
});
//Criar a rota para atualizar a senha com o token
//endereço para acessar a api através de aplicação externa: http://localhost:3000/update-password-token
router.put('/update-password-token', async (req, res) => {
    //receber os dados do body
    const data = req.body;
    //validar os campos utilizando o yup
    const schema = yup.object().shape({
        recoverPasswordToken: yup.string("Erro: Necessário enviar o token!")
            .required("Erro: Necessário enviar o token!"),
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve conter no mínimo 6 caracteres!")
    })
    //verificar se todos os campos passaram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: error.errors
        })
    }

    //Recuperar o registro do banco de daos
    const user = await db.Users.findOne({
        //indicar quais colunas recuperar
        attributes: ['id', 'email'],
        //Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: { recoverPasswordToken: data.recoverPasswordToken }
    })
    //Acessar o IF quando achar um usuário
    if (user) {
        //criptográfar a senha
        let password = await bcrypt.hash(data.password, 8);
        //editar o registro no banco de dados
        await db.Users.update({ recoverPasswordToken: null, password }, {
            where: { id: user.id }
        })
            .then(() => {
                //Salvar o log no nível info
                logger.info({ message: 'Senha editada com sucesso.', date: new Date() })
                //retornar o objeto como resposta
                res.status(200).json({ message: "Senha editada com sucesso!" })
            }).catch((error) => {
                //Salvar o log no nível info
                logger.info({ message: 'Senha não editada com sucesso.', date: new Date() })
                //retornar o objeto como resposta
                res.status(400).json({ message: "Erro: Senha não editada com sucesso!" })
            })
    } else {
        //Salvar o log no nível info
        logger.info({ message: 'Erro: Token recuperar senha inválido.', date: new Date() })
        //retorna o objeto como resposta
        res.status(400).json({
            message: 'Erro: Token recuperar senha inválido!'
        })
    }
})
// Exportar a instrução que está dentro da constante router 
module.exports = router;