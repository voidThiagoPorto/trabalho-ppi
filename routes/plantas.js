var express = require('express');
var router = express.Router();

const plantaController = require("../controller/planta");

router.get("/", plantaController.index);
router.get("/criar", plantaController.create);
router.get("/edit/:id", plantaController.edit);
router.get("/remove/:id", plantaController.remove);

router.post("/store", plantaController.store);
router.post("/update", plantaController.update)
module.exports = router;