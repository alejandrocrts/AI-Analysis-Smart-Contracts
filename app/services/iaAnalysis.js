const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai')
const ModelClient = require('@azure-rest/ai-inference').default;
const { AzureKeyCredential } = require('@azure/core-auth');
const { AzureOpenAi, AzureOpenAI } = require("openai");
require('dotenv').config();

async function analizarVulnerabilidadesGPT4(codigo) {
  const apiKey = process.env.GPT4_API_KEY;
  const apiVersion = "2024-04-01-preview";
  const endpoint = "https://ai-alecortes9542ai681074951528.openai.azure.com/";
  const modelName = "gpt-4.1";
  const deployment = "gpt-4.1";
  const options = { endpoint, apiKey, deployment, apiVersion }

  const azureClientOpenAI = new AzureOpenAI(options);
    try {
      const response = await azureClientOpenAI.chat.completions.create({
        messages: [
          { role: "system", content: "Eres un experto en seguridad de smart contracts. Identifica vulnerabilidades y sugiere mitigaciones. Analiza el siguiente código Solidity para detectar vulnerabilidades y proporciona recomendaciones breves y precisas para mitigarlas." },
          { role: "user", content: `Código Solidity:\n${codigo}` }
        ],
        max_tokens: 8192,
        model: modelName,
      });

    if (response?.error !== undefined && response.status !== "200") {
      console.error(response.error);
      throw response.error;
    }
    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("Error en análisis GPT-4 Azure:", err);
    return "Error en el análisis de vulnerabilidades con Azure GPT-4.";
  }
}

async function analizarVulnerabilidadesDeepseek(codigo) {
  const azureClientDeepseek = new ModelClient("https://ai-alecortes9542ai681074951528.services.ai.azure.com/models", 
    new AzureKeyCredential(process.env.DEEPSEEK_API_KEY));

  const systemMsg = {
    role:    'system',
    content: 'Eres un español experto en seguridad de smart contracts. Identifica vulnerabilidades y sugiere mitigaciones. Divide bien las vulnerabilidades para que sea visual'
  };
  const userMsg = {
    role:    'user',
    content: `Analiza el siguiente código Solidity para detectar vulnerabilidades y proporciona recomendaciones breves y precisas para mitigarlas.\n\n${codigo}`
  };

  try {
    const resp = await azureClientDeepseek
      .path('/chat/completions')
      .post({
        body: {
          model:      "DeepSeek-R1",
          messages:   [systemMsg, userMsg],
          max_tokens: 8192,
          temperature: 0.5
        }
      });

    if (resp.status !== '200') {
      console.error('DeepSeek API error:', resp.status, resp.body);
      return 'DeepSeek no devolvió contenido útil.';
    }

    const choice = resp.body.choices?.[0]?.message?.content || '';
    return choice.trim() || 'DeepSeek no devolvió contenido útil.';
  } catch (err) {
    console.error('Error en análisis DeepSeek:', err);
    return 'Error en el análisis de vulnerabilidades con DeepSeek.';
  }
}

async function analizarVulnerabilidadesGemini(codigo) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25"});
  
  const prompt = `Eres un experto en seguridad de smart contracts. Identifica vulnerabilidades y sugiere mitigaciones.
 Analiza el siguiente código Solidity para detectar vulnerabilidades y proporciona recomendaciones breves y precisas para mitigarlas.

Código:
${codigo}`;
  try{
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
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
