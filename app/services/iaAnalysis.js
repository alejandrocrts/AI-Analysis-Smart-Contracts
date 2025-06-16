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
          { role: "system", content: "Actúa como un auditor experto en seguridad de contratos inteligentes escritos en Solidity. "},
          { role: "user", content: `Quiero que realices un análisis completo de seguridad del siguiente código fuente de un contrato inteligente. El objetivo es detectar vulnerabilidades reales, entender el riesgo asociado y obtener recomendaciones de mitigación. 1. Enumera de manera clara cada vulnerabilidad encontrada. 2. Para cada una, proporciona: - Clasificación de la severidad según el estándar de seguridad en contratos inteligentes (Critical, Major, Medium, Minor, Informational). - Descripción técnica de la vulnerabilidad.- Ubicación o fragmento de código afectado (si es posible). - Riesgo que representa en el entorno de la red Ethereum. - Propuesta de mitigación específica según buenas prácticas de seguridad en Solidity.Si no detectas vulnerabilidades relevantes, proporciona una breve explicación justificando por qué el contrato es considerado seguro según las prácticas actuales y la versión del compilador utilizada. Evita respuestas genéricas, ambiguas o poco fundamentadas.No inventes vulnerabilidades si no están presentes en el código.Es importante que seas crítico y técnico, no asumas que por ser código común es seguro.Contexto adicional:Este análisis se utilizará para contrastar resultados con auditorías profesionales publicadas en Etherscan, por lo tanto, la precisión, claridad y profesionalidad del análisis son clave. El código que vas a analizar pertenece a contratos ya desplegados y auditados, por lo que debes prestar especial atención a detalles que en otras circunstancias podrían pasarse por alto. Aquí el código Solidity a analizar:\n${codigo}` }
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
    content: 'Actúa como un auditor experto en seguridad de contratos inteligentes escritos en Solidity. '
  };
  const userMsg = {
    role:    'user',
    content: `Quiero que realices un análisis completo de seguridad del siguiente código fuente de un contrato inteligente. El objetivo es detectar vulnerabilidades reales, entender el riesgo asociado y obtener recomendaciones de mitigación. 1. Enumera de manera clara cada vulnerabilidad encontrada. 2. Para cada una, proporciona: - Clasificación de la severidad según el estándar de seguridad en contratos inteligentes (Critical, Major, Medium, Minor, Informational). - Descripción técnica de la vulnerabilidad.- Ubicación o fragmento de código afectado (si es posible). - Riesgo que representa en el entorno de la red Ethereum. - Propuesta de mitigación específica según buenas prácticas de seguridad en Solidity.Si no detectas vulnerabilidades relevantes, proporciona una breve explicación justificando por qué el contrato es considerado seguro según las prácticas actuales y la versión del compilador utilizada. Evita respuestas genéricas, ambiguas o poco fundamentadas.No inventes vulnerabilidades si no están presentes en el código.Es importante que seas crítico y técnico, no asumas que por ser código común es seguro.Contexto adicional:Este análisis se utilizará para contrastar resultados con auditorías profesionales publicadas en Etherscan, por lo tanto, la precisión, claridad y profesionalidad del análisis son clave. El código que vas a analizar pertenece a contratos ya desplegados y auditados, por lo que debes prestar especial atención a detalles que en otras circunstancias podrían pasarse por alto. Aquí el código Solidity a analizar:\n${codigo}`
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

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-05-06"});
  
  const prompt = `Actúa como un auditor experto en seguridad de contratos inteligentes escritos en Solidity. 
  Quiero que realices un análisis completo de seguridad del siguiente código fuente de un contrato inteligente. 
  El objetivo es detectar vulnerabilidades reales, entender el riesgo asociado y obtener recomendaciones de mitigación. 
  1. Enumera de manera clara cada vulnerabilidad encontrada. 2. Para cada una, proporciona: - Clasificación de la severidad según el estándar de seguridad en contratos inteligentes (Critical, Major, Medium, Minor, Informational). 
  - Descripción técnica de la vulnerabilidad.- Ubicación o fragmento de código afectado (si es posible). - Riesgo que representa en el entorno de la red Ethereum. 
  - Propuesta de mitigación específica según buenas prácticas de seguridad en Solidity.Si no detectas vulnerabilidades relevantes, proporciona una breve explicación justificando por qué el contrato es considerado seguro según las prácticas actuales 
  y la versión del compilador utilizada. Evita respuestas genéricas, ambiguas o poco fundamentadas.No inventes vulnerabilidades si no están presentes en el código.
  Es importante que seas crítico y técnico, no asumas que por ser código común es seguro.Contexto adicional: Este análisis se utilizará para contrastar resultados con auditorías profesionales publicadas en Etherscan, por lo tanto, 
  la precisión, claridad y profesionalidad del análisis son clave. El código que vas a analizar pertenece a contratos ya desplegados y auditados, por lo que debes prestar especial atención a detalles que en otras circunstancias podrían pasarse por alto. 
  Aquí el código Solidity a analizar:\n

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
