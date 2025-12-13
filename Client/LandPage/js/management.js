// login.js
// PURPOSE: Authenticate user using username, password, role ONLY

let users = [];

// DOM Elements
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const roleInput = document.getElementById('role');
const messageBox = document.getElementById('login-message');

// ---------------- LOAD USERS ----------------
async function loadUsers() {
    try {
        const res = await fetch('data/users.json');
        const data = await res.json();

        if (!Array.isArray(data.users)) {
            throw new Error("Invalid users.json format");
        }

        // KEEP ONLY REQUIRED FIELDS
        users = data.users.map(u => ({
            username: u.username,
            password: u.password,
            role: u.role
        }));

    } catch (err) {
        console.error(err);
        messageBox.textContent = "Failed to load users";
    }
}

// ---------------- LOGIN ----------------
function handleLogin(e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const role = roleInput.value;

    const user = users.find(u =>
        u.username === username &&
        u.password === password &&
        u.role === role
    );

    if (!user) {
        messageBox.textContent = "Invalid username, password, or role";
        return;
    }

    // SUCCESS
    sessionStorage.setItem('user', JSON.stringify({
        username: user.username,
        role: user.role
    }));

    // Redirect based on role
    window.location.href = `${role}.html`;
}

// ---------------- INIT ----------------
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    loginForm.addEventListener('submit', handleLogin);
});
