import { initAuth, checkSession, logout } from './modules/auth.js';
import { initSearch } from './modules/search.js';
import { initFavorites, isFavorite, toggleFavorite, renderFavoritesPanel } from './modules/favorites.js';
import { initOfflineHandler, saveAlbumRating, getAlbumRating } from './storage.js';
import { buscarCanciones, buscarArtista, obtenerTop } from './api.js';
import { renderProfile } from './modules/profile.js';

document.addEventListener('DOMContentLoaded', () => {
    // Aplicar tema guardado
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
    
    initOfflineHandler();

    if (checkSession()) {
        renderDashboard();
    } else {
        renderLogin();
    }
});

export function renderLogin() {
    const app = document.getElementById('app');
    initAuth();
}

export function renderDashboard() {
    const app = document.getElementById('app');
    
    const usuarioActual = localStorage.getItem('usuario_actual') || 'Usuario';
    const inicialUsuario = usuarioActual.charAt(0).toUpperCase();

    app.innerHTML = `
        <header class="main-header">
            <div class="header-left">
                <h1 class="logo-title">Deezer Manager</h1>
            </div>

            <div class="header-center">
                <div class="search-bar-wrapper">
                    <input type="text" id="main-search-input" class="search-input" placeholder="¿Qué quieres escuchar hoy?">
                </div>
            </div>

            <div class="header-right">
                <button id="theme-toggle-btn" class="theme-toggle-btn" title="Cambiar Tema">🌙</button>
                <div class="user-profile-btn" id="user-profile-btn" title="Ver Perfil">
                    <div class="user-avatar">${inicialUsuario}</div>
                    <span class="user-name">${usuarioActual}</span>
                </div>
                <button id="logout-btn" class="btn-secondary" style="padding: 7px 16px; margin: 0;">Salir</button>
            </div>
        </header>

        <main class="dashboard-content">
            
            <!-- Sección: Canciones del momento -->
            <section class="section-container">
                <div class="section-header">
                    <h2>Canciones del momento</h2>
                </div>
                <div class="carousel-wrapper" id="songs-carousel">
                    <p style="color: #a2a2ad; padding: 20px;">Cargando canciones populares...</p>
                </div>
            </section>

            <!-- Sección: Artistas Populares -->
            <section class="section-container">
                <div class="section-header">
                    <h2>Artistas populares</h2>
                    <a href="#" class="see-all-btn">Mostrar todo</a>
                </div>
                <div class="carousel-wrapper" id="artists-carousel">
                    <p style="color: #a2a2ad; padding: 20px;">Cargando artistas populares...</p>
                </div>
            </section>

            <div class="dashboard-layout">
                <section id="search-section" class="dashboard-panel"></section>
                <section id="favorites-section" class="dashboard-panel"></section>
            </div>
        </main>
    `;
    
    initSearch();
    initFavorites();

    // Lógica selector de tema
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            const isLight = document.body.classList.contains('light-mode');
            themeBtn.textContent = isLight ? '☀️' : '🌙';
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }
    
    document.getElementById('user-profile-btn').addEventListener('click', () => {
        renderProfile();
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        logout();
    });

    cargarHomeData();
}

// Definición global para reproducción de audio
window.playTrack = (url) => {
    if (!url) {
        alert('Este track no tiene demo de audio disponible.');
        return;
    }
    let audio = document.getElementById('global-audio-player');
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'global-audio-player';
        audio.style.display = 'none';
        document.body.appendChild(audio);
    }
    audio.src = url;
    audio.play().catch(err => console.log('Error al reproducir audio:', err));
    
    let playerNotification = document.getElementById('player-notification');
    if (!playerNotification) {
        playerNotification = document.createElement('div');
        playerNotification.id = 'player-notification';
        playerNotification.className = 'network-alert-banner'; // Reusamos el diseño flotante bonito
        playerNotification.style.left = '20px';
        playerNotification.style.right = 'auto';
        document.body.appendChild(playerNotification);
    }
    playerNotification.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <span>🔊 Reproduciendo demo...</span>
            <button id="pause-demo-btn" class="btn-primary" style="padding: 4px 10px; margin: 0; font-size: 0.8rem; width: auto;">Pausar</button>
        </div>
    `;
    playerNotification.style.display = 'block';

    document.getElementById('pause-demo-btn').addEventListener('click', () => {
        audio.pause();
        playerNotification.style.display = 'none';
    });
};

async function cargarHomeData() {
    const songsCarousel = document.getElementById('songs-carousel');
    const artistsCarousel = document.getElementById('artists-carousel');

    const chartData = await obtenerTop();

    if (!chartData) {
        if (songsCarousel) songsCarousel.innerHTML = '<p style="color: #ff4d4d;">Error al cargar canciones.</p>';
        if (artistsCarousel) artistsCarousel.innerHTML = '<p style="color: #ff4d4d;">Error al cargar artistas.</p>';
        return;
    }

    const canciones = chartData.tracks?.data || [];
    if (songsCarousel) {
        if (canciones.length === 0) {
            songsCarousel.innerHTML = '<p style="color: #a2a2ad;">No hay canciones disponibles.</p>';
        } else {
            songsCarousel.innerHTML = canciones.map(track => {
                const favActive = isFavorite(track.id) ? 'is-active' : '';
                const favText = isFavorite(track.id) ? '♥' : '♡';
                const userRating = getAlbumRating(track.id);

                let starsHTML = '';
                for (let i = 1; i <= 5; i++) {
                    starsHTML += `<span class="star-rating ${i <= userRating ? 'active' : ''}" data-value="${i}">★</span>`;
                }

                return `
                    <div class="media-card" data-id="${track.id}">
                        <div class="card-img-container">
                            <img src="${track.album.cover_medium}" alt="${track.title}">
                            <button class="heart-btn ${favActive}" data-id="${track.id}">
                                ${favText}
                            </button>
                            <div class="play-hover-btn">▶</div>
                        </div>
                        <h3 class="card-title">${track.title_short || track.title}</h3>
                        <p class="card-artist">
                            ${track.explicit_lyrics ? '<span class="explicit-tag">E</span>' : ''}
                            ${track.artist.name}
                        </p>
                        <div class="stars-container" data-id="${track.id}">
                            ${starsHTML}
                        </div>
                    </div>
                `;
            }).join('');

            // Asignar eventos de favoritos a los corazones
            songsCarousel.querySelectorAll('.heart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const trackId = btn.getAttribute('data-id');
                    const trackData = canciones.find(t => String(t.id) === String(trackId));
                    if (trackData) {
                        const newFav = {
                            id: trackData.id,
                            title: trackData.title,
                            artist: trackData.artist.name,
                            cover: trackData.album.cover_medium,
                            preview: trackData.preview
                        };
                        const active = toggleFavorite(newFav);
                        btn.classList.toggle('is-active', active);
                        btn.innerHTML = active ? '♥' : '♡';
                        renderFavoritesPanel();
                    }
                });
            });

            // Asignar eventos de reproducción a las tarjetas
            songsCarousel.querySelectorAll('.play-hover-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const trackId = btn.closest('.media-card').getAttribute('data-id');
                    const trackData = canciones.find(t => String(t.id) === String(trackId));
                    if (trackData && trackData.preview) {
                        window.playTrack(trackData.preview);
                    }
                });
            });

            // Asignar eventos de calificación (estrellas)
            songsCarousel.querySelectorAll('.star-rating').forEach(star => {
                star.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rating = parseInt(star.getAttribute('data-value'));
                    const trackId = star.parentElement.getAttribute('data-id');
                    
                    // Guardar calificación
                    saveAlbumRating(trackId, rating);

                    // Actualizar UI
                    const siblings = star.parentElement.querySelectorAll('.star-rating');
                    siblings.forEach(sib => {
                        const val = parseInt(sib.getAttribute('data-value'));
                        sib.classList.toggle('active', val <= rating);
                    });
                });
            });
        }
    }

    const artistas = chartData.artists?.data || [];
    if (artistsCarousel) {
        if (artistas.length === 0) {
            artistsCarousel.innerHTML = '<p style="color: #a2a2ad;">No hay artistas disponibles.</p>';
        } else {
            artistsCarousel.innerHTML = artistas.map(artist => `
                <div class="artist-card" data-id="${artist.id}">
                    <div class="artist-img-container">
                        <img src="${artist.picture_medium}" alt="${artist.name}">
                    </div>
                    <h3 class="artist-name">${artist.name}</h3>
                    <p class="artist-label">Artista</p>
                </div>
            `).join('');
        }
    }

    // ---- DELEGACIÓN DE EVENTOS EN EL CARRUSEL DE CANCIONES ----
    songsCarousel.addEventListener('click', (e) => {
        const playBtn = e.target.closest('.play-hover-btn');

        if (playBtn) {
            const card = playBtn.closest('.media-card');
            const songId = card.dataset.id;

            console.log("Abriendo reproductor para la canción ID:", songId);
            initReproduction(card.card.canción);
        }
    });
}

async function initReproduction(canción) {
    console.log("Reproduciendo " + canción);
}