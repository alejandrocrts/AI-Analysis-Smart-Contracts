const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function analizarVulnerabilidadesGPT4(codigo) {
  const prompt = `Eres un experto en seguridad de smart contracts. Analiza el siguiente código Solidity para detectar vulnerabilidades y proporciona recomendaciones breves y precisas para mitigarlas´.
  
Código:
${codigo}`;
  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "openai/gpt-4o-mini-2024-07-18",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1144
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_GPT4_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    console.log("Respuesta GPT-4:", response.data);
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const contenido = response.data.choices[0].message.content;
      return contenido && contenido.trim() !== "" ? contenido : "No se obtuvo respuesta útil para el análisis.";
    }
    return "No se obtuvo respuesta útil para el análisis.";
  } catch (err) {
    console.error("Error en análisis GPT-4:", err);
    return "Error en el análisis de vulnerabilidades con GPT-4.";
  }
}

async function analizarVulnerabilidadesDeepseek(codigo) {
  const prompt = `Analiza el siguiente código Solidity en busca de vulnerabilidades de seguridad utilizando Deepseek. Identifica posibles fallos y riesgos, y proporciona recomendaciones para mitigarlos.
  
Código:
${codigo}`;
  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "deepseek/deepseek-chat", 
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 2000
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    console.log("Respuesta Deepseek:", response.data);
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content || "No se obtuvo respuesta útil para el análisis.";
    }
    return "No se obtuvo respuesta útil para el análisis.";
  } catch (err) {
    console.error("Error en análisis Deepseek:", err);
    return "Error en el análisis de vulnerabilidades con Deepseek.";
  }
}

async function analizarVulnerabilidadesGemini(codigo) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});
  
  const prompt = `Analiza el siguiente código Solidity en busca de vulnerabilidades de seguridad. Proporciona una clasificación detallada de las debilidades detectadas y recomendaciones para mitigarlas.

Código:
${codigo}`;
  try{
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Respuesta Gemini: ", text)
    return text;
  }catch(err){
    console.error("Error en análisis Gemini", err)
    return "Error en en análisis de vulnerabilidades con Gemini";
  }

}


module.exports = { 
  analizarVulnerabilidadesGPT4, 
  analizarVulnerabilidadesDeepseek, 
  analizarVulnerabilidadesGemini 
};
