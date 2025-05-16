const express = require('express');
const morgan = require('morgan');
const { create } = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const passport = require('passport');

const {database} = require('./keys');
const {PORT} = require('./config')
const comandoRouter = require('../routes/sisris')
//inicializations
const app = express();
require('../lib/passport');

//settings
app.set('port', PORT);
app.set('views', path.join(__dirname));
const exphbs = create({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('../lib/handlebars')
});
app.engine('.hbs', exphbs.engine);
app.set('view engine', '.hbs');
//Middlewares
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
    secret: 'cesarclickcrop',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
}));
app.use(flash());
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
//global variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.message = req.flash('message');
    app.locals.usuario = req.usuario;
    next();
});
//Routes
app.use(require('../routes/index'));
app.use(require('../routes/authentication'));
app.use('/sisris', require('../routes/sisris'));
app.use('/comando', comandoRouter);
//Public
app.use(express.static(path.join(__dirname, 'public')));
//Start the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});