import { logout } from "./modules/auth.js";

const URL_BASE = 'https://api.deezer.com';

function pedirJSONP(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'deezerCb_' + Math.floor(Math.random() * 1000000);
    const script = document.createElement('script');

    // Callback global temporal
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      if (data.error) reject(new Error(data.error.message));
      else resolve(data);
    };

    // Inyectamos el script en el DOM
    script.src = `${url}&output=jsonp&callback=${callbackName}`;
    script.onerror = () => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('Error de red en JSONP'));
    };

    document.body.appendChild(script);

  });
}

export async function buscarCanciones(consulta) {
  const consultaLimpia = encodeURIComponent(consulta);
  const urlObjetivo = `${URL_BASE}/search?q=${consultaLimpia}`;

  try {
    const data = await pedirJSONP(urlObjetivo);
    return data.data || [];
  } catch (error) {
    console.error('No funcionó. Revisar conexión a internet:', error);
    return [];
  }
}

export async function buscarArtista(artista) {
  const consultaLimpia = encodeURIComponent(artista);
  const urlObjetivo = `${URL_BASE}/search?q=${consultaLimpia}`;

  try {
    const data = await pedirJSONP(urlObjetivo);
    return data.data || [];
  } catch(error) {
    console.error("No se encontro al artista");
    return []; 
  }
}

export async function obtenerTop() {
  const urlObjetivo = `${URL_BASE}/chart/0`;

  try {
    const data = await pedirJSONP(urlObjetivo);
    return data; 
  } catch (error) {
    console.error('Error al obtener el Top Chart de Deezer:', error);
    return null;
  }
}

