const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;

const { Usuario } = require("./model/default");

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: '',
        clientSecret: '',
        callbackURL: "http://localhost:3000/auth/google/callback",
        scope: ["openid", "profile", "email"],
        passReqToCallback: true
    },
        async function (request, accessToken, refreshToken, profile, done) {
            try {
                var user = await Usuario.findOne({where: {id: profile.id}});
                if(!user){
                    user = await Usuario.create({
                        id: profile.id,
                        nome: profile.displayName,
                        email: profile.emails[0].value,
                        senha: null
                    })
                }
                return done(null, profile);
            } catch (err) {
                return done(err, null);
            }
            
        }
    ));
    //fodase
    async function findUser(email) {
        let dadosBanco = await Usuario.findAll({
            where: {
                email: email
            }
        });
        if (dadosBanco.length > 0)
            return dadosBanco[0];
        else
            return null
    }
    passport.serializeUser((user, done) => {
        if (user.provider === "google") {
            process.nextTick(function () {
                return done(null, { id: user.id, nome: user.displayName, foto: user.picture });
            })
        } else {
            process.nextTick(function () {
                return done(null, { id: user.id, nome: user.nome, foto: user.foto });
            })
        }
    })
    passport.deserializeUser(async (user, done) => {
        process.nextTick(function () {
            return done(null, user);
        });
    });
    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'senha' },
        async (email, senha, done) => {
            try {
                const user = await findUser(email);
                // usuário inexistente
                if (!user) { return done(null, false) }
                // comparando as senhas
                if(user.senha === null){
                    return done(null, false)
                }
                const isValid = bcrypt.compareSync(senha, user.senha);
                if (!isValid) return done(null, false)
                return done(null, user)
            } catch (err) {
                done(err, false);
            }
        }
    ));
}