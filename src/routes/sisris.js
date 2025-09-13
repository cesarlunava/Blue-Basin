const express = require('express');
const router = express.Router();
const {isLoggedIn, isNotLoggedIn} = require('../lib/logueado');
const pool = require('../views/database');
const keys = require('../views/keys');
const fs = require('fs');
const path = require('path');
const rawBodyMiddleware = express.raw({ type: 'image/jpeg', limit: '5mb' });

router.get('/panel/:id', async(req, res) => { //isLoggedIn
  const {id} = req.params;
  const [links] = await pool.query('SELECT * FROM sistemas WHERE id = ?', [id]);
  console.log(links[0]);
  const [irrigation] = await pool.query('SELECT * FROM irrigation_schedules ORDER BY id DESC LIMIT 1;');
  res.render('links/add', {links: links[0], irrigation: irrigation[0]}); 
});

router.get('/data', async (req, res) => {
  try{
    const [data] = await pool.query('SELECT id, temp, hum, n, p, k, ec, ph, soil_temp, soil_hum FROM sistemas WHERE id = 1');
    res.json(data);
  } catch{
    res.status(500).json({error: "Error al obtener datos"});
  }
});

router.post('/receive', async (req, res) => {
  const { id, clavedemodelo, temp, hum, n, p, k, ec, ph, soil_temp, soil_hum} = req.body;
  console.log(id, clavedemodelo, temp, hum, n, p, k, ec, ph, soil_temp, soil_hum);
  try {
    const [[{clavedemodelo: dbClaveDeModelo}]] = await pool.query('SELECT clavedemodelo FROM sistemas WHERE id = ?', [id]);
    if (clavedemodelo === dbClaveDeModelo) {
      await pool.query('UPDATE sistemas SET temp=?, hum=?, n=?, p=?, k=?, ec=?, ph=?, soil_temp=?, soil_hum=? WHERE id = ? AND clavedemodelo = ?', 
        [temp, hum, n, p, k, ec, ph, soil_temp, soil_hum, id, clavedemodelo]);
      return res.send(" Datos actualizados");
    } else {
      return res.status(403).send(" Clave de modelo no coincide");
    }
  } catch(err) {
    console.error(err);
    return res.status(500).send(" Error del servidor");
  }
});

router.post("/upload", rawBodyMiddleware, (req, res) => {
  const filePath = path.join(__dirname, "../public/last.jpg");
  fs.writeFileSync(filePath, req.body);
  console.log("Imagen recibida y guardada en last.jpg");
  res.send("OK");
});

router.get("/last.jpg", (req, res) => {
  const filePath = path.join(__dirname, "../public/last.jpg");
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("No image yet");
  }
});

router.post('/panel/:id', async (req, res) => { //isLoggedIn
  const { id } = req.params;
  const {estatus} = req.body;
  await pool.query('UPDATE sistemas SET estatus = ? WHERE id = 1', [estatus]);
  res.redirect('/sisris/panel/1');

  

  /*try {
    const [[{usuario_id}]] = await pool.query('SELECT usuario_id FROM sistemas WHERE id = ?', [id]);
    const [[{permisos} = {}]] = await pool.query('SELECT permisos FROM invitaciones WHERE sisri_id = ?', [id]);
    if(usuario_id === req.user.id || permisos === 1){
      await pool.query('UPDATE sistemas SET estatus = ? WHERE id = ?', [estatus, id]);
      req.flash('success', 'Se ha registrado el comando correctamente');
      console.log('Comando ingresado:', estatus);
      res.redirect('/sisris/panel/'+id);
    }else{
      req.flash('message', 'No cuenta con permisos de riego');
      res.redirect('/sisris/panel/'+id);
    }
  } catch (err) {
    console.error('Error al insertar comando:', err);
    req.flash('error', 'Hubo un problema al registrar el comando');
  }*/
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
  try {
    // Obtener datos del usuario
    const [[{nombre, apellido, email}]] = await pool.query(
      'SELECT nombre, apellido, email FROM usuarios WHERE id = ?', 
      [req.user.id]
    );

    // Inicializar variables para los datos a mostrar
    let sisri = null;
    let invitado_a = null;

    // Verificar si el usuario es jefe de algún sistema
    const [jefeResult] = await pool.query(
      'SELECT usuario_id FROM sistemas WHERE usuario_id = ?', 
      [req.user.id]
    );

    if (jefeResult.length > 0) {
      const [sisriResult] = await pool.query(
        'SELECT * FROM sistemas WHERE usuario_id = ?', 
        [req.user.id]
      );
      sisri = sisriResult;
    }

    // Verificar invitaciones del usuario
    const [invitaciones] = await pool.query(
      'SELECT estatus, sisri_id FROM invitaciones WHERE receptor = ? AND receptor_apellido = ? AND receptor_email = ?',
      [nombre, apellido, email]
    );

    if (invitaciones.length > 0) {
      const {estatus, sisri_id} = invitaciones[0];
      
      if (estatus == 1) {
        const [invitadoResult] = await pool.query(
          'SELECT * FROM sistemas WHERE id = ?', 
          [sisri_id]
        );
        invitado_a = invitadoResult;
      }
    }

    // Renderizar la vista con ambos conjuntos de datos
    res.render('links/list', {
      sisri: sisri,
      invitado_a: invitado_a,
      // Opcional: agregar flags para facilitar el manejo en la vista
      esJefe: sisri !== null,
      esInvitado: invitado_a !== null
    });

  } catch (err) {
    console.error('Error en la ruta principal:', err);
    
    // Renderizar vista vacía o de error
    res.render('links/list', {
      sisri: null,
      invitado_a: null,
      esJefe: false,
      esInvitado: false,
      error: 'Ocurrió un error al cargar los datos'
    });
  }
});

router.get('/invitar/:id', async (req, res) => {
  const {id} = req.params;
  const [[{usuario_id}]] = await pool.query('SELECT usuario_id FROM sistemas WHERE id = ?', [id]);
  if (usuario_id == req.user.id){
    const [links] = await pool.query('SELECT * FROM sistemas WHERE id = ?', [id]);
    res.render('links/invitar', {links: links[0]});
  } else{
    req.flash('message', 'Solo el propietario puede añadir colaboradores');
    res.redirect('/sisris/panel/'+id);
  }
});

router.post('/invitar/:id', async (req, res) => {
  //Añadir autenticación de dueño
  const {id} = req.params;
  const [[{nombre: sisriNombre}]] = await pool.query('SELECT nombre FROM sistemas WHERE id = ?', [id]);
  const [[{nombre: emisorNombre}]] = await pool.query('SELECT nombre FROM usuarios WHERE id = ?', [req.user.id]) 
  const {receptor, receptor_apellido, receptor_email, permisos} = req.body;
  const newInvite = {
    emisor: emisorNombre,
    sisri: sisriNombre,
    sisri_id: id,
    receptor,
    receptor_apellido,
    receptor_email,
    permisos
  }
  try{
    await pool.query('INSERT INTO invitaciones SET ?', [newInvite]);
    req.flash('success', 'Se ha enviado la invitación');
    res.redirect('/sisris/panel/'+id);
  } catch(err){
    console.error('Error al enviar invitación: ', err);
    req.flash('message', 'Hubo un error: ', err, 'comuníquese con soporte');
  }
});

router.post('/aceptar/:id', async (req, res) => {
  const {id} = req.params;
  const {estatus} = req.body;
  await pool.query('UPDATE invitaciones SET estatus = ? WHERE id = ?', [estatus, id]);
  req.flash('success', 'Ya ha aceptado la invitación, ahora puede acceder al cultivo desde la pestaña "Servicios"');
  res.redirect('/profile');
});

router.post('/api-relay-state', async (req, res) => { 
  try {
    const { id, clavedemodelo } = req.body;
    const estado = await pool.query(
      'SELECT estatus FROM sistemas WHERE id = ? AND clavedemodelo = ?',
      [id, clavedemodelo]
    );

    if (estado.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    console.log('Estado enviado: ', estado[0]);
    res.json(estado[0]);

  } catch (err) {
    console.error('Error al consultar estado: ', err);
    res.status(500).json({ error: 'Error al consultar estado' });
  }
});

module.exports = router;