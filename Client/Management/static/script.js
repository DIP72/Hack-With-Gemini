// API URL (The JSON Server)
const API_URL = "http://localhost:3000/patients";

// We still keep a local array for easy display, 
// but we sync it with the database.
let patients = []; 

// --- 1. LOAD DATA ON STARTUP ---
document.addEventListener("DOMContentLoaded", () => {
    fetchPatients();
});

// Function to Fetch Data from JSON File
async function fetchPatients() {
    try {
        const response = await fetch(API_URL);
        patients = await response.json();
        updatePatientList(); // Update the UI
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// --- TAB SWITCHING LOGIC ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    const buttons = document.querySelectorAll('.nav-btn');
    if(tabId === 'admission') buttons[0].classList.add('active');
    if(tabId === 'care') buttons[1].classList.add('active');
    if(tabId === 'discharge') buttons[2].classList.add('active');

    // Refresh data when switching tabs to ensure we have latest JSON
    fetchPatients().then(() => updateDropdowns());
}

// --- 2. ADMISSION LOGIC (POST REQUEST) ---
document.getElementById('admissionForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('pName').value;
    const age = document.getElementById('pAge').value;
    const contact = document.getElementById('pContact').value;
    const email = document.getElementById('pEmail').value || "Not Provided"; 
    const department = document.getElementById('pDepartment').value;
    const doctor = document.getElementById('pDoctor').value;
    const room = document.getElementById('pRoom').value;
    const bed = document.getElementById('pBed').value;

    const username = name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000);
    const password = Math.random().toString(36).slice(-8);

    const newPatient = {
        // ID is generated automatically by JSON Server usually, but we can pass one
        id: Date.now().toString(), 
        name, age, contact, email, department, doctor, room, bed,
        username, password,
        status: 'Admitted',
        logs: [],
        medicines: []
    };

    // SAVE TO JSON FILE
    try {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPatient)
        });

        alert(`✅ Patient Admitted to Database!\nUsername: ${username}\nPassword: ${password}`);
        document.getElementById('admissionForm').reset();
        fetchPatients(); // Reload data
    } catch (error) {
        alert("Error saving to database");
    }
});

// --- 3. CARE LOGIC (PUT REQUEST) ---
document.getElementById('careForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const patientId = document.getElementById('carePatientSelect').value;
    const medicine = document.getElementById('medicineInput').value;
    const log = document.getElementById('logInput').value;

    if (!patientId) return alert("Select a patient");

    // 1. Find current patient data
    const patient = patients.find(p => p.id == patientId);
    
    // 2. Update local object
    if(medicine) patient.medicines.push(medicine);
    if(log) patient.logs.push({ date: new Date().toLocaleString(), note: log });

    // 3. Send UPDATE to JSON File
    try {
        await fetch(`${API_URL}/${patientId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patient)
        });
        
        alert("Record Updated in Database!");
        document.getElementById('careForm').reset();
        fetchPatients();
    } catch (error) {
        console.error("Update failed", error);
    }
});

// --- 4. DISCHARGE LOGIC (PDF GENERATION) ---
async function handleDischarge() {
    const patientId = document.getElementById('dischargePatientSelect').value;
    if (!patientId) return alert("Please select a patient to discharge!");

    // Find the patient object
    const patient = patients.find(p => p.id == patientId);

    const confirmDischarge = confirm(`Are you sure you want to discharge ${patient.name}?\n\nThis will download their medical record as a PDF.`);

    if (confirmDischarge) {
        // 1. Generate the PDF
        generatePDF(patient);

        // 2. Update Status in Database
        patient.status = 'Discharged';
        
        try {
            await fetch(`${API_URL}/${patientId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patient)
            });

            alert(`✅ Patient Discharged Successfully.\nPDF Report Downloading...`);
            fetchPatients().then(() => updateDropdowns()); // Refresh UI
            
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating database.");
        }
    }
}

// --- HELPER: GENERATE PDF ---
function generatePDF(p) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // -- HEADER --
    doc.setFillColor(41, 128, 185); // Blue header
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("SMART HOSPITAL MANAGEMENT", 105, 15, null, null, "center");
    doc.setFontSize(16);
    doc.text("DISCHARGE SUMMARY REPORT", 105, 30, null, null, "center");

    // -- PATIENT DETAILS --
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    let y = 50; // Vertical starting position

    doc.setFont(undefined, 'bold');
    doc.text("PATIENT DETAILS:", 20, y);
    doc.setFont(undefined, 'normal');
    y += 10;
    
    doc.text(`Name: ${p.name}`, 20, y);
    doc.text(`Age: ${p.age}`, 120, y);
    y += 8;
    doc.text(`Patient ID: ${p.username}`, 20, y);
    doc.text(`Contact: ${p.contact}`, 120, y);
    y += 8;
    doc.text(`Email: ${p.email}`, 20, y);
    y += 15;

    // -- ADMISSION DETAILS --
    doc.setFont(undefined, 'bold');
    doc.text("HOSPITAL ADMISSION INFO:", 20, y);
    doc.setFont(undefined, 'normal');
    y += 10;
    
    doc.text(`Attending Doctor: Dr. ${p.doctor}`, 20, y);
    doc.text(`Department: ${p.department}`, 120, y);
    y += 8;
    doc.text(`Room No: ${p.room}`, 20, y);
    doc.text(`Bed No: ${p.bed}`, 120, y);
    y += 15;

    // -- MEDICINES --
    doc.setLineWidth(0.5);
    doc.line(20, y, 190, y); // Horizontal line
    y += 10;

    doc.setFont(undefined, 'bold');
    doc.text("MEDICATIONS PRESCRIBED:", 20, y);
    y += 10;
    doc.setFont(undefined, 'normal');

    if (p.medicines && p.medicines.length > 0) {
        p.medicines.forEach((med, index) => {
            doc.text(`${index + 1}. ${med}`, 25, y);
            y += 7;
        });
    } else {
        doc.text("No specific medications recorded.", 25, y);
        y += 7;
    }
    y += 10;

    // -- DAILY LOGS --
    doc.line(20, y, 190, y);
    y += 10;
    
    doc.setFont(undefined, 'bold');
    doc.text("DOCTOR'S NOTES / DAILY LOGS:", 20, y);
    y += 10;
    doc.setFont(undefined, 'normal');

    if (p.logs && p.logs.length > 0) {
        p.logs.forEach((log) => {
            // Check if we are at the bottom of the page
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`[${log.date}]`, 25, y);
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            // Split long text so it fits the page width
            const splitNote = doc.splitTextToSize(log.note, 150);
            doc.text(splitNote, 25, y + 5);
            
            y += (splitNote.length * 7) + 10; // Adjust spacing based on text length
        });
    } else {
        doc.text("No daily logs recorded.", 25, y);
    }

    // -- FOOTER --
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Generated by Smart Hospital System", 105, pageHeight - 10, null, null, "center");

    // Save File
    doc.save(`${p.name.replace(" ", "_")}_Discharge_Summary.pdf`);
}

// --- HELPER: UPDATE DROPDOWNS ---
function updateDropdowns() {
    const careSelect = document.getElementById('carePatientSelect');
    const dischargeSelect = document.getElementById('dischargePatientSelect');
    
    careSelect.innerHTML = '<option value="">-- Select Admitted Patient --</option>';
    dischargeSelect.innerHTML = '<option value="">-- Select Patient --</option>';

    const admittedPatients = patients.filter(p => p.status === 'Admitted');

    admittedPatients.forEach(p => {
        const option = `<option value="${p.id}">${p.name} (ID: ${p.username})</option>`;
        careSelect.innerHTML += option;
        dischargeSelect.innerHTML += option;
    });
}

// --- HELPER: DEBUG LIST ---
function updatePatientList() {
    const list = document.getElementById('patientListDisplay');
    list.innerHTML = '';
    
    if (patients.length === 0) {
        list.innerHTML = '<li>No patients in JSON database.</li>';
        return;
    }

    patients.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${p.name}</strong> <span style="font-size:0.8em">(${p.department})</span>
                <br><small>Dr. ${p.doctor} | Room: ${p.room}</small>
            </div>
            <div>${p.status}</div>
        `;
        list.appendChild(li);
    });
}