import { getAlbumRating, saveAlbumRating } from '../storage.js';

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

    const favorites = getFavorites();

    container.innerHTML = `
        <div class="section-header">
            <h2>Mis Favoritos</h2>
        </div>
        <div class="carousel-wrapper" id="favorites-carousel">
            ${favorites.length === 0 ? `
                <p style="color: #a2a2ad; padding: 20px;">No tienes canciones favoritas guardadas.</p>
            ` : favorites.map(track => {
                const userRating = getAlbumRating(track.id);
                
                let starsHTML = '';
                for (let i = 1; i <= 5; i++) {
                    starsHTML += `<span class="star-rating ${i <= userRating ? 'active' : ''}" data-value="${i}">★</span>`;
                }

                return `
                    <div class="media-card" data-id="${track.id}">
                        <div class="card-img-container">
                            <img src="${track.cover}" alt="${track.title}">
                            <button class="heart-btn is-active" data-id="${track.id}">♥</button>
                            <div class="play-hover-btn">▶</div>
                        </div>
                        <h3 class="card-title">${track.title}</h3>
                        <p class="card-artist">${track.artist}</p>
                        <div class="stars-container" data-id="${track.id}">
                            ${starsHTML}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    // Asignar eventos a los corazones
    container.querySelectorAll('.heart-btn').forEach(btn => {
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

    // Asignar eventos de reproducción a las tarjetas de favoritos
    container.querySelectorAll('.play-hover-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const trackId = btn.closest('.media-card').getAttribute('data-id');
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

            // Actualizar UI en favoritos
            const siblings = star.parentElement.querySelectorAll('.star-rating');
            siblings.forEach(sib => {
                const val = parseInt(sib.getAttribute('data-value'));
                sib.classList.toggle('active', val <= rating);
            });

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