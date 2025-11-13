const database = require('../db');
const Sequelize = require('sequelize');
const Planta = database.define('planta', {
    id: {
        type: Sequelize.INTEGER, autoIncrement: true, allowNull: false,
        primaryKey: true
    },
    nomeCientifico: {
        type: Sequelize.STRING, allowNull: false,
    },
    nomeComum: {
        type: Sequelize.STRING, allowNull: false,
    },
    guia: {
        type: Sequelize.STRING, allowNull: false,
    },
    foto: {
        type: Sequelize.STRING, allowNull: false,
    },
})
module.exports = Planta;