// ==========================================
// 1. GLOBAL UI FUNCTIONS
// ==========================================

window.openAuthModal = function() {
    const modal = document.getElementById("auth-modal");
    if (modal) {
        modal.style.display = "block";
        const feedback = document.getElementById('authFeedback');
        if (feedback) feedback.textContent = "";
    }
};

window.closeAuthModal = function() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.style.display = "none";
};

window.onclick = function(event) {
    const modal = document.getElementById("auth-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

let isLoginMode = true;

window.setMode = function(login) {
    isLoginMode = login;
    document.getElementById('tab-login').className = login ? 'active-tab' : 'inactive-tab';
    document.getElementById('tab-register').className = login ? 'inactive-tab' : 'active-tab';
    document.getElementById('form-title').textContent = login ? 'Access the Ledger' : 'Register a Pseudonym';
    document.getElementById('authBtn').textContent = login ? 'Log In' : 'Register Securely';
    document.getElementById('authFeedback').textContent = '';
};

window.togglePasswordVisibility = function() {
    const pwdInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eye-icon");

    if (pwdInput.type === "password") {
        pwdInput.type = "text";
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        pwdInput.type = "password";
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
};

// ==========================================
// 2. SUPABASE INITIALIZATION
// ==========================================

const SUPABASE_URL = 'https://lggkciqdxahxwjzvcxow.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oLXblA1gmy7UWCiwUJUEVA_OGvHoVxU';
const DUMMY_DOMAIN = '@academicdissent.local';

let supabaseClient = null;

// Create a global Promise that signals when Supabase is ready
window.supabaseReady = new Promise((resolve) => {
    function initSupabase() {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            updateNavState();
            resolve(supabaseClient); // Tell the dashboard it is safe to check the session
        } else {
            setTimeout(initSupabase, 50);
        }
    }
    initSupabase();
});
// ==========================================
// 3. AUTHENTICATION LOGIC
// ==========================================

window.logoutUser = async function() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    window.location.reload();
};

async function updateNavState() {
    const authNav = document.getElementById('auth-nav');
    if (!authNav || !supabaseClient) return;

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session) {
            const username = session.user.email.split('@')[0];
            authNav.innerHTML = `
                <a href="dashboard.html" style="color: var(--accent-color); font-weight: bold; font-size: 0.85rem; font-family: sans-serif; margin-left: 1.5rem;">[${username}]</a>
                <button class="nav-login-btn" onclick="logoutUser()">Logout</button>
            `;
        } else {
            authNav.innerHTML = `<button class="nav-login-btn" onclick="openAuthModal()">Log In</button>`;
        }
    } catch (err) {
        console.error("Auth check failed:", err);
        authNav.innerHTML = `<button class="nav-login-btn" onclick="openAuthModal()">Log In</button>`;
    }
}

document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'authForm') {
        e.preventDefault();

        if (!supabaseClient) {
            alert("Database connection not established. Please refresh the page.");
            return;
        }

        const authBtn = document.getElementById('authBtn');
        const authFeedback = document.getElementById('authFeedback');

        authBtn.disabled = true;
        authFeedback.textContent = "Processing...";
        authFeedback.style.color = "var(--text-color)";

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const fakeEmail = username.toLowerCase() + DUMMY_DOMAIN;

        try {
            if (isLoginMode) {
                const { error } = await supabaseClient.auth.signInWithPassword({
                    email: fakeEmail, password: password,
                });
                if (error) throw error;
                closeAuthModal();
                updateNavState();
            } else {
                const { error } = await supabaseClient.auth.signUp({
                    email: fakeEmail, password: password,
                });
                if (error) throw error;
                authFeedback.textContent = "Registration successful. Logging in...";
                authFeedback.style.color = "green";
                setTimeout(() => {
                    closeAuthModal();
                    updateNavState();
                }, 1000);
            }
        } catch (error) {
            authFeedback.textContent = error.message;
            authFeedback.style.color = "red";
        } finally {
            authBtn.disabled = false;
        }
    }
});