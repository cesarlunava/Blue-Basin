const express = require('express');
const router = express.Router();
const {isLoggedIn} = require('../lib/logueado');

const pool = require('../views/database');

router.get('/panel/:id', isLoggedIn, async(req, res) => {
  const {id} = req.params;
  const [links] = await pool.query('SELECT * FROM sistemas WHERE id = ?', [id]);
  res.render('links/add', {links: links[0]}); 
});

router.post('/panel/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const {estatus} = req.body 
  try { 
    await pool.query('UPDATE sistemas SET estatus = ? WHERE id = ?', [estatus, id]);
    req.flash('success', 'Se ha registrado el comando correctamente');
    console.log('Comando ingresado:', estatus);
    res.redirect('/sisris/panel/'+id);
  } catch (err) {
    console.error('Error al insertar comando:', err);
    req.flash('error', 'Hubo un problema al registrar el comando');
  }
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const [links] = await pool.query('SELECT * FROM sistemas WHERE id = ?', [id]);
  res.render('links/formservice', {links: links[0]}); 
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
  const {id} = req.params;
  const {nombre, descripcion} = req.body;
  const newSISRI = {
    nombre,
    descripcion
  };
  await pool.query('UPDATE sistemas SET ? WHERE id = ?',[newSISRI, id]);
  req.flash('success', 'Se ha actualizado correctamente su servicio'); 
  res.redirect('/sisris');
});

router.get('/', isLoggedIn, async (req, res) => {
  const [sisri] = await pool.query ('SELECT * FROM sistemas WHERE usuario_id = ?', [req.user.id]);
  res.render('links/list', {sisri});
  console.log(sisri);
});

router.get('/api-relay-state', isLoggedIn, async (req, res) => {
    try{
      const estado = await pool.query('SELECT estatus FROM relays WHERE controller_id = "MEGA2560/2025"');
      console.log('Estados enviado: ', estado);
      res.json(estado[0]);
    } catch(err) {
      console.error('Error al consultar estado: ', err);
      res.status(500).json({error: 'Error al consultar estado' });
    }
});

module.exports = router;