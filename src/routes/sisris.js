const express = require('express');
const router = express.Router();

const pool = require('../views/database');

router.get('/add', (req, res) => {
    res.render('links/add'); // renderiza el archivo 'add.hbs' alojado en la carpeta 'links' que contiene el forms
});

router.post('/add', async (req, res) => {
  const { onoff } = req.body; // recibimos el valor del botón presionado

  try {   
    await pool.query('UPDATE relays SET state = ? WHERE controller_id = "MEGA2560/2025"', [onoff]);
    req.flash('success', 'Se ha registrado el comando correctamente');
    console.log('Comando ingresado:', onoff);
    res.redirect('links/add');
  } catch (err) {
    console.error('Error al insertar comando:', err);
    req.flash('error', 'Hubo un problema al registrar el comando');
    res.redirect('links/add');
  }
});

router.get('/api/relay-state', async (req, res) => {
    const {controller_id} = req.query;

    try {
        // Consulta el estado actual del relé en la base de datos
        const [resultado] = await pool.query('SELECT state FROM relays WHERE controller_id = ?', [controller_id]);
        res.json(resultado[0]);
    } catch(err) {
      console.error('Error al consultar estado: ', err);
      res.status(500).json({error: 'Error al consultar estado' });
    }
  });

module.exports = router;