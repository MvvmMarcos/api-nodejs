const router = require('express').Router();
//bcrypt
const bcrypt = require('bcryptjs');
//validar o token
const { eAdmin } = require('../services/authServices');
//yup para validar os formulários
const yup = require('yup');
//banco de dados
const db = require('../db/models');
//operador do sequelize
const { Op, where, STRING } = require('sequelize');
//incluir o arquivo com a função de upload
const upload = require('../services/uploadImgUserServices');
//O módulo fs permite intergari com o sistema de arquivos
const fs = require('fs');
//incluir o arquivo responsável em salvaar logs
const logger = require('../services/loggerServices')

//visualizar o perfil do usuário
//http://localhost:3000/profile
router.get('/profile', eAdmin, async (req, res) => {
    //receber o paramêtro enviado na URL
    const user = await db.Users.findOne({
        attributes: ['id', 'name', 'email', 'image', 'situationId', 'createdAt', 'updatedAt'],
        //no eAdmin retorno o id do usuário req.userId
        where: { id: req.userId },
        //buscar dados em uma tabela secundaria
        include: [{
            model: db.Situations,
            attributes: ['nameSituation']
        }]
    })
    //acessa o if se encontrar o registro no banco de ddos
    if (user) {
        //salvar no log no nível info
        logger.info({ message: 'Perfil visualizado.', id: req.userId, userId: req.userId, date: new Date() })
        //acessa o if quando o usuário possui image
        if (user.dataValues.image) {
            //criar o caminho da imagem
            user.dataValues['image'] = process.env.URL_ADM + "/images/users/" + user.dataValues.image;
            // console.log(user);
        } else {
            // console.log('Usuário não possui imagem')
            //criar o caminho da imagem
            user.dataValues['image'] = process.env.URL_ADM + "/images/users/icon_user.png";
        }
        return res.status(200).json({ user })
    } else {
        //salvar o log no nível info
        logger.info({ message: 'Perfil não encontrado.', id: req.userId, userId: req.userId, date: new Date() })
        return res.status(400).json({ message: 'Erro: Perfil não encontrado!' })
    }
})
//Editar perfil
//http://localhost:3000/profile
router.put('/profile', eAdmin, async (req, res) => {
    //receber os dados enviados no corpo da requisição
    const data = req.body;
    //validar os campos utilizando o yup
    const schema = yup.object().shape({
        email: yup.string("Erro: Necessário preencher o campo e-mail!")
            .email("Erro: Necessário preencher o campo email com um válido!")
            .required("Erro: Necessário preencher o campo e-mail!"),
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
        attributes: ['id'],
        where: {
            email: data.email,
            //para ignorar o proprio registro
            id: {
                //operador de negação para ignorar o registro do usuário que está sendo editado
                [Op.ne]: Number(req.userId)
            }
        }
    })
    //verificar se ja encontra o registro no banco de dados
    if (user) {
        //salvar o log no nível info
        logger.info({ message: 'Tentativa de usar e-mail já cadastrado em outro usuário', id: req.userId, name: data.name, email: data.email, userId: req.userId, date: new Date() })

        return res.status(400).json({
            error: true,
            message: "Erro: Este e-mail já está cadastrado!"
        })
    }
    //editar no banco de dados
    await db.Users.update(data, { where: { id: req.userId } })
        .then(() => {
            //salvar o log no nível info
            logger.info({ message: 'Perfil editado com sucesso.', id: req.userId, name: data.name, email: data.email, userId: req.userId, date: new Date() })
            //retornar objeto como resposta
            return res.json({ message: 'Perfil editado com sucesso!' })
        }).catch((error) => {
            //salvar o log no nível info
            logger.info({ message: 'Perfil não editado com sucesso.', id: req.userId, name: data.name, email: data.email, userId: req.userId, date: new Date() })
            //retornar o objeto com sucesso
            return res.status(400).json({ message: "Erro: Perfil não foi atualizado!" })
        })

})
//criar a rota editar imagem enviado na URL
// http://localhost:3000/profile-image
router.put('/profile-image', eAdmin, upload.single('image'), async (req, res) => {
    //acessar o if quando a extensão da imagem é inválida
    if (!req.file) {
        //salvar o log no nível info
        logger.info({ message: 'Enviado extensão da imagem inválida no editar imagem no usuário', userId: req.userId, date: new Date() });
        // Retornar objeto como resposta
        return res.status(400).json({
            message: "Erro: Selecione uma imagem válida JPEG ou PNG!"
        })
    }
    //recuperar o registro do banco de dados
    const user = await db.Users.findOne({
        //indicar quais colunas recupera
        attributes: ['id', 'image'],
        where: { id: req.userId }
    })
    //verificar se o usuario tem image no banco de dados
    // console.log(user);//aqui no console consigo ver o datavalues
    if (user.dataValues.image) {
        //criar o caminho da imagem que o usuario tem no banco de dados
        let imgOld = './public/images/users/' + user.dataValues.image;
        //fs.access usado para testar as permissões de arquivo
        fs.access(imgOld, (error) => {
            //acessa o IF quando não tiver nenhum erro
            if (!error) {
                //apagar a imagem antiga
                fs.unlink(imgOld, () => {
                //salvar o log no nível info
                logger.info({ message: 'Excluida a imagem do usuário', id: req.userId, image: user.dataValues.image, userId: req.userId, date: new Date() });
                });
            }
        })
    }
    //editar no banco de dados
    db.Users.update(
        { image: req.file.filename },
        { where: { id: req.userId } }
    ).then(() => {
        //salvar o log no nível info
        logger.info({ message: 'Imagem do perfil editada com sucesso.', id: req.userId, image: req.file.filename, userId: req.userId, date: new Date() });
        ///retorna objeto como resposta
        return res.status(200).json({
            message: "Imagem editada com sucesso"
        })
    })
        .catch(() => {
            //salvar o log no nível info
            logger.info({ message: 'Imagem do perfil não editada com sucesso.', id: req.userId, image: req.file.filename, userId: req.userId, date: new Date() });
            // Retornar objeto como resposta
            return res.status(400).json({
                message: "Erro: Imagem não editada!"
            })
        })

})
//Editar senha 
//http://localhost:3000/profile-password
// {
//     "password":"123456"
// }
router.put('/profile-password', eAdmin, async (req, res) => {
    //receber os dados enviados no corpo da requisição
    const data = req.body;
    //validar os campos utilizando o yup
    const schema = yup.object().shape({
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6,"Erro: Necessário no mínimo 6 caracteres!")

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
    //criptografar a senha
    data.password = await bcrypt.hash(String(data.password), 8);
    //editar no banco de dados
    await db.Users.update(data, { where: { id: req.userId } })
        .then(() => {
            //salvar o log no nível info
            logger.info({ message: 'Senha do perfil editada com sucesso.', id: req.userId,userId: req.userId, date: new Date() })
            //retornar objeto como resposta
            return res.json({ message: 'Senha do Perfil editada com sucesso!' })
        }).catch((error) => {
            //salvar o log no nível info
            logger.info({ message: 'senha do perfil não editada com sucesso.', id: req.userId, userId: req.userId, date: new Date() })
            //retornar o objeto com sucesso
            return res.status(400).json({ message: "Erro: Senha do perfil não foi editada!" })
        })

})
module.exports = router;

// Acrescentar coluna na tabela com migrations