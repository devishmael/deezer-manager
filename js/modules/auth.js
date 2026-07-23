import { renderDashboard } from '../main.js';

export function checkSession() {
    return localStorage.getItem('auth_token') !== null;
}

// ---- Formulario de Login ----
export function initAuth() {
    const container = document.getElementById('app');
    if (!container) return;

    container.innerHTML = `
        <div class="auth-wrapper">
            <div class="auth-card">
                <div class="auth-brand">
                    <h2>Iniciar Sesión</h2>
                </div>

                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <label for="username">Usuario</label>
                        <input type="text" id="username" class="form-control" required placeholder="admin" autocomplete="username">
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" class="form-control" required placeholder="1234" autocomplete="current-password">
                    </div>
                    
                    <button type="submit" id="login-btn" class="btn-primary">
                        <span id="btn-text">Ingresar</span>
                        <div id="login-spinner" class="spinner hidden"></div>
                    </button>

                    <button type="button" id="btn-registro" class="btn-secondary">
                        Regístrate
                    </button>
                </form>

                <div id="error-msg" class="auth-error hidden"></div>
            </div>
        </div>
    `;

    // ---- Listener del formulario ----
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const btnText = document.getElementById('btn-text');
        const spinner = document.getElementById('login-spinner');
        const errorMsg = document.getElementById('error-msg');
        const loginBtn = document.getElementById('login-btn');

        // ---- Spinner ----
        btnText.textContent = "Validando...";
        spinner.classList.remove('hidden');
        loginBtn.disabled = true;
        errorMsg.classList.add('hidden');

        // ---- Simula espera del servidor ----
        setTimeout(() => {
            const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados') || '{}');
            const esUsuarioRegistrado = usuariosGuardados[username] && usuariosGuardados[username] === password;
            const esAdmin = username === "admin" && password === "1234";
            const esUsuarioA = username === 'a' && password === '1';

            if (esUsuarioRegistrado || esAdmin || esUsuarioA) {
                localStorage.setItem('auth_token', 'token-valido-ucab');
                localStorage.setItem('usuario_actual', username);
                renderDashboard();
            } else {
                errorMsg.textContent = "Usuario o contraseña incorrectos";
                errorMsg.classList.remove('hidden');
                
                btnText.textContent = "Ingresar";
                spinner.classList.add('hidden');
                loginBtn.disabled = false;
            }
        }, 2000);
    });

    document.getElementById('btn-registro').addEventListener('click', () => {
        initRegis();
    });
}

export function initRegis() {
    const container = document.getElementById('app');
    if (!container) return;
    container.innerHTML = `
        <div class="auth-wrapper">
            <div class="auth-card">
                <div class="auth-brand">
                    <h2>Crear Cuenta</h2>
                </div>
                <p class="auth-subtitle">Crea tu perfil para guardar tus álbumes preferidos</p>

                <form id="regis-form" class="auth-form">
                    <div class="form-group">
                        <label for="reg-username">Usuario</label>
                        <input type="text" id="reg-username" class="form-control" required placeholder="Tu nombre de usuario" autocomplete="off">
                    </div>

                    <div class="form-group">
                        <label for="reg-password">Contraseña</label>
                        <input type="password" id="reg-password" class="form-control" required placeholder="Mínimo 4 caracteres" autocomplete="new-password">
                    </div>

                    <div class="form-group">
                        <label for="reg-confirm-password">Confirmar Contraseña</label>
                        <input type="password" id="reg-confirm-password" class="form-control" required placeholder="Repite tu contraseña" autocomplete="new-password">
                    </div>
                    
                    <button type="submit" id="reg-btn" class="btn-primary">
                        <span id="reg-btn-text">Registrarme</span>
                        <div id="reg-spinner" class="spinner hidden"></div>
                    </button>

                    <button type="button" id="btn-volver-login" class="btn-secondary">
                        ¿Ya tienes cuenta? Inicia Sesión
                    </button>
                </form>

                <div id="reg-error-msg" class="auth-error hidden"></div>
                <div id="reg-success-msg" class="auth-success hidden"></div>
            </div>
        </div>
    `;

    // Evento de Registro
    document.getElementById('regis-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const confirmPassword = document.getElementById('reg-confirm-password').value.trim();

        const btnText = document.getElementById('reg-btn-text');
        const spinner = document.getElementById('reg-spinner');
        const errorMsg = document.getElementById('reg-error-msg');
        const successMsg = document.getElementById('reg-success-msg');
        const regBtn = document.getElementById('reg-btn');

        // Reset de mensajes
        errorMsg.classList.add('hidden');
        successMsg.classList.add('hidden');

        // Validaciones locales
        if (password.length < 4) {
            errorMsg.textContent = "La contraseña debe tener al menos 4 caracteres.";
            errorMsg.classList.remove('hidden');
            return;
        }

        if (password !== confirmPassword) {
            errorMsg.textContent = "Las contraseñas no coinciden.";
            errorMsg.classList.remove('hidden');
            return;
        }
        // --------------------------------------------
        // ---- Simulación de registro con Spinner ----
        // --------------------------------------------
        btnText.textContent = "Creando cuenta...";
        spinner.classList.remove('hidden');
        regBtn.disabled = true;
        
        const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_registrados') || '{}');
        if (usuariosGuardados[username] || username === "admin" || username === "a") {
            errorMsg.textContent = "El nombre de usuario ya está registrado.";
            errorMsg.classList.remove('hidden');
            
            btnText.textContent = "Registrarme";
            spinner.classList.add('hidden');
            regBtn.disabled = false;
            return;
        }

        // Guardar el nuevo usuario en el mapa de usuarios
        usuariosGuardados[username] = password;
        localStorage.setItem('usuarios_registrados', JSON.stringify(usuariosGuardados));

        // Feedback visual de éxito
        spinner.classList.add('hidden');
        successMsg.textContent = "¡Cuenta creada con éxito! Entrando...";
        successMsg.classList.remove('hidden');

        // Iniciar sesión automáticamente
        setTimeout(() => {
            localStorage.setItem('auth_token', 'token-valido-ucab');
            localStorage.setItem('usuario_actual', username);
            renderDashboard();
        }, 1200);
    });

    // Volver al formulario de login
    document.getElementById('btn-volver-login').addEventListener('click', () => {
        initAuth();
    });

}

// ---- Cierre de sesión limpiando storage ----
export function logout() {
    localStorage.removeItem('usuario_actual');    
    localStorage.removeItem('auth_token'); 
    location.reload();
}