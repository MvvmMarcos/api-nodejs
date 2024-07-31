//criptografar
const bcrypt = require('bcryptjs');

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
  //cadastrar registros na tabela users
  return queryInterface.bulkInsert('Users',[
    {
      name:'Marcos',
      email:'mvvm@gmail.com',
      password: await bcrypt.hash('123456', 8),
      situationId:1,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Flavio',
      email:'flavio@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:2,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Cesar',
      email:'cesar@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:3,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Bruno',
      email:'bruno@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Alex',
      email:'alex@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Sandro',
      email:'sandro@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Paulo',
      email:'paulo@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Renato',
      email:'renato@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Pedro',
      email:'pedro@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Petter',
      email:'petter@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Ana',
      email:'ana@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Claudia',
      email:'claudia@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Claudio',
      email:'claudio@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Daniel',
      email:'daniel@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Fulano',
      email:'fulano@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Jorge',
      email:'jorge@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Armany',
      email:'armany@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Jorge',
      email:'jorge@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Silvio',
      email:'silvio@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Flavia',
      email:'flavia@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Patricia',
      email:'patricia@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Amado',
      email:'amado@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Bene',
      email:'bene@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Gabriel',
      email:'gabriel@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Gustavo',
      email:'gustavo@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Gil',
      email:'gil@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Marcel',
      email:'marcel@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
    {
      name:'Miro',
      email:'miro@gmail.com',
      password:await bcrypt.hash('123456', 8),
      situationId:4,
      createdAt:new Date(),
      updatedAt:new Date()
    },
  ])
  },

  async down (queryInterface, Sequelize) {

  }
};
