# 🔐 Ethereum Smart‑Contract Analyzer

> Un panel web interactivo para extraer, inspeccionar y analizar vulnerabilidades de smart‑contracts en Ethereum usando IA (GPT‑4, DeepSeek, Gemini) y Etherscan.

---

## 🌟 Características

- **Análisis de Vulnerabilidades**  
  - Input de código Solidity manual  
  - Selección de proveedor IA:  
    - OpenRouter GPT‑4  
    - OpenRouter DeepSeek  
    - Gemini AI  
  - Resalta cada vulnerabilidad en **negrita** y formatea la explicación para fácil lectura

- **Estado de Contrato**  
  - Consulta por dirección:  
    - Nombre del contrato  
    - Versión de compilador, optimización, EVM, proxy, licencia…  
    - Saldo actual (ETH)  
    - Número total de transacciones  
    - Creador y TxHash de despliegue  

- **Visualización Web**  
  - Interfaz moderna con degradados, tarjetas semitransparentes y transiciones suaves  
  - Menú principal con accesos rápidos  
  - Formularios responsivos y botones animados  


- **Despliegue Fácil**  
  - Configuración con `.env`  
  - Compatible con Heroku, Vercel, Railway, etc.  

---

## 🛠️ Tecnologías

- **Backend:**  
  - Node.js + Express  
  - Axios para llamadas HTTP  
  - `@google/generative-ai` para Gemini  
  - `dotenv` para variables de entorno  

- **Frontend (SSR con EJS):**  
  - HTML5, CSS3 (Flexbox, Gradientes, Transiciones)  
  - [EJS](https://ejs.co/) para plantillas  
  - Diseño adaptado al estilo “cyber‑punk soft”  

- **Integraciones IA:**  
  - OpenRouter GPT‑4 (`openai/gpt-4o`)  
  - OpenRouter DeepSeek (`deepseek/deepseek-chat`)  
  - Google Gemini 1.5 (`gemini-1.5-flash`)  
---

## 🚀 Uso

1. En la Página Principal, elige Análisis de Vulnerabilidades.

2. Pega tu código Solidity y selecciona el proveedor IA.

3. Consulta tu contrato por su dirección para ver su estado y estadísticas.
