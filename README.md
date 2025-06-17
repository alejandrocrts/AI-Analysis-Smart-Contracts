# 🔐 Ethereum Smart‑Contract Analyzer

Esta herramienta permite analizar contratos inteligentes desplegados en Ethereum utilizando modelos de inteligencia artificial avanzados como ChatGPT, Gemini y DeepSeek. Incluye recolección de contratos auditados desde Etherscan, descarga de contratos desde GitHub y análisis mediante una interfaz web intuitiva.

---

## 🚀 Funcionalidades principales

### 1. Recolección de datos

* **Scraping de contratos auditados desde Etherscan**: se obtienen contratos verificados, auditados, con balance > 0 y al menos 750 transacciones.
* **Descarga de contratos desde GitHub** mediante su API pública, obteniendo archivos `.sol` (Solidity) de repositorios públicos.

### 2. Interfaz Web para análisis

Disponible en `http://localhost:3000`, permite:

* 📥 Introducir la dirección de un contrato para extraer su información contextual.
* ✍️ Pegar código fuente Solidity para analizar su seguridad.
* 📁 Cargar un archivo `.txt` con direcciones de contratos para realizar análisis en lote (información contextual + análisis de vulnerabilidades).

### 3. Análisis con IA

El usuario puede seleccionar uno de los siguientes modelos para realizar auditoría automatizada:

* 🔍 **ChatGPT (GPT-4.1)** – Azure OpenAI
* 🔬 **Gemini (2.5 Pro)** – Google Generative Language API
* 🛡️ **DeepSeek-R1** – Azure ML Services

Los resultados incluyen:

* Vulnerabilidades detectadas (con severidad)
* Descripción técnica
* Recomendaciones de mitigación

---

## 🧩 Estructura del proyecto

```
├── app
│   ├── public            # Recursos estáticos
│   ├── routes            # Rutas del backend Express
│   ├── services          # Lógica de integración IA y Etherscan
│   └── views             # Plantillas EJS para la interfaz web
├── Extracción GitHub
│   └── git_contracts.py  # Script para extraer contratos desde GitHub
├── Scrapping
│   ├── drivers/          # Chromedriver para Selenium
│   └── scrap_etherscan.py# Script scraping Etherscan (con Cloudflare bypass)
├── .gitignore            # Ignorar .env y otros archivos
├── README.md             # Este archivo
├── package.json          # Dependencias y configuración Node.js
└── server.js             # Servidor principal Express
```

---

## ⚙️ Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/ai-smart-contract-audit.git
cd ai-smart-contract-audit
```

### 2. Backend Node.js (análisis IA)

```bash
npm install
pip install requests beautifulsoup4 python-dotenv selenium
node server.js
```

La interfaz estará disponible en: [http://localhost:3000](http://localhost:3000)

### 3. Configurar `.env`

```env
GITHUB_API_KEY=TU_API_KEY
OPENAI_API_KEY=TU_API_KEY
GEMINI_API_KEY=TU_API_KEY
DEEPSEEK_API_KEY=TU_API_KEY
ETHERSCAN_API_KEY=TU_API_KEY
```

### 4. Extracción desde Etherscan

```bash
python .\Scrapping\scrap_etherscan.py
```

### 5. Extracción desde GitHub

```bash
python '.\Extraccion GitHub\git_contracts.py'
```

---

## 🧠 Tecnologías utilizadas

* **Node.js + Express** – Servidor y lógica de análisis
* **EJS + CSS** – Interfaz web
* **Python 3.13** – Extracción de contratos
* **Selenium + BeautifulSoup** – Scraping con bypass de Cloudflare
* **APIs de IA** – OpenAI, Gemini, DeepSeek

---

## 📂 Datos de entrada

* Contratos desde GitHub: `github_contracts/*.sol`
* Direcciones auditadas desde Etherscan: `contratos_auditados.txt`

---

## 🧪 Ejemplo de uso

1. Ejecutar el backend con `node server.js`
2. Abrir la interfaz en `http://localhost:3000`
3. Seleccionar una de las siguientes opciones:

   * Información de Contrato (consulta en vivo a Etherscan)
   * Análisis de Vulnerabilidades (pegar código fuente para análisis personalizado)
   * Analizar Lote de Contratos (introducir direcciones (`.txt`) y lanzar análisis en lote)
4. Visualizar resultados con explicación, severidad y mitigación

---

## 🔐 Seguridad

* El archivo `.env` está protegido en `.gitignore`
* No se almacenan datos sensibles de los contratos

---

## 📝 Licencia

Este proyecto ha sido desarrollado con fines educativos como parte de un Trabajo de Fin de Grado. Uso comercial no permitido sin autorización previa.

---

## ✒️ Autor

* 👤 Alejandro [GitHub](https://github.com/alejandrocrts)
* 🎓 Universidad de Málaga – Ingeniería Informática

