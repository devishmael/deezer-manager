/**
 * Inicializa los listeners globales para detectar cambios en la red (Online / Offline)
 */
export function initOfflineHandler() {
    // Evento cuando recuperamos la conexión a internet
    window.addEventListener('online', () => {
        showNetworkStatusNotification(true);
        syncOfflineRatings(); // Intentar vaciar la cola diferida
    });

    // Evento cuando se pierde la conexión por completo
    window.addEventListener('offline', () => {
        showNetworkStatusNotification(false);
    });
}

/**
 * Guarda una calificación de álbum de forma segura (Soporta Modo Offline)
 * Esta función la llamará tu compañero Ángel desde su módulo de favoritos
 */
export function saveAlbumRating(albumId, rating) {
    // 1. Guardar la calificación localmente para persistencia visual inmediata
    let ratings = JSON.parse(localStorage.getItem('album_ratings')) || {};
    ratings[albumId] = rating;
    localStorage.setItem('album_ratings', JSON.stringify(ratings));

    // 2. Control de Red: Verificamos si el usuario está conectado o no
    if (!navigator.onLine) {
        // MODO OFFLINE: Guardamos la petición en la cola diferida
        let offlineQueue = JSON.parse(localStorage.getItem('offline_ratings_queue')) || [];
        
        // Evitamos duplicar si ya estaba en cola, actualizando la nota
        const existingIndex = offlineQueue.findIndex(item => item.albumId === albumId);
        if (existingIndex !== -1) {
            offlineQueue[existingIndex].rating = rating;
            offlineQueue[existingIndex].timestamp = Date.now();
        } else {
            offlineQueue.push({ albumId, rating, timestamp: Date.now() });
        }
        
        localStorage.setItem('offline_ratings_queue', JSON.stringify(offlineQueue));
        console.warn(`[Offline] Calificación del álbum ${albumId} encolada localmente.`);
    } else {
        // MODO ONLINE: Se envía directamente a tu servidor personal
        sendRatingToServer(albumId, rating);
    }
}

/**
 * Sincronización Diferida: Envía todas las calificaciones acumuladas offline al servidor
 */
async function syncOfflineRatings() {
    let offlineQueue = JSON.parse(localStorage.getItem('offline_ratings_queue')) || [];
    if (offlineQueue.length === 0) return;

    console.log(`[Sync] Detectadas ${offlineQueue.length} calificaciones pendientes. Sincronizando...`);

    // Clonamos la cola para procesarla y vaciar el storage para evitar re-envíos duplicados
    const itemsToSync = [...offlineQueue];
    localStorage.removeItem('offline_ratings_queue');

    for (const item of itemsToSync) {
        try {
            await sendRatingToServer(item.albumId, item.rating);
        } catch (error) {
            console.error(`[Sync] Falló la sincronización para el álbum ${item.albumId}. Reencolando...`);
            // Si el servidor falla de verdad, lo devolvemos a la cola para no perder el dato
            let currentQueue = JSON.parse(localStorage.getItem('offline_ratings_queue')) || [];
            currentQueue.push(item);
            localStorage.setItem('offline_ratings_queue', JSON.stringify(currentQueue));
        }
    }
}

/**
 * Función auxiliar que conecta con tu servidor personal para impactar las notas
 */
async function sendRatingToServer(albumId, rating) {
    const token = localStorage.getItem('auth_token');
    
    // TODO: Cambiar por la URL real de tu endpoint de backend cuando lo tengan listo
    console.log(`[API] Enviando al servidor: Álbum ID ${albumId} -> ${rating} Estrellas. Token: ${token}`);
    
    // Simulación de petición fetch exitosa
    return new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * Opcional: Feedback visual rápido para alertar si se cayó o volvió el internet
 */
function showNetworkStatusNotification(isOnline) {
    console.log(isOnline ? "🟢 Volvió el internet!" : "🔴 Te quedaste sin conexión.");
    
    // Crear notificación visual bonita en pantalla
    let alertDiv = document.getElementById('network-alert');
    if (!alertDiv) {
        alertDiv = document.createElement('div');
        alertDiv.id = 'network-alert';
        alertDiv.className = 'network-alert-banner';
        document.body.appendChild(alertDiv);
    }
    alertDiv.textContent = isOnline ? "🟢 Conectado: Sincronizando cambios..." : "🔴 Modo sin conexión: Tus cambios se guardarán localmente";
    alertDiv.style.display = 'block';
    
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 4000);
}

/**
 * Obtiene la calificación de un álbum guardada localmente
 */
export function getAlbumRating(albumId) {
    const ratings = JSON.parse(localStorage.getItem('album_ratings')) || {};
    return ratings[albumId] || 0;
}