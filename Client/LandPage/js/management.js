let users = [];

// DOM Elements
const form = document.getElementById('login-form');
const usernameEl = document.getElementById('username');
const passwordEl = document.getElementById('password');
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

    // Get selected role from radio buttons
    const roleEl = document.querySelector('input[name="role"]:checked');
    if (!roleEl) {
        messageEl.textContent = "Please select a role";
        return;
    }
    const role = roleEl.value;

    const username = usernameEl.value.trim();
    const password = passwordEl.value.trim();

    const user = users.find(u =>
        u.username === username &&
        u.password === password &&
        u.role === role
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
        window.location.href = "../../Management/views/management.html";
    } else if (user.role === "patient") {
        window.location.href = "../../Patient/views/patient.html";
    }
}

// ---------------- INIT ----------------
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    form.addEventListener('submit', login);
});
