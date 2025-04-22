const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Configurar motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views'));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'app/public')));
app.use(express.urlencoded({ extended: true }));

// Rutas
const contratosRouter = require('./app/routes/contratos');
app.use('/contratos', contratosRouter);

// Página principal
app.get('/', (req, res) => {
  res.render('index');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
