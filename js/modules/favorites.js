// Módulo de Favoritos - Gestión local y vinculación de UI

export function initFavorites() {
    const container = document.getElementById('favorites-section');
    if (!container) return;

    // Inicialización del panel de favoritos en el dashboard si es necesario
    renderFavoritesPanel();
}

export function getFavorites() {
    const usuarioActual = localStorage.getItem('usuario_actual') || 'default';
    return JSON.parse(localStorage.getItem(`favorites_${usuarioActual}`)) || [];
}

export function toggleFavorite(track) {
    const usuarioActual = localStorage.getItem('usuario_actual') || 'default';
    let favorites = getFavorites();
    const index = favorites.findIndex(item => String(item.id) === String(track.id));

    if (index !== -1) {
        // Eliminar
        favorites.splice(index, 1);
        localStorage.setItem(`favorites_${usuarioActual}`, JSON.stringify(favorites));
        return false; // Ya no es favorito
    } else {
        // Agregar
        favorites.push({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            preview: track.preview
        });
        localStorage.setItem(`favorites_${usuarioActual}`, JSON.stringify(favorites));
        return true; // Ahora es favorito
    }
}

export function isFavorite(trackId) {
    let favorites = getFavorites();
    return favorites.some(item => String(item.id) === String(trackId));
}

export function renderFavoritesPanel() {
    const container = document.getElementById('favorites-section');
    if (!container) return;

    const favorites = getFavorites();

    container.innerHTML = `
        <div class="favorites-panel-header">
            <h2>Mis Favoritos</h2>
        </div>
        <div class="favorites-list-container">
            ${favorites.length === 0 ? `
                <p class="empty-msg">No tienes canciones favoritas guardadas.</p>
            ` : favorites.map(track => `
                <div class="fav-item" data-id="${track.id}">
                    <img src="${track.cover}" alt="${track.title}" class="fav-cover">
                    <div class="fav-info">
                        <span class="fav-title">${track.title}</span>
                        <span class="fav-artist">${track.artist}</span>
                    </div>
                    <div class="fav-actions">
                        <button class="play-fav-btn" onclick="window.playTrack('${track.preview}')">▶</button>
                        <button class="remove-fav-btn" data-id="${track.id}">✕</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Asignar listeners
    container.querySelectorAll('.remove-fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            const item = favorites.find(f => String(f.id) === String(id));
            if (item) {
                toggleFavorite(item);
                renderFavoritesPanel();
                // Actualizar corazones en el dashboard
                const heart = document.querySelector(`.heart-btn[data-id="${id}"]`);
                if (heart) {
                    heart.classList.remove('is-active');
                    heart.innerHTML = '♡';
                }
            }
        });
    });
}