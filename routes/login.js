const express = require('express');
const router = express.Router();
const passport = require('passport');
router.get('/', (req, res, next) => {
    if (req.query.erro == 1)
        res.render('auth/login', { mensagem: 'É necessário realizar login' });
    else if (req.query.erro == 2)
        res.render('auth/login', { mensagem: 'Email e/ou senha incorretos!' });
    else
        res.render('auth/login', { mensagem: null });
});
router.post('/',
    passport.authenticate('local', {
        successRedirect: '/user', failureRedirect: '/login?erro=2'
    })
);
module.exports = router;