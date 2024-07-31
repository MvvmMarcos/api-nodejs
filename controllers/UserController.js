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
const { Op, where } = require('sequelize');
//incluir o arquivo com a função de upload
const upload = require('../services/uploadImgUserServices');
//O módulo fs permite intergari com o sistema de arquivos
const fs = require('fs');
//listar usuários
router.get('/users', eAdmin, async (req, res) => {
    //http://localhost:3000/users?page=1
    //receber o numero da pagina
    const { page = 1 } = req.query;
    //recuperar os valores que estavam no token, tratados no authServices.js
    // console.log(req.userId);
    //indicar o limite de registro em cada pagina
    const limit = 10;
    //variavel com o numero da ultima pagina;
    var lastPage = 1;
    // contar a quantidade de registro no banco de dados 
    const countUser = await db.Users.count();
    //verificar
    if (countUser !== 0) {
        //calcular a ultima pagina
        lastPage = Math.ceil(countUser / limit);
        //    console.log(lastPage)
    } else {
        return res.status(400).json({ message: 'Erro: Usuários não encontrado!' })
    }
    // console.log((page * limit) - limit);//calculo para determinar a partir de qual registr retornar


    // console.log(page)
    const users = await db.Users.findAll({
        attributes: ['id', 'name', 'email', 'situationId'],
        order: [['id', 'DESC']],
        include: [{
            model: db.Situations,
            attributes: ['nameSituation']
        }],
        //calcular a partir de qual registro retornar
        offset: Number((page * limit) - limit),
        limit: limit
    })
    if (users) {
        return res.status(200).json({ users, lastPage, countUser })
    } else {
        return res.status(400).json({ message: 'Erro: Usuários não encontrado!' })
    }
})
//visualizar usuario por id
router.get('/users/:id', eAdmin, async (req, res) => {
    const { id } = req.params;
    const user = await db.Users.findOne({
        attributes: ['id', 'name', 'email','image', 'situationId', 'createdAt', 'updatedAt'],
        where: { id },
        //buscar dados em uma tabela secundaria
        include: [{
            model: db.Situations,
            attributes: ['nameSituation']
        }]
    })
    //acessa o if se encontrar o registro no banco de ddos
    if (user) {
        //acessa o if quando o usuário possui image
        if(user.dataValues.image){
            // console.log(user.dataValues.image);
            //criar o caminho da imagem
            user.dataValues['image'] = process.env.URL_ADM + "/images/users/" + user.dataValues.image;
            // console.log(user);
        }else{
            // console.log('Usuário não possui imagem')
            //criar o caminho da imagem
            user.dataValues['image'] = process.env.URL_ADM + "/images/users/icon_user.png";
        }
        return res.status(200).json({ user })
    } else {
        return res.status(400).json({ message: 'Erro: Usuários não encontrado!' })
    }
})
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
//atualizar usuário
router.put('/users', eAdmin, async (req, res) => {
    //receber os dados enviados no corpo da requisição
    const data = req.body;
    //validar os campos utilizando o yup
    const schema = yup.object().shape({
        situationId: yup.number("Erro: Necessário preencher o campo situação!")
            .required("Erro: Necessário preencher o campo situação!"),
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
        where:{
            email:data.email,
            //para ignorar o proprio registro
            id:{
                //operador de negação para ignorar o registro do usuário que está sendo editado
                [Op.ne]:Number(data.id)
            }
        }
    })
    //verificar se ja encontra o registro no banco de dados
    if(user){
        return res.status(400).json({
            error: true,
            message: "Erro: Este e-mail já está cadastrado!"
        })
    }
    //editar no banco de dados
    await db.Users.update(data, { where: { id: data.id } })
        .then(() => {
            //retornar objeto como resposta
            return res.json({ message: 'Usuário atualizado com sucesso!' })
        }).catch((error) => {
            return res.status(400).json({ message: "Erro: Usuário não foi atualizado!" })
        })

})
//criar a rota editar imagem e receber o parâmentro id enviado na URL
router.put('/users-image/:id', eAdmin, upload.single('image'), async (req, res)=>{
    const {id} = req.params;
    //acessar o if quando a extensão da imagem é inválida
    if(!req.file){
        return res.status(400).json({
            message:"Erro: Selecione uma imagem válida JPEG ou PNG!"
        })
    }
    //recuperar o registro do banco de dados
    const user = await db.Users.findOne({
        //indicar quais colunas recupera
        attributes:['id','image'],
        where:{id}
    })
    //verificar se o usuario tem image no banco de dados
    // console.log(user);//aqui no console consigo ver o datavalues
    if(user.dataValues.image){
        //criar o caminho da imagem que o usuario tem no banco de dados
        let imgOld = './public/images/users/' + user.dataValues.image;
        //fs.access usado para testar as permissões de arquivo
        fs.access(imgOld,(error)=>{
            //acessa o IF quando não tiver nenhum erro
            if(!error){
                //apagar a imagem antiga
                fs.unlink(imgOld, ()=>{});
            }
        })
    }
    //editar no banco de dados
    db.Users.update(
        {image:req.file.filename},
        {where:{id}}
    ).then(()=>{
        return res.status(200).json({
            message:"Imagem editada com sucesso"
        })
    })
    .catch(()=>{
        return res.status(400).json({
            message:"Erro: Imagem não editada!"
        })
    })
    
})
//apagar usuário
router.delete('/users/:id', eAdmin, async (req, res) => {
    const { id } = req.params;
        //validar os campos utilizando o yup
        const schema = yup.object().shape({
            id:yup.number("Erro: Necessário enviar o campo id!")
                .required("Erro: Necessário enviar o campo id!")            
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
    //apagar usuário no banco de dados
    await db.Users.destroy({ where: { id } })
        .then(() => {
            return res.status(200).json({ message: 'Usuário apagado com sucesso!' })
        })
        .catch((error) => {
            return res.status(400).json({ message: "Erro: Usuário não foi apagado!" })
        })

})
module.exports = router;

// Acrescentar coluna na tabela com migrations