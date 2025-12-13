// Management Dashboard JavaScript

let usersData = null;
let currentUser = null;

// DOM Elements
const patientSearch = document.getElementById('patient-search');
const searchBtn = document.getElementById('search-btn');
const patientList = document.getElementById('patient-list');
const inventoryList = document.getElementById('inventory-list');
const patientModal = document.getElementById('patient-modal');
const patientModalTitle = document.getElementById('patient-modal-title');
const patientDetails = document.getElementById('patient-details');
const closeModal = document.querySelector('.close');
const logoutBtn = document.getElementById('logout-btn');
const navLinks = document.querySelectorAll('.sidebar a');

// Initialize the app
async function init() {
    await loadData();
    setupEventListeners();
    renderPatientList();
    renderInventory();
    updateStats();
}

// Load data from JSON
async function loadData() {
    try {
        const response = await fetch('data/users.json');
        usersData = await response.json();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback data
        usersData = {
            users: [
                {
                    username: "admin",
                    password: "user123",
                    role: "patient",
                    name: "John Doe",
                    id: "123456",
                    age: 35,
                    blood_group: "O+",
                    condition: "Appendicitis",
                    admission_date: "2023-11-15",
                    assigned_doctor: "Dr. Smith",
                    room_number: "301",
                    emergency_contact: "Jane Doe - 555-0123",
                    insurance: "Blue Cross Blue Shield",
                    allergies: "Penicillin",
                    medical_history: "Previous appendectomy in 2010",
                    current_medications: ["Ibuprofen 400mg", "Acetaminophen 500mg"],
                    lab_results: [
                        { test: "Blood Count", result: "Normal", date: "2023-11-14" },
                        { test: "Chemistry Panel", result: "Elevated WBC", date: "2023-11-14" }
                    ],
                    vital_signs: {
                        blood_pressure: "120/80",
                        heart_rate: "72 bpm",
                        temperature: "98.6°F",
                        oxygen_saturation: "98%"
                    },
                    prescriptions: [
                        { name: "Amoxicillin 500mg", quantity: "14 tablets", dosage: "500mg every 8 hours" },
                        { name: "Paracetamol", quantity: "10 tablets", dosage: "500mg every 6 hours" }
                    ],
                    checkups: [
                        { date: "2023-12-01", purpose: "Stitch Removal" },
                        { date: "2023-12-15", purpose: "General Assessment" }
                    ]
                }
            ],
            inventory: [
                { id: 1, name: "Propofol (Anesthesia)", category: "surgical_supply", quantity: "20ml", supplier: "MedSupply Inc.", expiry: "2024-06-30" },
                { id: 2, name: "Sterile Surgical Gloves", category: "surgical_supply", quantity: "4 pairs", supplier: "MediGlove Corp.", expiry: "2024-12-31" },
                { id: 3, name: "Amoxicillin 500mg", category: "post_op_med", quantity: "14 tablets", supplier: "PharmaCorp", expiry: "2024-08-15" },
                { id: 4, name: "Paracetamol", category: "post_op_med", quantity: "10 tablets", supplier: "MediPharm", expiry: "2024-09-20" }
            ]
        };
    }
}

// Setup Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    patientSearch.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    closeModal.addEventListener('click', () => patientModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === patientModal) patientModal.style.display = 'none';
    });
    logoutBtn.addEventListener('click', handleLogout);

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });
}

// Show specific section
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
}

// Render Patient List
function renderPatientList(filteredPatients = null) {
    const patients = filteredPatients || usersData.users.filter(u => u.role === 'patient');
    patientList.innerHTML = '';

    patients.forEach(patient => {
        const patientCard = document.createElement('div');
        patientCard.className = 'patient-card';
        patientCard.innerHTML = `
            <div class="patient-info">
                <h3>${patient.name}</h3>
                <p><strong>ID:</strong> ${patient.id}</p>
                <p><strong>Age:</strong> ${patient.age}</p>
                <p><strong>Condition:</strong> ${patient.condition}</p>
                <p><strong>Status:</strong> <span class="status-badge ${getStatusClass(patient)}">${getStatusText(patient)}</span></p>
            </div>
            <button class="view-details-btn" data-patient-id="${patient.id}">View Details</button>
        `;
        patientList.appendChild(patientCard);
    });

    // Add event listeners to view details buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const patientId = e.target.getAttribute('data-patient-id');
            showPatientDetails(patientId);
        });
    });
}

// Get status class for badge
function getStatusClass(patient) {
    // This is a simple implementation - in a real app, this would be based on actual status
    return patient.condition ? 'admitted' : 'discharged';
}

// Get status text
function getStatusText(patient) {
    return patient.condition ? 'Admitted' : 'Discharged';
}

// Handle Search
function handleSearch() {
    const searchTerm = patientSearch.value.toLowerCase();
    const filteredPatients = usersData.users.filter(patient =>
        patient.role === 'patient' &&
        (patient.name.toLowerCase().includes(searchTerm) ||
         patient.id.toLowerCase().includes(searchTerm))
    );
    renderPatientList(filteredPatients);
}

// Show Patient Details
function showPatientDetails(patientId) {
    const patient = usersData.users.find(p => p.id === patientId);
    if (!patient) return;

    patientModalTitle.textContent = `${patient.name} - Patient Details`;
    patientDetails.innerHTML = `
        <div class="details-grid">
            <div class="detail-section">
                <h3><i class="fas fa-user"></i> Personal Information</h3>
                <div class="detail-item"><strong>Name:</strong> ${patient.name}</div>
                <div class="detail-item"><strong>ID:</strong> ${patient.id}</div>
                <div class="detail-item"><strong>Age:</strong> ${patient.age}</div>
                <div class="detail-item"><strong>Blood Group:</strong> ${patient.blood_group}</div>
                <div class="detail-item"><strong>Emergency Contact:</strong> ${patient.emergency_contact || 'N/A'}</div>
                <div class="detail-item"><strong>Insurance:</strong> ${patient.insurance || 'N/A'}</div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-hospital"></i> Admission Details</h3>
                <div class="detail-item"><strong>Admission Date:</strong> ${patient.admission_date || 'N/A'}</div>
                <div class="detail-item"><strong>Room Number:</strong> ${patient.room_number || 'N/A'}</div>
                <div class="detail-item"><strong>Assigned Doctor:</strong> ${patient.assigned_doctor || 'N/A'}</div>
                <div class="detail-item"><strong>Current Condition:</strong> ${patient.condition}</div>
                <div class="detail-item"><strong>Allergies:</strong> ${patient.allergies || 'None'}</div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-heartbeat"></i> Vital Signs</h3>
                <div class="detail-item"><strong>Blood Pressure:</strong> ${patient.vital_signs?.blood_pressure || 'N/A'}</div>
                <div class="detail-item"><strong>Heart Rate:</strong> ${patient.vital_signs?.heart_rate || 'N/A'}</div>
                <div class="detail-item"><strong>Temperature:</strong> ${patient.vital_signs?.temperature || 'N/A'}</div>
                <div class="detail-item"><strong>Oxygen Saturation:</strong> ${patient.vital_signs?.oxygen_saturation || 'N/A'}</div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-pills"></i> Current Medications</h3>
                ${patient.current_medications?.map(med => `<div class="detail-item">${med}</div>`).join('') || '<div class="detail-item">None</div>'}
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-prescription-bottle"></i> Prescriptions</h3>
                ${patient.prescriptions?.map(pres => `
                    <div class="prescription-item">
                        <strong>${pres.name}</strong><br>
                        Quantity: ${pres.quantity}<br>
                        Dosage: ${pres.dosage}
                    </div>
                `).join('') || '<div class="detail-item">None</div>'}
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-history"></i> Medical History</h3>
                <div class="detail-item">${patient.medical_history || 'No significant history'}</div>
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-flask"></i> Recent Lab Results</h3>
                ${patient.lab_results?.map(lab => `
                    <div class="lab-item">
                        <strong>${lab.test}</strong>: ${lab.result} (${lab.date})
                    </div>
                `).join('') || '<div class="detail-item">No recent results</div>'}
            </div>

            <div class="detail-section">
                <h3><i class="fas fa-calendar-check"></i> Scheduled Checkups</h3>
                ${patient.checkups?.map(checkup => `
                    <div class="checkup-item">
                        <strong>${checkup.date}</strong>: ${checkup.purpose}
                    </div>
                `).join('') || '<div class="detail-item">No scheduled checkups</div>'}
            </div>
        </div>
    `;

    patientModal.style.display = 'block';
}

// Render Inventory
function renderInventory() {
    inventoryList.innerHTML = '';

    usersData.inventory.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'inventory-item';
        itemCard.innerHTML = `
            <h4>${item.name}</h4>
            <p><strong>Category:</strong> ${item.category.replace('_', ' ')}</p>
            <p><strong>Quantity:</strong> ${item.quantity}</p>
            <p><strong>Supplier:</strong> ${item.supplier || 'N/A'}</p>
            <p><strong>Expiry:</strong> ${item.expiry || 'N/A'}</p>
        `;
        inventoryList.appendChild(itemCard);
    });
}

// Update Statistics
function updateStats() {
    // This is mock data - in a real app, this would come from a database
    document.getElementById('total-operations').textContent = '247';
    document.getElementById('scheduled-today').textContent = '12';
    document.getElementById('completed-week').textContent = '89';
}

// Handle Logout
function handleLogout() {
    window.location.href = 'index.html';
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
