import { initAuth, checkSession, logout } from './modules/auth.js';
import { initSearch } from './modules/search.js';
import { initFavorites } from './modules/favorites.js';
import { initOfflineHandler } from './storage.js';
import { buscarCanciones, buscarArtista, obtenerTop } from './api.js';
import { renderProfile } from './modules/profile.js';

document.addEventListener('DOMContentLoaded', () => {
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
    
    document.getElementById('user-profile-btn').addEventListener('click', () => {
        //alert(`Perfil de: ${usuarioActual}`);
        renderProfile();
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        logout();
    });

    cargarHomeData();
}

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
            songsCarousel.innerHTML = canciones.map(track => `
                <div class="media-card" data-id="${track.id}">
                    <div class="card-img-container">
                        <img src="${track.album.cover_medium}" alt="${track.title}">
                        <div class="play-hover-btn">▶</div>
                    </div>
                    <h3 class="card-title">${track.title_short || track.title}</h3>
                    <p class="card-artist">
                        ${track.explicit_lyrics ? '<span class="explicit-tag">E</span>' : ''}
                        ${track.artist.name}
                    </p>
                </div>
            `).join('');
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
}