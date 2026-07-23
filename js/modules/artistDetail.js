import { obtenerAlbumesArtista, obtenerCancionesAlbum } from '../api.js';

export async function renderArtistDetail(artist) {
    let overlay = document.getElementById('artist-detail-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'artist-detail-overlay';
        overlay.className = 'profile-overlay';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="profile-modal" style="max-width: 650px; max-height: 85vh; overflow-y: auto;">
            <button class="close-profile-btn" id="close-artist-btn">✕</button>

            <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
                <img src="${artist.picture_medium || artist.picture || ''}" alt="${artist.name}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover;">
                <div>
                    <h2 style="margin: 0; color: var(--dz-text-primary, #fff);">${artist.name}</h2>
                    <p style="margin: 4px 0 0; color: #a2a2ad;">Discografía y Álbumes</p>
                </div>
            </div>

            <div id="artist-albums-container">
                <p style="color: #a2a2ad;">Cargando álbumes del artista...</p>
            </div>
        </div>
    `;

    overlay.style.display = 'flex';

    document.getElementById('close-artist-btn').addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    });

    const albums = await obtenerAlbumesArtista(artist.id);
    const container = document.getElementById('artist-albums-container');

    if (!albums || albums.length === 0) {
        container.innerHTML = '<p style="color: #a2a2ad;">No se encontraron álbumes para este artista.</p>';
        return;
    }

    container.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 14px;">
            ${albums.map(album => `
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; cursor: pointer;" class="album-header" data-id="${album.id}">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${album.cover_medium || album.cover}" alt="${album.title}" style="width: 48px; height: 48px; border-radius: 6px;">
                            <div>
                                <strong style="color: #fff; display: block; font-size: 0.95rem;">${album.title}</strong>
                                <span style="font-size: 0.8rem; color: #a2a2ad;">${album.release_date ? album.release_date.split('-')[0] : 'Álbum'}</span>
                            </div>
                        </div>
                        <button class="btn-secondary" style="padding: 4px 10px; font-size: 0.78rem;">Ver canciones ▼</button>
                    </div>
                    <div class="album-tracks-wrapper hidden" id="tracks-album-${album.id}" style="margin-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
                        <p style="color: #a2a2ad; font-size: 0.85rem;">Cargando canciones...</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    container.querySelectorAll('.album-header').forEach(header => {
        header.addEventListener('click', async () => {
            const albumId = header.getAttribute('data-id');
            const tracksContainer = document.getElementById(`tracks-album-${albumId}`);

            if (tracksContainer.classList.contains('hidden')) {
                tracksContainer.classList.remove('hidden');

                if (tracksContainer.getAttribute('data-loaded') !== 'true') {
                    const tracks = await obtenerCancionesAlbum(albumId);
                    tracksContainer.setAttribute('data-loaded', 'true');

                    if (!tracks || tracks.length === 0) {
                        tracksContainer.innerHTML = '<p style="color: #a2a2ad; font-size: 0.85rem;">No hay canciones disponibles.</p>';
                        return;
                    }

                    tracksContainer.innerHTML = tracks.map((track, idx) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; font-size: 0.88rem;">
                            <span style="color: #ddd;">${idx + 1}. ${track.title}</span>
                            ${track.preview ? `
                                <button class="fav-row-play-btn" onclick="window.playTrack('${track.preview}')" title="Escuchar Demo">▶</button>
                            ` : '<span style="font-size: 0.75rem; color: #a2a2ad;">Sin demo</span>'}
                        </div>
                    `).join('');
                }
            } else {
                tracksContainer.classList.add('hidden');
            }
        });
    });
}