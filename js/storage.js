export function initOfflineHandler() {
    window.addEventListener('online', () => {
        showNetworkStatusNotification(true);
        syncOfflineRatings(); 
    });

    // Evento cuando se pierde la conexión por completo
    window.addEventListener('offline', () => {
        showNetworkStatusNotification(false);
    });
}


export function saveAlbumRating(albumId, rating) {
    let ratings = JSON.parse(localStorage.getItem('album_ratings')) || {};
    ratings[albumId] = rating;
    localStorage.setItem('album_ratings', JSON.stringify(ratings));

    if (!navigator.onLine) {
        let offlineQueue = JSON.parse(localStorage.getItem('offline_ratings_queue')) || [];
        
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
        sendRatingToServer(albumId, rating);
    }
}

async function syncOfflineRatings() {
    let offlineQueue = JSON.parse(localStorage.getItem('offline_ratings_queue')) || [];
    if (offlineQueue.length === 0) return;

    console.log(`[Sync] Detectadas ${offlineQueue.length} calificaciones pendientes. Sincronizando...`);

    const itemsToSync = [...offlineQueue];
    localStorage.removeItem('offline_ratings_queue');

    for (const item of itemsToSync) {
        try {
            await sendRatingToServer(item.albumId, item.rating);
        } catch (error) {
            console.error(`[Sync] Falló la sincronización para el álbum ${item.albumId}. Reencolando...`);
            let currentQueue = JSON.parse(localStorage.getItem('offline_ratings_queue')) || [];
            currentQueue.push(item);
            localStorage.setItem('offline_ratings_queue', JSON.stringify(currentQueue));
        }
    }
}


async function sendRatingToServer(albumId, rating) {
    const token = localStorage.getItem('auth_token');
    
    console.log(`[API] Enviando al servidor: Álbum ID ${albumId} -> ${rating} Estrellas. Token: ${token}`);
    
    return new Promise((resolve) => setTimeout(resolve, 500));
}


function showNetworkStatusNotification(isOnline) {
    console.log(isOnline ? "🟢 Volvió el internet!" : "🔴 Te quedaste sin conexión.");
    
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

export function getAlbumRating(albumId) {
    const ratings = JSON.parse(localStorage.getItem('album_ratings')) || {};
    return ratings[albumId] || 0;
}