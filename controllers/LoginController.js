const router = require('express').Router();
//bcrypt
const bcrypt = require('bcryptjs');
//jsonwebtoken token de autenticação
const jwt = require('jsonwebtoken');
//variavel de ambiente
require('dotenv').config();
//validar o formulário com yup
const yup = require('yup')
//banco de dados
const db = require('../db/models');
//Incluir o arquivo responsável em salvar os logs
const logger = require('../services/loggerServices');
//Enviar e-mail
const nodemailer = require('nodemailer');
//cadastrar um usuário
router.post('/users', eAdmin, async (req, res) => {
    //receber os dados enviados no corpo da requisição
    const data = req.body;
    //validar os campos utilizando o yup
    const schema = yup.object().shape({
        situationId: yup.number("Erro: Necessário preencher o campo situação!")
            .required("Erro: Necessário preencher o campo situação!"),
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve conter no mínimo 6 caracteres!"),
        email: yup.string("Erro: Necessário preencher o campo email!")
            .email("Erro: Necessário preencher o campo email com um válido!")
            .required("Erro: Necessário preencher o campo email!"),
        name: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")

    })
    //verificar se todos os campos passaram pela validatação
    try {
        await schema.validate(data)
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: error.errors
        })
    }
    //recuperar o regisro do banco de dados
    const user = await db.Users.findOne({
        //indicar quais colunas recuperar
        attributes:['id'],
        where:{email:data.email}
    })
    //verificar se ja encontra o registro no banco de dados
    if(user){
        return res.status(400).json({
            error: true,
            message: "Erro: Este e-mail já está cadastrado!"
        })
    }
    //criptografar a senha
    data.password = await bcrypt.hash(String(data.password), 8);
    await db.Users.create(data)
        .then((dataUser) => {
            return res.status(200).json({
                error: false,
                message: "Usuário cadastrado com sucesso!",
                dataUser
            });
        })
        .catch(() => {
            return res.status(400).json({
                error: true,
                message: "Erro: Usuário não cadastrado",
                dataUser
            })
        })

})
//login
router.post('/login', async (req, res) => {
    //receber os dados
    let data = req.body;
    //validar os campos utilizando o yup
    const schema = yup.object().shape({
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!"),
        email: yup.string("Erro: Necessário preencher o campo email!")
            .required("Erro: Necessário preencher o campo email!")
    })
    //verificar se todos os campos passram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: error.errors
        })
    }
    const user = await db.Users.findOne({
        attributes: ['id', 'name', 'email', 'password'],
        where: { email: data.email }
    })
    //verificar se usuario foi encontrado
    if (!user) {
        //Salvar o log no nível error
        logger.warn({ message: 'Tentativa de login com usuário incorreto.', email: data.email })
        //se o usuário não foi encontrado
        return res.status(401).json({ message: 'Usuário ou senha incorreta!' })
    }
    if (!(await bcrypt.compare(String(data.password), String(user.password)))) {
        //Salvar o log no nível error
        logger.warn({ message: 'Tentativa de login com a senha incorreto.', email: data.email })
        return res.status(401).json({ message: 'Usuário ou senha incorreta!' })
    }
    //gerar o token de autenticação
    const token = jwt.sign({ id: user.id }, process.env.SECRET, {
        // expiresIn:1800//60 = 1 minuto 600 = 10min poderia colocar tbm '7d'
        expiresIn: '7d'
    });

    return res.status(200).json({
        message: 'Login realizado com sucesso!',
        user: { id: user.id, name: user.name, email: user.email, token }
    })
})
//criar a rota para recuperar senha;

// o body tem que ser enviado do seguinte jeito abaixo
// url da rota http://localhost:3000/recover-password
// {
//     "email":"mvvm@gmail.com",
//     "urlRecoverPassword":"http://localhost:3000?recover-password="
// }
router.post('/recover-password', async (req, res) => {
    //receber os dados
    let data = req.body;
    // console.log(data);
    //validar os campos utilizando o yup
    const schema = yup.object().shape({
        urlRecoverPassword: yup.string("Erro: Necessário enviar a URL!")
            .required("Erro: Necessário enviar a URL!"),
        email: yup.string("Erro: Necessário preencher o campo e-mail!")
            .required("Erro: Necessário preencher o campo e-mail!")
    })
    //verificar se todos os campos passram pela validação
    try {
        await schema.validate(data);
    } catch (error) {
        return res.status(400).json({
            error: true,
            message: error.errors
        })
    }
    //Recuperar o registro do banco de dados
    const user = await db.Users.findOne({
        //Indicar quais colunas recuperar
        attributes: ['id', 'name'],
        //Acrescentar condição para indicar qual registro deve ser retomado
        where: {
            email: data.email
        }
    })
    //Acessar o if se encontrar o registro no banco de dados
    if (!user) {
        //salvar no log no nível info
        logger.info({
            message: 'Tentativa de recuperar senha com e-mail incorreto.',
            email: data.email, date: new Date()
        });
        return res.status(400).json({
            message: 'Erro: Este e-mail não está cadastrado!'
        })
    }
    //Gerar a chace para recuperar senha
    var recoverPassword = (await bcrypt.hash(data.email, 8)).replace(/\./g, "").replace(/\//g, "");
    //Editar o registro no banco de dados
    await db.Users.update({ recoverPassword }, {
        where: { id: user.id }
    })
        .then(() => {
            //Criar a variável com as credenciais do servidor para enviar e-mail
            var transport = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS

                }
            });
            //criar a variavél com o conteúdo do e-mail
            let message_content = {
                form: process.env.EMAIL_FROM_PASS,//remetente
                //e-mail do destinatário
                to: data.email,//E-mail do destinatário
                subject: "Recuperar senha",//Título do e-mail
                text: `Prezado(a) ${user.name}\n\nInformamos que a sua solicitação de alteração de senha foi recebida com sucesso.\n\nClique no link para criar uma nova senha em nosso sistema: ${data.urlRecoverPassword}${recoverPassword}\n\nEstá mensagem foi enviado a você pela empresa ${process.env.NAME_EMP}"\n\nVocê está recebendo porque está cadastrado no banco de dados da empresa ${process.env.NAME_EMP}\n\nNenhum e-mail enviado pela empresa ${process.env.NAME_EMP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.\n\n`,

                html: `Prezado(a) ${user.name}<br><br>Informamos que a sua solicitação de alteração de senha foi recebida com sucesso.<br><br>Clique no link para criar uma nova senha em nosso sistema: <a href='${data.urlRecoverPassword}${recoverPassword}'>${data.urlRecoverPassword}${recoverPassword}</a><br><br>Está mensagem foi enviado a você pela empresa ${process.env.NAME_EMP}.<br><br>Você está recebendo porque está cadastrado no banco de dados da empresa ${process.env.NAME_EMP}.<br><br>Nenhum e-mail enviado pela empresa ${process.env.NAME_EMP} tem arquivos anexados ou solicita o preenchimento de senhas e informações cadastrais.<br><br>`,
            }
            //enviar o e-mail
            transport.sendMail(message_content, (error) => {
                if (error) {
                    //salvar o log no nível warn
                    logger.warn({ message: "E-mail recuperar senha não enviado.", email: data.email, date: new Date() })
                    //retonar objeto como resposta
                    return res.status(400).json({
                        message: 'Erro: E-mail com instruções para recuperar a senha não enviado, tente novamente ou entre em contato com o e-mail!: ' + process.env.EMAIL_ADM
                    })
                } else {
                    //salvar o log no nível info
                    logger.info({ message: "Enviado e-mail com instruções para recuperar a senha.", email: data.email, date: new Date() })
                    //retonar objeto como resposta
                    return res.status(200).json({
                        message: 'Enviado e-mail com instruções para recuperar a senha. Acesse a sua caixa de e-mail para recuperar a senha!'
                    })
                }
            })

        })
        .catch(() => {
            //salvar no log no nível warn
            logger.warn({
                message: 'E-mail recuperar senha não foi enviado. Erro editar usuário no banco de dados.', email: data.email, date: new Date()
            });
            //retonar objeto como resposta
            return res.status(400).json({
                message: 'Erro: Link recuperar senha não enviado, entre em contato com o suporte: ' + process.env.EMAIL_ADM
            })
        })
})
//criar a rota validar a chave recuperar senha
//endereço para acessar a api através de aplicação externa: http://localhost:3000/validate-recover-password

router.post('/validate-recover-password', async (req, res) => {
    //receber os dados
    let data = req.body;
    //validar os campos utilizando o yup
    const schema = yup.object().shape({
        recoverPassword: yup.string("Erro: Necessário enviar a chave!")
            .required("Erro: Necessário enviar a chave!")
    })
    //verificar se todos os campos passram pela validação
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
        attributes: ['id'],
        //Acrescentar condição para indicar qual registro deve ser retornado do banco de dados
        where: { recoverPassword: data.recoverPassword }
    })
    //Acessar o IF quando achar um usuário
    if (user) {
        //Salvar o log no nível info
        logger.info({ message: 'Validar chave recuperar senha, chave válida.', date: new Date() })
        //retornar o objeto como resposta
        res.status(200).json({ message: "Chave recuperar senha válida!" })
    } else {
        //Salvar o log no nível info
        logger.info({ message: 'Erro: Validar chave recuperar senha, chave inválida.', date: new Date() })
        //retorna o objeto como resposta
        res.status(400).json({
            message: 'Erro: Chave recuperar senha inválida!'
        })
    }
})
//Criar a rota para atualizar a senha
//endereço para acessar a api através de aplicação externa: http://localhost:3000/update-password
router.put('/update-password', async (req, res) => {
    //receber os dados do body
    const data = req.body;
    //validar os campos utilizando o yup
    const schema = yup.object().shape({
        recoverPassword: yup.string("Erro: Necessário enviar a chave!")
            .required("Erro: Necessário enviar a chave!"),
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
        where: { recoverPassword: data.recoverPassword }
    })
    //Acessar o IF quando achar um usuário
    if (user) {
        //criptográfar a senha
        let password = await bcrypt.hash(data.password, 8);
        //editar o registro no banco de dados
        await db.Users.update({ recoverPassword: null, password }, {
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
        logger.info({ message: 'Erro: Chave recuperar senha inválida.', date: new Date() })
        //retorna o objeto como resposta
        res.status(400).json({
            message: 'Erro: Chave recuperar senha inválida!'
        })
    }
})
module.exports = router;