const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/api';

async function getContractInfo(address) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: address,
        apikey: API_KEY
      }
    });
    const data = response.data;
    if (data.status === "1" && data.message === "OK" && data.result && data.result.length > 0) {
      let info = data.result[0];
      delete info.ABI;
      delete info.SourceCode;
      Object.keys(info).forEach(key => {
        if (typeof info[key] === "string" && info[key].trim() === "") {
          delete info[key];
        }
      });
      return info;
    }
    return null;
  } catch (err) {
    console.error("Error en getContractInfo:", err);
    return null;
  }
}

async function getRawContractInfo(address) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: address,
        apikey: API_KEY
      }
    });
    const data = response.data;
    if (data.status === "1" && data.message === "OK" && data.result && data.result.length > 0) {
      return data.result[0]; // Retorna la información completa, incluyendo SourceCode y ABI
    }
    return null;
  } catch (err) {
    console.error("Error en getRawContractInfo:", err);
    return null;
  }
}

async function getContractBalance(address) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: 'account',
        action: 'balance',
        address: address,
        tag: 'latest',
        apikey: API_KEY
      }
    });
    const data = response.data;
    if (data.status === "1" && data.message === "OK") {
      const balanceWei = parseInt(data.result);
      return balanceWei / 1e18;
    }
    return null;
  } catch (err) {
    console.error("Error en getContractBalance:", err);
    return null;
  }
}

async function getTransactionCount(address) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        sort: 'asc',
        apikey: API_KEY
      }
    });
    const data = response.data;
    if (data.status === "1" && data.message === "OK") {
      return data.result.length;
    }
    return 0;
  } catch (err) {
    console.error("Error en getTransactionCount:", err);
    return 0;
  }
}

async function getContractCreation(addresses) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        module: 'contract',
        action: 'getcontractcreation',
        contractaddresses: addresses.join(','),
        apikey: API_KEY
      }
    });
    const data = response.data;
    if (data.status === "1" && data.message === "OK" && data.result && data.result.length > 0) {
      return data.result.reduce((acc, curr) => {
        acc[curr.contractAddress] = curr;
        return acc;
      }, {});
    }
    return {};
  } catch (err) {
    console.error("Error en getContractCreation:", err);
    return {};
  }
}

async function analyzeContractState(manualAddress) {
  const info = await getContractInfo(manualAddress);
  const balance = await getContractBalance(manualAddress);
  const txCount = await getTransactionCount(manualAddress);
  // Llamamos a getContractCreation pasando la dirección en un arreglo
  const creationInfoObj = await getContractCreation([manualAddress]);
  const creationInfo = creationInfoObj[manualAddress] || null;
  return {
    direccion: manualAddress,
    info,
    balance,
    txCount,
    creacion: creationInfo
  };
}

module.exports = { 
  getContractInfo, 
  getRawContractInfo, 
  getContractBalance, 
  getTransactionCount, 
  getContractCreation, 
  analyzeContractState 
};
