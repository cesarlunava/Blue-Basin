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
    try {
        // Consulta el estado actual del relé en la base de datos
        const result = await pool.query('SELECT state FROM relays WHERE controller_id = "MEGA2560/2025"');
        
        if (result && result.length > 0) {
            // Devuelve solo el valor (1 o 0) sin formato JSON para simplificar el procesamiento en el ESP8266
            res.send(result[0].state.toString());
            console.log('ESP8266 consultó el estado:', result[0].state);
        } else {
            res.status(404).send('0'); // Si no hay datos, devuelve 0 (apagado) por defecto
        }
    } catch (err) {
        console.error('Error al consultar estado para ESP8266:', err);
        res.status(500).send('Error');
    }
});

module.exports = router;