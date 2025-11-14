const database = require('../db');
const Sequelize = require('sequelize');
const Usuario = database.define('usuario', {
    id: {
        type: Sequelize.INTEGER, autoIncrement: true, allowNull: false,
        primaryKey: true
    },
    nome: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false },
    senha: { type: Sequelize.STRING, allowNull: true },
    foto: {type:Sequelize.STRING, allowNull: false},
    googleId: { type: Sequelize.STRING, allowNull: true }
})
module.exports = Usuario;