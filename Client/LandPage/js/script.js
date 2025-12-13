// Load users data
let usersData = null;

async function loadUsersData() {
    try {
        // users.json lives in Client/Data relative to this page (two levels up)
        const response = await fetch('../../Data/users.json');
        usersData = await response.json();
    } catch (error) {
        console.error('Error loading users data:', error);
    }
}

// DOM Elements
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const navLogin = document.getElementById('nav-login');
const navProfile = document.getElementById('nav-profile');
const profileBtn = document.getElementById('profile-btn');
const profileMenu = document.getElementById('profile-menu');
const profileNameEl = document.getElementById('profile-name');
const logoutBtn = document.getElementById('logout-btn');

// Initialize the app
async function init() {
    await loadUsersData();
    setupEventListeners();
    updateNavbar();
}

// Setup Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
        if (navLogin) navLogin.addEventListener('click', (e)=>{
            e.preventDefault();
            // Smooth-scroll to the login form area and focus username
            const loginSection = document.querySelector('.login-section') || document.getElementById('login-form');
            if (loginSection && loginSection.scrollIntoView) {
                loginSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            const usr = document.getElementById('username');
            if (usr) {
                // focus after a short delay so that scrolling completes on some browsers
                setTimeout(() => usr.focus(), 400);
            }
        });
    if (profileBtn) profileBtn.addEventListener('click', toggleProfileMenu);
    if (logoutBtn) logoutBtn.addEventListener('click', (e)=>{ e.preventDefault(); logout(); });
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    // prevent other submit handlers from running and causing a real form submit
    if (e.stopImmediatePropagation) e.stopImmediatePropagation();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!usersData) {
        showLoginMessage('Error loading user data. Please try again.', 'error');
        return;
    }

    const user = usersData.users.find(u => u.username === username && u.password === password);

    if (user) {
        const selectedRole = document.querySelector('input[name="role"]:checked').value;
        // store a lightweight logged-in marker so navbar can update
        localStorage.setItem('loggedInUser', JSON.stringify({ name: user.name, role: selectedRole, username: user.username }));
        showLoginMessage(`Welcome, ${user.name}! Redirecting to dashboard...`, 'success');
        setTimeout(() => {
            if (selectedRole === 'management') {
                // use replace to avoid leaving the login page in history
                location.replace('../../Management/views/Hospital-Management.html');
            } else if (selectedRole === 'patient') {
                location.replace('../../Patient/Patient.html');
            }
        }, 800);
    } else {
        showLoginMessage('Invalid username or password.', 'error');
    }
}

// Update navbar based on login state
function updateNavbar() {
    try {
        const raw = localStorage.getItem('loggedInUser');
        if (raw) {
            const u = JSON.parse(raw);
            if (navLogin) navLogin.style.display = 'none';
            if (navProfile) navProfile.style.display = 'block';
            if (profileNameEl) profileNameEl.textContent = u.name || u.username || 'User';
        } else {
            if (navLogin) navLogin.style.display = 'inline-block';
            if (navProfile) navProfile.style.display = 'none';
        }
    } catch (e) { console.error('updateNavbar error', e); }
}

function toggleProfileMenu(e){
    e && e.preventDefault();
    if (!profileMenu) return;
    const shown = profileMenu.style.display === 'block';
    profileMenu.style.display = shown ? 'none' : 'block';
}

function logout(){
    localStorage.removeItem('loggedInUser');
    if (profileMenu) profileMenu.style.display = 'none';
    updateNavbar();
    showLoginMessage('Logged out successfully.', 'success');
}

// Show Login Message
function showLoginMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = type;
    loginMessage.style.display = 'block';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
