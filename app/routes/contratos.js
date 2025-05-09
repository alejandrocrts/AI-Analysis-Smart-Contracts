const express = require('express');
const router = express.Router();
const etherscanService = require('../services/etherscanService');
const iaAnalysis = require('../services/iaAnalysis');

// Rutas normales
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

router.get('/analizar', (req, res) => {
  res.render('analizarManualmente');  
});

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

// Lote
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');

router.get('/analizar-lote', (req, res) => {
  res.render('analizarLote');
});

router.post('/analizar-lote', upload.single('archivo'), async (req, res) => {
  const filePath = req.file.path;
  const fs = require('fs');

  const direcciones = fs.readFileSync(filePath, 'utf-8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const proveedor = req.body.proveedor || "gpt4";
  const resultados = [];

  for (const direccion of direcciones) {
    try {
      const estado = await etherscanService.analyzeContractState(direccion);
      const rawInfo = await etherscanService.getRawContractInfo(direccion);
      const sourceCode = rawInfo?.SourceCode;

      if (!sourceCode || sourceCode.trim() === "" || sourceCode.includes("Contract source code not verified")) {
        resultados.push({
          direccion,
          ...estado,
          analisisVulnerabilidades: "Contrato no verificado en Etherscan. No se puede obtener el código fuente."
        });
        continue;
      }

      let codigo = sourceCode;
      try {
        if (codigo.trim().startsWith("{")) {
          const jsonParsed = JSON.parse(codigo);
          const primerArchivo = Object.values(jsonParsed.sources || {})[0];
          if (primerArchivo?.content) {
            codigo = primerArchivo.content;
          }
        }
      } catch (err) {
        console.warn(`⚠ Error parseando código como JSON en ${direccion}`);
      }

      if (!codigo || codigo.trim() === "") {
        resultados.push({
          direccion,
          ...estado,
          analisisVulnerabilidades: "No se pudo extraer código válido tras parseo."
        });
        continue;
      }

      // Análisis según proveedor
      let analisis = "";
      if (proveedor === 'gpt4') {
        analisis = await iaAnalysis.analizarVulnerabilidadesGPT4(codigo);
      } else if (proveedor === 'deepseek') {
        analisis = await iaAnalysis.analizarVulnerabilidadesDeepseek(codigo);
      } else if (proveedor === 'gemini') {
        analisis = await iaAnalysis.analizarVulnerabilidadesGemini(codigo);
      } else {
        analisis = "Proveedor no reconocido.";
      }

      resultados.push({
        direccion,
        ...estado,
        analisisVulnerabilidades: analisis || "No se pudo realizar el análisis."
      });

    } catch (err) {
      console.error(`❌ Error procesando ${direccion}:`, err);
      resultados.push({
        direccion,
        analisisVulnerabilidades: "Error interno al procesar esta dirección."
      });
    }
  }

  res.render('resultados', { resultados, analisisVuln: "ambos" });
});

module.exports = router;
