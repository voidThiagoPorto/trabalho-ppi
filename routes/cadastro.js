const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { Usuario } = require("../model/default");
const formidable = require("formidable");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

var saltRounds = 10;
router.get('/', function (req, res) {
    res.render('auth/cadastro');
});
router.post('/', function (req, res) {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err) throw err;
        const isEmailUsed = await Usuario.findOne({ where: { email: fields["email"] } });
        // const isNameUsed = await Usuario.findOne({ where: { nome: fields["nome"] } });
        if(isEmailUsed){
            res.redirect("/cadastro?erro=1");
            return;
        }
        const oldPath = files.foto[0].filepath;
        const hash = crypto.createHash("md5").update(Date.now().toString()).digest("hex");
        const ext = path.extname(files.foto[0].originalFilename);
        const newName = "/profile/" + hash + ext;
        const newPath = path.join(__dirname, "../public", newName);
        fs.rename(oldPath, newPath, (err) => {
            if (err) throw err;
        });
        bcrypt.hash(fields['senha'][0], saltRounds, function (err, hash) {
            const resultadoCadastro = Usuario.create({
                nome: fields['nome'][0],
                senha: hash,
                email: fields['email'][0],
                foto: newName
            })
        });
        res.redirect('/login');
        return;
    })

});
module.exports = router;