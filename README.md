### CRAIR UMA MODEL
using npm
### npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
Criar as models do projeto
### npx sequelize-cli model:generate --name Situations --attributes nameSituation:string
### npx sequelize-cli model:generate --name Users --attributes name:string,email:string,situationId:integer

EXECUTAR AS MIGRATIONS
### npx sequelize-cli db:migrate

criar seeders situations lembre de ir em db.seeders
### npx sequelize-cli seed:generate --name demo-situations
criar seeders users lembre de ir em db.seeders
### npx sequelize-cli seed:generate --name demo-users
executar as seeds
### npx sequelize-cli db:seed:all
Criar a migration para alter a tabela users e adicionar a coluna password
### npx sequelize-cli migration:generate --name alter-users-password
Criptografar
### npm install --save bcryptjs
Executar down - rollback - Permite que seja desfetia a migration, permitindo a gesta das alsterações do banco de dados, versionamento.
### npx sequelize-cli db:migration:undo --name nome_da_migrations_exemplo_20240725175231-alter-users-password.js;

Instalar a dependencia jsonwebtoken
### npm install jsonwebtoken
instalar a dependencia yup para validar formulários
### npm install --save yup
instalar a depencência cors permitir requisição externa
### npm install cors

Criar a migration para alterar a tabela users e adicionar a coluna imagem
### npx sequelize-cli migration:generate --name alter-users-image

Instalar a depencência multer para trabalhar com o envio de imagens, multer é um middleware para manipulação multipart/form-data
### npm install --save multer

Biblioteca para salvar log
### npm install --save winston

Criar a migration para alterar a tabela users e adicionar a coluna recoverPassword
### npx sequelize-cli migration:generate --name alter-users-recover-password

installar a dependência nodemail
### npm install --save nodemailer


Criar a migration para alterar a tabela users e adicionar a coluna recoverPasswordToken
### npx sequelize-cli migration:generate --name alter-users-recover-password-token