const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('../lib/logueado');


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

router.get('/profile', isLoggedIn, (req, res) => {
    res.render('../views/profile');
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logOut(function(err) {
        if (err) {return next(err); }
        res.redirect('/auth');
    });
});

module.exports = router;