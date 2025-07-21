const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/logueado');
const pool = require('../views/database');


router.get('/auth', isNotLoggedIn, (req, res)=> {
    res.render('../views/auth/regislog');
});

router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
        successRedirect: '/profile',
        failureRedirect: '/auth',
        failureFlash: true
    })
);

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.login', {
        successRedirect: '/profile',
        failureRedirect: '/auth',
        failureFlash: true
    })(req, res, next);
});

router.get('/profile', isLoggedIn, async(req, res) => {
    const [rows] = await pool.query('SELECT nombre, apellido, email FROM usuarios WHERE id = ?', [req.user.id]);
    const {nombre, apellido, email} = rows[0];
    const [invitaciones] = await pool.query(
        'SELECT * FROM invitaciones WHERE receptor = ? AND receptor_apellido = ? AND receptor_email = ?', [nombre, apellido, email]);
    res.render('../views/profile', {invitaciones});
});        

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut(function(err) {
        if (err) {return next(err); }
        res.redirect('/auth');
    });
});

module.exports = router;