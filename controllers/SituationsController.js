const router = require('express').Router();
//banco de dados
const db = require('../db/models');
//validar o token
const {eAdmin} = require('../services/authServices')
//listar todas as situações
router.get('/situations', eAdmin, async(req, res)=>{
    //http://localhost:3000/situations?page=1
    //receber o numero da pagian
    const {page = 1} = req.query;
    //indicar o limit de registro de cada pagina
    const limit = 4;
    //variavel com o numero da ultima pagina
    var lastPage = 1;
    //contar a quantidade de registros no banco
    const countSituations = await db.Situations.count();
    //verificar
    if(countSituations !== 0){
        //calcular a ultima página
        lastPage = Math.ceil(countSituations / limit);
    }else{
        res.status(400).json({message:'Situações não encontradas!'})
    }

    const situations = await db.Situations.findAll({
        attributes:['id','nameSituation'],
        order:[['id','DESC']],
        offset:Number((page * limit) - limit),
        limit:limit
    })
    if(situations){
        res.status(200).json({situations})
    }else{
        res.status(400).json({message:'Situações não encontradas!'})
    }
})
//cadastrar situação
router.post('/situations', eAdmin, async(req, res) => {
    const data= req.body;
    await db.Situations.create(data)
    .then((dataSituation)=>{
        res.status(200).json({message:"Situação cadastrada com sucesso!",
            dataSituation
        });
    })
    .catch(()=>{
        return res.status(400).json({
            error:true,
            message:"Erro: Situação não cadastrada!", dataSituation
        })
    })
})
//visualizar situacao por id
router.get('/situations/:id', eAdmin, async(req, res)=>{
    const {id} = req.params;
    const situation = await db.Situations.findOne({
        attributes:['id','nameSituation','createdAt','updatedAt'],
        where:{id},
    })
    if(situation){
        return res.status(200).json({situation})
    }else{
        return res.status(400).json({message:'Situação não encontrada!'})
    }
})
//atualizar situações
router.put('/situations', eAdmin, async(req, res)=>{
    //receber os dados do corpo da requisição
    const data = req.body;
    //editar no banco de dados
    await db.Situations.update(data, {where:{id:data.id}})
    .then(()=>{
        //retornar messagem de sucesso
        return res.status(200).json({message:'Situação atualizada com sucesso!'});
    })
    .catch((error)=>{
        return res.status(400).json({message:'Situação não foi atualizada!'});
    })
})
router.delete('/situations/:id', eAdmin, async(req, res)=>{
    const {id} = req.params;
    //apagar dado no banco
    await db.Situations.destroy({where:{id}})
    .then(()=>{
        return res.status(200).json({message:'Situação apagada com sucesso!'});
    })
    .catch((error)=>{
        return res.status(400).json({message:'Situação não foi apagada!'})
    })
})
module.exports = router;