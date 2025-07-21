const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../views/database');
const helpers = require('../lib/helpers');

passport.use('local.login', new LocalStrategy({
    usernameField: 'nombre',
    passwordField: 'password',
    passReqToCallback: true,
}, async (req,nombre, password, done) => {
    console.log(req.body);
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre]);
    if (rows.length > 0) {
        const usuario = rows[0];
        const validPassword = await helpers.matchPassword(password, usuario.password);
        if (validPassword) { 
            done(null, usuario, req.flash('success', 'Bienvenido ' + usuario.nombre));
        } else {
            done(null, false, req.flash('message', 'Contraseña incorrecta'));
        }
    } else {
        return done(null, false, req.flash('message', 'El usuario no existe'));
    }
    
}));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'nombre',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, nombre, password, done) => {
    const { apellido, email } = req.body;
    const newUsuario = {
        nombre,
        password,
        apellido,
        email
    };
    newUsuario.password = await helpers.encryptPassword(password);
    const [result] = await pool.query('INSERT INTO usuarios SET ?', [newUsuario]);
    newUsuario.id = result.insertId;
    console.log(result);
    return done(null, newUsuario);
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id)
    });

    passport.deserializeUser(async (id, done) => {
        const [rows] = await pool.query('SELECT * FROM usuarios WHERE id=?', [id]);
        done(null, rows[0]);
    });