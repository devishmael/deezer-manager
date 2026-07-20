import { renderDashboard } from '../main.js';

// 1. Verifica si existe un token real guardado
export function checkSession() {
    return localStorage.getItem('auth_token') !== null;
}

// 2. Renderiza tu formulario de Login con el Spinner oculto
export function initAuth() {
    const container = document.getElementById('app');
    if (!container) return;

    container.innerHTML = `
        <div style="max-width: 350px; margin: 80px auto; padding: 30px; text-align: center; border: 1px solid #ccc; border-radius: 8px;">
            <h2 style="margin-bottom: 20px;">Iniciar Sesión</h2>
            <form id="login-form" style="text-align: left;">
                <div style="margin-bottom: 15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:bold;">Usuario:</label>
                    <input type="text" id="username" required placeholder="admin" style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display:block; margin-bottom:5px; font-weight:bold;">Contraseña:</label>
                    <input type="password" id="password" required placeholder="1234" style="width: 100%; padding: 8px; box-sizing: border-box;">
                </div>
                
                <button type="submit" id="login-btn" style="width: 100%; padding: 10px; background: #ef5466; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px;">
                    <span id="btn-text">Ingresar</span>
                    <div id="login-spinner" class="spinner hidden"></div>
                </button>
            </form>
            <div id="error-msg" class="hidden" style="color: red; margin-top: 15px; font-weight: bold;"></div>
        </div>
    `;

    // Listener del formulario
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const btnText = document.getElementById('btn-text');
        const spinner = document.getElementById('login-spinner');
        const errorMsg = document.getElementById('error-msg');
        const loginBtn = document.getElementById('login-btn');

        // ACTIVAR SPINNER 
        btnText.textContent = "Validando...";
        spinner.classList.remove('hidden');
        loginBtn.disabled = true;
        errorMsg.classList.add('hidden');

        // Simulamos la espera del servidor personal (2 segundos)
        setTimeout(() => {
            if (username === "admin" && password === "1234") {
                localStorage.setItem('auth_token', 'token-valido-ucab');
                renderDashboard();
            } else {
                // Si fallan las credenciales
                errorMsg.textContent = "Usuario o contraseña incorrectos";
                errorMsg.classList.remove('hidden');
                
                // DESACTIVAR SPINNER para reintentar
                btnText.textContent = "Ingresar";
                spinner.classList.add('hidden');
                loginBtn.disabled = false;
            }
        }, 2000);
    });
}

// 3. Cierre de sesión seguro
export function logout() {
    localStorage.removeItem('auth_token');
    location.reload();
}