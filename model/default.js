let Planta = require("./planta");
let Usuario = require("./usuario");

Usuario.hasMany(Planta);
Planta.belongsTo(Usuario);
Planta.belongsToMany(Usuario, {through: "curtida"});
Usuario.belongsToMany(Planta, {through: "curtida"});

module.exports = {
    Planta,
    Usuario
}