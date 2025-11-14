var express = require('express');
var router = express.Router();
const curtidaController = require("../controller/curtida");

/* GET home page. */
router.get('/adicionar/:id', curtidaController.adicionar);
router.get('/remover/:id', curtidaController.remover);

module.exports = router;