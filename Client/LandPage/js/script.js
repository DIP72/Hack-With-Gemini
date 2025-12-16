// --------------------- SCRIPT.JS ---------------------

// Global users data
let usersData = null;

// DOM Elements
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

// --------------------- LOAD USERS ---------------------
async function loadUsersData() {
    try {
        // Relative path from this HTML file to users.json
        // Adjust "../Data/users.json" if your folder structure is different
        const response = await fetch('../../Data/users.json');

        if (!response.ok) {
            throw new Error('Users file not found!');
        }

        usersData = await response.json();

        // Basic validation
        if (!usersData.users || !Array.isArray(usersData.users)) {
            throw new Error("Invalid users.json format: 'users' array missing");
        }

        console.log('✅ Users loaded:', usersData.users);

    } catch (error) {
        console.error('Error loading users data:', error);
        showLoginMessage('Error loading users data. Please check the console.', 'error');
        usersData = { users: [] }; // fallback to empty
    }
}

// --------------------- HANDLE LOGIN ---------------------
function handleLogin(event) {
    event.preventDefault();

    if (!usersData) {
        showLoginMessage('User data not loaded.', 'error');
        return;
    }

<<<<<<< HEAD
    const user = usersData.users.find(u => u.username === username && u.password === password);
    if (user) {
        // prefer the role stored in users.json (this prevents mismatch with the UI radios)
        const userRole = user.role || (document.querySelector('input[name="role"]:checked') && document.querySelector('input[name="role"]:checked').value) || 'patient';
        // store a lightweight logged-in marker so navbar can update
        localStorage.setItem('loggedInUser', JSON.stringify({ name: user.name || user.username, role: userRole, username: user.username }));
        showLoginMessage(`Welcome, ${user.name}! Redirecting to dashboard...`, 'success');
        setTimeout(() => {
            if (userRole === 'management') {
                // redirect to the Management app's HTML page
                window.location.href = '../../Management/views/Hospital-Management.html';
            } else if (userRole === 'patient') {
                window.location.href = '../../Patient/Patient.html';
            }
        }, 2000);
    } else {
        showLoginMessage('Invalid username or password.', 'error');
    }
    }
}
=======
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const roleEl = document.querySelector('input[name="role"]:checked');

    if (!roleEl) {
        showLoginMessage('Please select a role.', 'error');
        return;
    }
>>>>>>> e2b88b0759c1f9694db662ff0c4450ecbb02321f

    const role = roleEl.value;

    const user = usersData.users.find(u =>
        u.username === username &&
        u.password === password &&
        u.role === role
    );

    if (!user) {
        showLoginMessage('Invalid username, password, or role.', 'error');
        return;
    }

    // Store login info for session
    localStorage.setItem('loggedInUser', JSON.stringify({
        username: user.username,
        role: user.role
    }));

    showLoginMessage(`Welcome, ${user.username}! Redirecting...`, 'success');

    // Redirect based on role
    setTimeout(() => {
        if (user.role === 'management') {
            // Adjust this path relative to the HTML file
            window.location.href = '../../Management/views/Hospital-Management.html';
        } else if (user.role === 'patient') {
            window.location.href = '../../Patient/Patient.html';
        }
    }, 1000);
}

// --------------------- SHOW LOGIN MESSAGE ---------------------
function showLoginMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = type; // You can define CSS for 'success' and 'error'
    loginMessage.style.display = 'block';
}

// --------------------- INIT ---------------------
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsersData();
    loginForm.addEventListener('submit', handleLogin);
});
