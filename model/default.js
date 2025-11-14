let Planta = require("./planta");
let Usuario = require("./usuario");
const database = require('../db');
const Sequelize = require('sequelize');


Planta.belongsToMany(Usuario, {
    through: "curtida",

});
Usuario.belongsToMany(Planta, {
    through: "curtida",

});
module.exports = {
    Planta,
    Usuario,
    Curtida: database.models.curtida,
    database
}