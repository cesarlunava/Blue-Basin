const express = require('express');
const router = express.Router();

const pool = require('../views/database');

router.get('/add', (req, res) => {
    res.render('links/add');
});

router.post('/add', async (req, res) => {
  const { onoff } = req.body; // recibimos el valor del botón presionado

  try {
    // Insertar en la tabla 'comandos' de la BD 'app_clickcrop'
    
    await pool.query('UPDATE relays SET state = ? WHERE controller_id = "MEGA2560/2025"', [onoff]);
    req.flash('success', 'Se ha registrado el comando correctamente');
    console.log('Comando ingresado:', onoff);
    res.redirect('/add');
  } catch (err) {
    console.error('Error al insertar comando:', err);
    req.flash('error', 'Hubo un problema al registrar el comando');
    res.redirect('/add');
  }
});
    

/*router.post('/add', async (req, res) => {
    const {on} = req.body;
    const newSISRI = {
        nombre,
        clavedemodelo
    };
    await pool.query('INSERT INTO sisris set ?', [newSISRI]);
    req.flash('success', 'Se ha registrado correctamente');
    console.log(newSISRI);
    res.send('received');
});

router.post('/', async (req, res) => {
    const usuarios = await pool.query('SELECT * FROM sisris');
    console.log(sisris);
    res.render('sisris/list', {sisris});
});*/

module.exports = router;