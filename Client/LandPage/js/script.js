// Load users data
let usersData = null;

async function loadUsersData() {
    try {
        const response = await fetch('data/users.json');
        usersData = await response.json();
    } catch (error) {
        console.error('Error loading users data:', error);
    }
}

// DOM Elements
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

// Initialize the app
async function init() {
    await loadUsersData();
    setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!usersData) {
        showLoginMessage('Error loading user data. Please try again.', 'error');
        return;
    }

    const user = usersData.users.find(u => u.username === username && u.password === password);

    if (user) {
        showLoginMessage(`Welcome, ${user.name}! Redirecting to dashboard...`, 'success');
        setTimeout(() => {
            if (user.role === 'management') {
                window.location.href = 'management.html';
            } else {
                // For patient role, could redirect to patient dashboard
                alert(`Logged in as ${user.role}: ${user.name}\n\nPatient dashboard would load here.`);
            }
        }, 2000);
    } else {
        showLoginMessage('Invalid username or password.', 'error');
    }
}

// Show Login Message
function showLoginMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = type;
    loginMessage.style.display = 'block';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
