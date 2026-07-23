import { getAlbumRating, saveAlbumRating } from '../storage.js';

let currentSortOrder = 'none'; // 'none', 'desc', 'asc'

export function initFavorites() {
    const container = document.getElementById('favorites-section');
    if (!container) return;

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
        favorites.splice(index, 1);
        localStorage.setItem(`favorites_${usuarioActual}`, JSON.stringify(favorites));
        return false;
    } else {
        favorites.push({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            preview: track.preview
        });
        localStorage.setItem(`favorites_${usuarioActual}`, JSON.stringify(favorites));
        return true;
    }
}

export function isFavorite(trackId) {
    let favorites = getFavorites();
    return favorites.some(item => String(item.id) === String(trackId));
}

export function renderFavoritesPanel() {
    const container = document.getElementById('favorites-section');
    if (!container) return;

    let favorites = getFavorites();

    // Aplicar ordenamiento dinámico por estrellas
    if (currentSortOrder === 'desc') {
        favorites.sort((a, b) => getAlbumRating(b.id) - getAlbumRating(a.id));
    } else if (currentSortOrder === 'asc') {
        favorites.sort((a, b) => getAlbumRating(a.id) - getAlbumRating(b.id));
    }

    container.innerHTML = `
        <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <h2>Mis Favoritos</h2>
            <div class="favorites-filters">
                <select id="fav-sort-select" class="sort-select" title="Ordenar favoritos">
                    <option value="none" ${currentSortOrder === 'none' ? 'selected' : ''}>Sin ordenar</option>
                    <option value="desc" ${currentSortOrder === 'desc' ? 'selected' : ''}>Calificación (★ Max → Min)</option>
                    <option value="asc" ${currentSortOrder === 'asc' ? 'selected' : ''}>Calificación (★ Min → Max)</option>
                </select>
            </div>
        </div>
        <div class="favorites-list-wrapper">
            ${favorites.length === 0 ? `
                <p style="color: var(--dz-text-secondary); text-align: center; padding: 20px 0;">No tienes canciones favoritas guardadas.</p>
            ` : favorites.map(track => {
                const userRating = getAlbumRating(track.id);
                
                let starsHTML = '';
                for (let i = 1; i <= 5; i++) {
                    starsHTML += `<span class="star-rating ${i <= userRating ? 'active' : ''}" data-value="${i}">★</span>`;
                }

                return `
                    <div class="fav-track-row" data-id="${track.id}">
                        <div class="fav-track-left">
                            <button class="fav-row-play-btn" title="Reproducir">▶</button>
                            <img src="${track.cover}" alt="${track.title}" class="fav-track-cover">
                            <div class="fav-track-details">
                                <span class="fav-track-title">${track.title}</span>
                                <span class="fav-track-artist">${track.artist}</span>
                            </div>
                        </div>
                        <div class="fav-track-right">
                            <div class="stars-container" data-id="${track.id}">
                                ${starsHTML}
                            </div>
                            <button class="fav-row-heart-btn" data-id="${track.id}" title="Quitar de Favoritos">♥</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    // Asignar evento al selector de ordenamiento
    const sortSelect = container.querySelector('#fav-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSortOrder = e.target.value;
            renderFavoritesPanel();
        });
    }

    container.querySelectorAll('.fav-row-heart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackId = btn.getAttribute('data-id');
            const trackData = favorites.find(t => String(t.id) === String(trackId));
            if (trackData) {
                toggleFavorite(trackData);
                renderFavoritesPanel();

                // Actualizar corazones en el home (si existen)
                const homeHeart = document.querySelector(`.heart-btn[data-id="${trackId}"]`);
                if (homeHeart) {
                    homeHeart.classList.remove('is-active');
                    homeHeart.innerHTML = '♡';
                }
            }
        });
    });

    // Asignar eventos de reproducción a las filas
    container.querySelectorAll('.fav-row-play-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackId = btn.closest('.fav-track-row').getAttribute('data-id');
            const trackData = favorites.find(t => String(t.id) === String(trackId));
            if (trackData && trackData.preview) {
                window.playTrack(trackData.preview);
            }
        });
    });

    // Asignar eventos de calificación (estrellas)
    container.querySelectorAll('.star-rating').forEach(star => {
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            const rating = parseInt(star.getAttribute('data-value'));
            const trackId = star.parentElement.getAttribute('data-id');
            
            // Guardar calificación
            saveAlbumRating(trackId, rating);

            // Si hay un ordenamiento activo, re-renderizar todo el panel
            if (currentSortOrder !== 'none') {
                renderFavoritesPanel();
            } else {
                // Si no, actualizar solo la UI local de estrellas para no perder transiciones
                const siblings = star.parentElement.querySelectorAll('.star-rating');
                siblings.forEach(sib => {
                    const val = parseInt(sib.getAttribute('data-value'));
                    sib.classList.toggle('active', val <= rating);
                });
            }

            // Actualizar UI en home (si existe)
            const homeStars = document.querySelector(`.stars-container[data-id="${trackId}"]`);
            if (homeStars) {
                homeStars.querySelectorAll('.star-rating').forEach(sib => {
                    const val = parseInt(sib.getAttribute('data-value'));
                    sib.classList.toggle('active', val <= rating);
                });
            }
        });
    });
}





