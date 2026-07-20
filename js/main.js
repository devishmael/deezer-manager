// Importamos las funciones de los otros módulos
import { initAuth, checkSession, logout } from './modules/auth.js';
import { initSearch } from './modules/search.js';
import { initFavorites } from './modules/favorites.js';
import { initOfflineHandler } from './storage.js';

// Evento principal: se ejecuta apenas el HTML termina de cargar en el navegador
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar los escuchadores de internet (Online / Offline)
    initOfflineHandler();

    // 2. Verificar el estado de la sesión para saber qué pantalla mostrar
    if (checkSession()) {
        renderDashboard();
    } else {
        renderLogin();
    }
});

/**
 * Renderiza la interfaz del Formulario de Inicio de Sesión
 */
export function renderLogin() {
    const app = document.getElementById('app');
    
    // Inyectamos el contenedor limpio para el login
    app.innerHTML = `
        <div id="auth-container">
            <!-- Aquí el módulo auth.js se encargará de pintar el formulario y los spinners -->
        </div>
    `;
    
    // Ejecutamos la lógica de inicialización del login (listeners de los botones, etc.)
    initAuth();
}

/**
 * Renderiza la interfaz principal (Dashboard) cuando el usuario ya está logueado
 */
export function renderDashboard() {
    const app = document.getElementById('app');
    
    // Inyectamos el cascarón del Dashboard principal
    app.innerHTML = `
        <header class="main-header">
            <div class="header-logo">
                <h1>Deezer-Manager</h1>
            </div>
            <div class="header-controls">
                <!-- Aquí el Integrante 3 meterá el selector de Modo Claro/Oscuro -->
                <div id="theme-toggle-container"></div>
                <button id="logout-btn" class="btn-secondary">Cerrar Sesión</button>
            </div>
        </header>
        
        <div class="dashboard-layout">
            <!-- Zona del Integrante 2: Buscador y Detalle del Artista -->
            <section id="search-section" class="dashboard-panel"></section>
            
            <!-- Zona del Integrante 3: Mis Álbumes Guardados y Filtros -->
            <section id="favorites-section" class="dashboard-panel"></section>
        </div>
    `;
    
    // Inicializamos los módulos de tus compañeros para que pinten sus respectivas partes
    initSearch();
    initFavorites();
    
    // Configuramos el botón de cerrar sesión
    document.getElementById('logout-btn').addEventListener('click', () => {
        logout();
    });
}