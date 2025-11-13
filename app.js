var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const session = require('express-session');
const handlebars = require("express-handlebars");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
const cadastroRouter = require('./routes/cadastro');
const plantaRouter = require('./routes/plantas');


var app = express();

// view engine setup
app.engine(".hbs", handlebars.engine({extname: ".hbs"}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', ".hbs");

//session configurar
require('./auth')(passport);
const MySQLStore = require('express-mysql-session')(session);
app.use(session({
  store: new MySQLStore({
    host: 'localhost', port: '3306', user: "root", password: "",
    database: "node"
  }),
  secret: '2C44-4D44-WppQ38S',//configure um segredo seu aqui,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 60 * 1000 }//30min
}))
app.use(passport.initialize());
app.use(passport.session())

//configurar coisa randola
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//middleware de autenticacao
function authenticationMiddleware(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login?erro=1');
}

//user em templates
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

//rotas
app.use('/', indexRouter);
app.use('/user', authenticationMiddleware, usersRouter);
app.use('/login', loginRouter);
app.use('/cadastro', cadastroRouter);
app.use('/planta', authenticationMiddleware, plantaRouter);


//passport authenticate("google")
app.get("/auth/google", passport.authenticate("google", {
  scope:
    ["openid", "profile", "email"]
}));
app.get("/auth/google/callback", passport.authenticate("google",
  {failureRedirect: "/login" }), (req, res) => {
    //successful authentication, redirect home
    res.redirect('/');
  });

//rota de logout TODO: POST
app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.get('/test', (req, res) => {
  const title = "teste";
  res.render("teste/teste", { title: title, layout: false })
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;