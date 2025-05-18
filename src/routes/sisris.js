const express = require('express');
const router = express.Router();

const pool = require('../views/database');

router.get('/add', (req, res) => {
    res.render('links/add'); 
});

router.post('/add', async (req, res) => {
  const { onoff } = req.body; 
  try { 
    await pool.query('UPDATE relays SET state = ? WHERE controller_id = "MEGA2560/2025"', [onoff]);
    req.flash('success', 'Se ha registrado el comando correctamente');
    console.log('Comando ingresado:', onoff);
  } catch (err) {
    console.error('Error al insertar comando:', err);
    req.flash('error', 'Hubo un problema al registrar el comando');
  }
});

router.get('/api-relay-state', async (req, res) => {
    try{
      const estado = await pool.query('SELECT state FROM relays WHERE controller_id = "MEGA2560/2025"');
      console.log('Estados enviado: ', estado);
      res.json(estado[0])
    } catch(err) {
      console.error('Error al consultar estado: ', err);
      res.status(500).json({error: 'Error al consultar estado' });
    }
});

module.exports = router;