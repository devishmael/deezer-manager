import { getFavorites, toggleFavorite } from './favorites.js';

export function renderProfile() {
    // Buscar si ya existe la superposición
    let overlay = document.getElementById('profile-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'profile-overlay';
        overlay.className = 'profile-overlay';
        document.body.appendChild(overlay);
    }

    // Dibujar estructura modal
    updateProfileContent(overlay);
}

function updateProfileContent(overlay) {
    const usuarioActual = localStorage.getItem('usuario_actual') || 'Usuario';
    const inicial = usuarioActual.charAt(0).toUpperCase();
    const favoritos = getFavorites();
    const ratings = JSON.parse(localStorage.getItem('album_ratings') || '{}');
    const totalCalificaciones = Object.keys(ratings).length;

    overlay.innerHTML = `
        <div class="profile-modal">
            <button class="close-profile-btn" id="close-profile-btn">✕</button>
            
            <div class="profile-header-info">
                <div class="profile-avatar-large">${inicial}</div>
                
                <div class="profile-name-container">
                    <h2 class="profile-username" id="profile-username-text">${usuarioActual}</h2>
                    <input type="text" id="edit-username-input" class="edit-name-input hidden" value="${usuarioActual}">
                    <button class="edit-profile-btn" id="edit-name-btn" title="Editar Nombre">✏️</button>
                    <button class="save-profile-btn hidden" id="save-name-btn" title="Guardar Nombre">✔️</button>
                </div>

                <p class="profile-role">Melómano Premium</p>

                <div class="profile-stats">
                    <div class="stat-item">
                        <span class="stat-val" id="profile-favs-count">${favoritos.length}</span>
                        <span class="stat-lbl">Favoritos</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-val">${totalCalificaciones}</span>
                        <span class="stat-lbl">Calificadas</span>
                    </div>
                </div>
            </div>

            <div class="profile-favorites-section">
                <h3 class="profile-favs-title">Mis Canciones Favoritas</h3>
                <div class="profile-favs-list" id="profile-favs-list-container">
                    ${favoritos.length === 0 ? `
                        <p style="color: var(--dz-text-secondary); text-align: center; padding: 20px 0;">No has añadido ninguna canción a favoritos todavía.</p>
                    ` : favoritos.map(track => `
                        <div class="profile-fav-item" data-id="${track.id}">
                            <img src="${track.cover}" alt="${track.title}" class="profile-fav-cover">
                            <div class="profile-fav-info">
                                <span class="profile-fav-title">${track.title}</span>
                                <span class="profile-fav-artist">${track.artist}</span>
                            </div>
                            <div class="profile-fav-actions">
                                <button class="profile-play-btn" data-preview="${track.preview || ''}" title="Reproducir">▶</button>
                                <button class="profile-remove-btn" data-id="${track.id}" title="Eliminar">✕</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Asignar listeners del modal
    document.getElementById('close-profile-btn').addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
        }
    });

    // Lógica para editar nombre
    const editBtn = document.getElementById('edit-name-btn');
    const saveBtn = document.getElementById('save-name-btn');
    const nameText = document.getElementById('profile-username-text');
    const nameInput = document.getElementById('edit-username-input');

    editBtn.addEventListener('click', () => {
        nameText.classList.add('hidden');
        editBtn.classList.add('hidden');
        nameInput.classList.remove('hidden');
        saveBtn.classList.remove('hidden');
        nameInput.focus();
    });

    saveBtn.addEventListener('click', () => {
        const nuevoNombre = nameInput.value.trim();
        if (nuevoNombre && nuevoNombre !== usuarioActual) {
            // Guardar nombre
            localStorage.setItem('usuario_actual', nuevoNombre);
            
            // Actualizar credenciales en la lista de usuarios registrados si es necesario
            const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados') || '{}');
            const password = usuariosGuardados[usuarioActual];
            if (password) {
                delete usuariosGuardados[usuarioActual];
                usuariosGuardados[nuevoNombre] = password;
                localStorage.setItem('usuarios_registrados', JSON.stringify(usuariosGuardados));
            }

            // También renombrar la clave de favoritos si se desea migrar favoritos
            const favKeyOld = `favorites_${usuarioActual}`;
            const favKeyNew = `favorites_${nuevoNombre}`;
            const favs = localStorage.getItem(favKeyOld);
            if (favs) {
                localStorage.setItem(favKeyNew, favs);
                localStorage.removeItem(favKeyOld);
            }

            // Actualizar la interfaz del perfil
            updateProfileContent(overlay);

            // Actualizar el header en el dashboard
            const headerAvatar = document.querySelector('.user-avatar');
            const headerName = document.querySelector('.user-name');
            if (headerAvatar) headerAvatar.textContent = nuevoNombre.charAt(0).toUpperCase();
            if (headerName) headerName.textContent = nuevoNombre;
        } else {
            nameText.classList.remove('hidden');
            editBtn.classList.remove('hidden');
            nameInput.classList.add('hidden');
            saveBtn.classList.add('hidden');
        }
    });

    // Play demo listener
    overlay.querySelectorAll('.profile-play-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preview = btn.getAttribute('data-preview');
            if (preview && window.playTrack) {
                window.playTrack(preview);
            } else {
                alert('Demo de audio no disponible para esta canción.');
            }
        });
    });

    // Remove favorites listener
    overlay.querySelectorAll('.profile-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const trackId = btn.getAttribute('data-id');
            const trackItem = favoritos.find(f => String(f.id) === String(trackId));
            if (trackItem) {
                toggleFavorite(trackItem);
                
                // Actualizar la lista en el modal
                updateProfileContent(overlay);

                // Actualizar el dashboard
                const heart = document.querySelector(`.heart-btn[data-id="${trackId}"]`);
                if (heart) {
                    heart.classList.remove('is-active');
                    heart.innerHTML = '♡';
                }
            }
        });
    });

    overlay.style.display = 'flex';
}