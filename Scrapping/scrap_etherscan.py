import os
import time
import tempfile
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

HTML_BYPASS = '''
<html>
<head>
  <style>
    body { font-family: Arial; background-color: #f0f0f0; display: flex; justify-content: center;
           align-items: center; height: 100vh; margin: 0; }
    a, button { font-size: 22px; margin: 10px; padding: 10px 20px; }
  </style>
</head>
<body>
  <div style="text-align:center;">
    <p><b>Abre Etherscan, resuelve captchas y pulsa el botón:</b></p>
    <a href="https://etherscan.io/contractsVerified/1?filter=audit&ps=100" target="_blank">Abrir Etherscan</a><br>
    <button id="clickTracker" value="not_clicked">✅</button>
  </div>
  <script>
    document.getElementById("clickTracker").addEventListener("click", function () {
        document.getElementById("clickTracker").value = "clicked";
    });
  </script>
</body>
</html>
'''

def lanzar_driver():
    options = Options()
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    options.add_argument("--disable-blink-features=AutomationControlled")
    service = Service("C:/Users/hp/Downloads/Scrap/drivers/chromedriver.exe")  

    driver = webdriver.Chrome(service=service, options=options)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".html", mode="w", encoding="utf-8") as f:
        f.write(HTML_BYPASS)
        html_path = f.name

    driver.get(f"file:///{html_path.replace(os.sep, '/')}")
    time.sleep(1)
    click_tracker = driver.find_element(By.ID, "clickTracker")
    while click_tracker.get_attribute("value") != "clicked":
        time.sleep(0.2)

    return driver

def extraer_contratos(driver, pagina):
    url = f"https://etherscan.io/contractsVerified/{pagina}?filter=audit&ps=100"
    driver.get(url)
    time.sleep(3)

    soup = BeautifulSoup(driver.page_source, "html.parser")
    tabla = soup.find("table")
    if not tabla:
        return []

    # Identificar posiciones de las columnas por nombre
    cabeceras = tabla.find_all("th")
    indices = {th.text.strip(): i for i, th in enumerate(cabeceras)}

    idx_direccion = indices.get("Address")
    idx_balance = indices.get("Balance")
    idx_txns = indices.get("Txns")

    if idx_direccion is None or idx_balance is None or idx_txns is None:
        print("No se pudieron encontrar las columnas necesarias.")
        return []

    contratos = []
    filas = tabla.find_all("tr")[1:]
    for fila in filas:
        columnas = fila.find_all("td")
        if len(columnas) <= max(idx_direccion, idx_balance, idx_txns):
            continue

        enlace = columnas[idx_direccion].find("a", href=True)
        if not enlace or "/address/" not in enlace["href"]:
            continue

        direccion = enlace["href"].split("/address/")[1].split("#")[0]

        balance_txt = columnas[idx_balance].text.strip().replace(" ETH", "").replace(",", "")
        txns_txt = columnas[idx_txns].text.strip().replace(",", "")

        try:
            balance = float(balance_txt)
            txns = int(txns_txt)
        except ValueError:
            continue

        if balance > 0 and txns > 750:
            contratos.append(direccion)

    return contratos


def main():
    NUM_PAGINAS = 5 

    driver = lanzar_driver()

    print("Extrayendo contratos...")
    todos = []
    for pagina in range(1, NUM_PAGINAS + 1):
        print(f"  - Página {pagina}")
        contratos = extraer_contratos(driver, pagina)
        todos.extend(contratos)
        time.sleep(1)
    driver.quit()

    # Eliminar duplicados
    todos = list(set(todos))

    script_dir = os.path.dirname(os.path.abspath(__file__))
    ruta_salida = os.path.join(script_dir, "contratos_auditados.txt")

    with open(ruta_salida, "w") as f:
        for direccion in todos:
            f.write(f"{direccion}\n")

    print(f"\n>> Se han guardado {len(todos)} contratos con balance > 0 en 'contratos_auditados.txt'.")

if __name__ == "__main__":
    main()
