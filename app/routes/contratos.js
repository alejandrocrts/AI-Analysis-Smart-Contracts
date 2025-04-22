const express = require('express');
const router = express.Router();
const etherscanService = require('../services/etherscanService');
const iaAnalysis = require('../services/iaAnalysis');

router.get('/', (req, res) => {
  res.render('analizarEstado');  
});

router.post('/analizar-estado', async (req, res) => {
  try {
    const { direccion } = req.body;
    if (!direccion || !direccion.trim()) {
      return res.render('resultados', { resultados: [{ error: 'La dirección no puede estar vacía.' }], analisisVuln: false });
    }
    const resultado = await etherscanService.analyzeContractState(direccion);
    res.render('resultados', { resultados: [resultado], analisisVuln: false });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al analizar el estado del contrato");
  }
});


// Agrega esta ruta en app/routes/contratos.js
router.get('/analizar', (req, res) => {
  res.render('analizarManualmente');  
});

// Ruta POST que procesa el código ingresado manualmente y lo analiza
router.post('/analizar-manual', async (req, res) => {
  try {
    const { codigo, proveedor } = req.body;
    if (!codigo || !codigo.trim()) {
      return res.render('resultados', { resultados: [{ error: "El código no puede estar vacío." }], analisisVuln: true });
    }
    let analisis = "";
    if (proveedor === 'gpt4') {
      analisis = await iaAnalysis.analizarVulnerabilidadesGPT4(codigo);
    } else if (proveedor === 'deepseek') {
      analisis = await iaAnalysis.analizarVulnerabilidadesDeepseek(codigo);
    } else if (proveedor === 'gemini') {
      analisis = await iaAnalysis.analizarVulnerabilidadesGemini(codigo);
    } else {
      analisis = "Proveedor de análisis no reconocido.";
    }
    // Creamos un objeto resultado para mostrarlo en la vista
    const resultados = [{ 
      direccion: "Código ingresado manualmente",
      analisisVulnerabilidades: analisis
    }];
    res.render('resultados', { resultados, analisisVuln: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al analizar el código manualmente.");
  }
});

module.exports = router;
