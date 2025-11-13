var express = require('express');
var router = express.Router();

const plantaController = require("../controller/planta");

router.get("/", plantaController.index);
router.get("/criar", plantaController.create);
router.post("/store", plantaController.store);
module.exports = router;