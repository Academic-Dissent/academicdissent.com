class AdHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="site-header">
              <div class="brand">
                <div class="logo">
                  <span class="logo-mark">AD</span>
                  <span class="logo-name">Academic Dissent</span>
                </div>
              </div>
              <button class="menu-toggle" aria-label="Toggle navigation">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
              <nav class="site-nav">
                <a href="index.html">Ledger</a>
                <a href="subjects.html">Subjects</a>
                <a href="dissent-tags.html">Dissent Tags</a>
                <a href="about.html">About</a>
                <!-- The button now explicitly calls the function -->
                <span id="auth-nav">
                    <button class="nav-login-btn" onclick="openAuthModal()">Log In</button>
                </span>
              </nav>
            </header>

            <!-- Authentication Modal -->
            <div id="auth-modal" class="modal">
              <div class="modal-content">
                <!-- The close button explicitly calls the close function -->
                <span class="close-modal" onclick="closeAuthModal()">&times;</span>
                <div id="auth-tabs" class="modal-tabs">
                    <button id="tab-login" class="active-tab" onclick="setMode(true)">Log In</button>
                    <button id="tab-register" class="inactive-tab" onclick="setMode(false)">Register</button>
                </div>

                <form id="authForm" class="dissent-form">
                  <h3 id="form-title">Access the Ledger</h3>
                  <p id="form-desc" class="modal-desc">Use a pseudonym. No email required. Do not lose your password; account recovery is impossible.</p>
                  
                  <div class="form-group">
                    <label for="username">Pseudonym *</label>
                    <input type="text" id="username" required pattern="[a-zA-Z0-9_]+" title="Only letters, numbers, and underscores." placeholder="e.g. Student_1908">
                  </div>
                  <div class="form-group">
                    <label for="password">Password *</label>
                    <div class="password-wrapper">
                        <input type="password" id="password" required minlength="8">
                        <span class="toggle-password" onclick="togglePasswordVisibility()" title="Show Password">
                            <!-- SVG Eye Icon -->
                            <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </span>
                    </div>
                  </div>

                  <button type="submit" class="submit-btn" id="authBtn">Log In</button>
                  <div id="authFeedback" class="feedback-msg"></div>
                </form>
              </div>
            </div>
        `;
    }
}

customElements.define('ad-header', AdHeader);