import { buscarCanciones } from '../api.js';

export function initSearch() {
    const searchInput = document.getElementById('main-search-input');
    const searchSection = document.getElementById('search-section');

    if (!searchInput || !searchSection) return;

    let timerBusqueda;

    searchInput.addEventListener('input', (e) => {
        const consulta = e.target.value.trim();

        clearTimeout(timerBusqueda);

        if (consulta === '') {
            searchSection.innerHTML = '';
            return;
        }

        timerBusqueda = setTimeout(async () => {
            searchSection.innerHTML = '<p style="color: #a2a2ad; padding: 10px;">Buscando en Deezer...</p>';
            
            const resultados = await buscarCanciones(consulta);
            renderResultados(resultados, searchSection);
        }, 350);
    });
}

function renderResultados(canciones, container) {
    if (!canciones || canciones.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; color: #a2a2ad;">
                No se encontraron resultados para tu búsqueda.
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h2 style="margin-bottom: 16px; color: var(--dz-text-primary);">Resultados de búsqueda</h2>
        <div class="favorites-list-wrapper">
            ${canciones.map(track => `
                <div class="fav-track-row" data-id="${track.id}">
                    <div class="fav-track-left">
                        <img src="${track.album?.cover_medium || ''}" class="fav-track-cover" alt="${track.title}">
                        <div class="fav-track-details">
                            <span class="fav-track-title">${track.title}</span>
                            <span class="fav-track-artist">${track.artist?.name || 'Artista desconocido'}</span>
                        </div>
                    </div>
                    <div class="fav-track-right">
                        ${track.preview ? `
                            <button class="fav-row-play-btn" onclick="window.playTrack('${track.preview}')" title="Escuchar Demo">▶</button>
                        ` : '<span style="font-size: 0.8rem; color: #a2a2ad;">Sin demo</span>'}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}