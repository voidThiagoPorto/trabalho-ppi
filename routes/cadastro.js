const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { Usuario } = require("../model/default");
var saltRounds =10;
router.get('/',function(req,res){
 res.render('auth/cadastro');
});
router.post('/',function(req,res){
 bcrypt.hash(req.body['senha'], saltRounds, function(err, hash) {
 const resultadoCadastro = Usuario.create({
 nome: req.body['nome'],
 senha: hash,
 email: req.body['email']
 })
 });
 res.redirect('/login');
});
module.exports = router;