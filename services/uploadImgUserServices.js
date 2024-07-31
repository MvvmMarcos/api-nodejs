// multer 
const multer = require('multer');
//o módulo path permite interagir com o sistema de arquivos
const path = require('path');
//realizar upload do usuário
module.exports = (multer({
    //diskStorage permite manipular o local para salvar a image
    storage:multer.diskStorage({
        //local onde salvar as imagens
        destination:function(req, file, cb){
            // console.log(file);
            cb(null, './public/images/users')
        },
        filename:function(req, file, cb){
            //criar novo nome para o arquivo
            cb(null, Date.now().toString() + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
        }
    }),
    //validar a extensão do arquivo
    fileFilter:(req, file, cb)=>{
        //verificar se a extensão enviada pelo usuário esta no array
        const extensionImg = ['image/jpeg','image/jpg','image/png'].find((acceptedFormat)=>acceptedFormat == file.mimetype)
        //Retornar true quando a extensão da image é válida
        if(extensionImg){
            return cb(null, true);
        }else{
            return cb(null, false);
        }
    }
}))
