// login.js
// Roles: management, patient

let users = [];

// DOM Elements
const form = document.getElementById('login-form');
const usernameEl = document.getElementById('username');
const passwordEl = document.getElementById('password');
const roleEl = document.getElementById('role');
const messageEl = document.getElementById('login-message');

// ---------------- LOAD USERS ----------------
async function loadUsers() {
    try {
        const res = await fetch('data/users.json');
        const data = await res.json();
        users = data.users.map(u => ({
            username: u.username,
            password: u.password,
            role: u.role
        }));
    } catch (err) {
        console.error("Failed to load users.json", err);
        messageEl.textContent = "Unable to load users data";
    }
}

// ---------------- LOGIN ----------------
function login(e) {
    e.preventDefault();

    const user = users.find(u =>
        u.username === usernameEl.value.trim() &&
        u.password === passwordEl.value.trim() &&
        u.role === roleEl.value
    );

    if (!user) {
        messageEl.textContent = "Invalid username, password, or role";
        return;
    }

    // Save session
    sessionStorage.setItem(
        "user",
        JSON.stringify({ username: user.username, role: user.role })
    );

    // Redirect based on role
    if (user.role === "management") {
        window.location.href = "/management.html"; // Management dashboard page
    } else if (user.role === "patient") {
        window.location.href = "/patient.html"; // Patient page
    }
}

// ---------------- INIT ----------------
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    form.addEventListener('submit', login);
});
