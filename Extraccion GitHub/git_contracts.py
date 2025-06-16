import os
import requests
from dotenv import load_dotenv

# Cargar API Key desde .env
load_dotenv()
GITHUB_API_KEY = os.getenv("GITHUB_API_KEY")

# Obtener la ruta absoluta del directorio donde se ejecuta el script
base_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(base_dir, "github_contracts")
os.makedirs(output_dir, exist_ok=True)

# Endpoint de GitHub para buscar archivos Solidity
GITHUB_SEARCH_URL = "https://api.github.com/search/code?q=extension:sol"

# Headers con autenticación para aumentar el límite de solicitudes
headers = {
    "Authorization": f"token {GITHUB_API_KEY}",
    "Accept": "application/vnd.github.v3+json"
}

# Realizar la solicitud a GitHub
response = requests.get(GITHUB_SEARCH_URL, headers=headers)
data = response.json()

if "items" in data:
    for item in data["items"][:30]:  # Limitar a 30 archivos
        file_url = item["html_url"].replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
        filename = os.path.join(output_dir, os.path.basename(file_url))

        # Descargar el contrato
        contract_response = requests.get(file_url)
        if contract_response.status_code == 200:
            with open(filename, "w", encoding="utf-8") as file:
                file.write(contract_response.text)
                print(f"Contrato guardado: {os.path.basename(filename)}")
        else:
            print(f"No se pudo descargar: {file_url}")
else:
    print("Error al obtener resultados de GitHub:", data)
