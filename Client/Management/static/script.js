/****************************************************
 * SMART HOSPITAL – MINIMAL JSON VERSION
 * Storage: localStorage (Pure JSON, No Backend)
 ****************************************************/

// ---------- JSON DATABASE ----------
let patients = [];
let patientsJSON = null;

// Load patients from JSON file
async function loadPatientsData() {
    try {
        const response = await fetch('data/db.json');
        patientsJSON = await response.json();

        // Priority:
        // 1️⃣ localStorage (runtime data)
        // 2️⃣ JSON file (initial seed)
        patients = JSON.parse(localStorage.getItem("patients")) 
                   || patientsJSON.patients 
                   || [];

    } catch (error) {
        console.error("Error loading patients JSON:", error);
        patients = JSON.parse(localStorage.getItem("patients")) || [];
    }
}

// Save JSON to localStorage
function savePatients() {
    localStorage.setItem("patients", JSON.stringify(patients));
}

// ---------- LOAD ON START ----------
document.addEventListener("DOMContentLoaded", async () => {
    await loadPatientsData();
    updatePatientList();
    updateDropdowns();
});

// ---------- TAB SWITCHING ----------
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');

    if (tabId === 'admission') document.querySelectorAll('.nav-btn')[0].classList.add('active');
    if (tabId === 'care') document.querySelectorAll('.nav-btn')[1].classList.add('active');
    if (tabId === 'discharge') document.querySelectorAll('.nav-btn')[2].classList.add('active');

    updateDropdowns();
}

// ---------- ADMISSION ----------
document.getElementById('admissionForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = pName.value;
    const age = pAge.value;
    const contact = pContact.value;
    const email = pEmail.value || "Not Provided";
    const department = pDepartment.value;
    const doctor = pDoctor.value;
    const room = pRoom.value;
    const bed = pBed.value;

    const username = name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000);
    const password = Math.random().toString(36).slice(-8);

    patients.push({
        id: Date.now().toString(),
        name, age, contact, email,
        department, doctor, room, bed,
        username, password,
        status: "Admitted",
        medicines: [],
        logs: []
    });

    savePatients();
    updatePatientList();
    updateDropdowns();

    alert(`✅ Patient Admitted\nUsername: ${username}\nPassword: ${password}`);
    this.reset();
});

// ---------- CARE ----------
document.getElementById('careForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const patientId = carePatientSelect.value;
    if (!patientId) return alert("Select a patient");

    const patient = patients.find(p => p.id === patientId);

    if (medicineInput.value)
        patient.medicines.push(medicineInput.value);

    if (logInput.value)
        patient.logs.push({
            date: new Date().toLocaleString(),
            note: logInput.value
        });

    savePatients();
    alert("✅ Care record updated");
    this.reset();
});

// ---------- DISCHARGE ----------
function handleDischarge() {
    const patientId = dischargePatientSelect.value;
    if (!patientId) return alert("Select a patient");

    const patient = patients.find(p => p.id === patientId);

    if (!confirm(`Discharge ${patient.name}?`)) return;

    generatePDF(patient);
    patient.status = "Discharged";

    savePatients();
    updatePatientList();
    updateDropdowns();

    alert("✅ Patient discharged & PDF downloaded");
}

// ---------- PDF GENERATION ----------
function generatePDF(p) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setFontSize(22);
    doc.setTextColor(255);
    doc.text("SMART HOSPITAL MANAGEMENT", 105, 15, null, null, "center");

    doc.setFontSize(16);
    doc.text("DISCHARGE SUMMARY REPORT", 105, 30, null, null, "center");

    doc.setTextColor(0);
    doc.setFontSize(12);
    let y = 50;

    doc.setFont(undefined, 'bold');
    doc.text("PATIENT DETAILS", 20, y);
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

    doc.setFont(undefined, 'bold');
    doc.text("ADMISSION DETAILS", 20, y);
    doc.setFont(undefined, 'normal');
    y += 10;

    doc.text(`Doctor: Dr. ${p.doctor}`, 20, y);
    doc.text(`Department: ${p.department}`, 120, y);
    y += 8;

    doc.text(`Room: ${p.room}`, 20, y);
    doc.text(`Bed: ${p.bed}`, 120, y);
    y += 15;

    doc.line(20, y, 190, y);
    y += 10;

    doc.setFont(undefined, 'bold');
    doc.text("MEDICATIONS", 20, y);
    doc.setFont(undefined, 'normal');
    y += 10;

    if (p.medicines.length) {
        p.medicines.forEach((m, i) => {
            doc.text(`${i + 1}. ${m}`, 25, y);
            y += 7;
        });
    } else {
        doc.text("No medicines recorded", 25, y);
        y += 7;
    }

    y += 10;
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFont(undefined, 'bold');
    doc.text("DOCTOR NOTES", 20, y);
    doc.setFont(undefined, 'normal');
    y += 10;

    if (p.logs.length) {
        p.logs.forEach(l => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(10);
            doc.text(`[${l.date}]`, 25, y);
            y += 5;

            doc.setFontSize(12);
            const text = doc.splitTextToSize(l.note, 150);
            doc.text(text, 25, y);
            y += text.length * 7 + 5;
        });
    } else {
        doc.text("No logs recorded", 25, y);
    }

    doc.setFontSize(10);
    doc.text("Generated by Smart Hospital System", 105, 287, null, null, "center");

    doc.save(`${p.name.replace(/\s/g, "_")}_Discharge_Report.pdf`);
}

// ---------- DROPDOWNS ----------
function updateDropdowns() {
    carePatientSelect.innerHTML = '<option value="">-- Select Admitted Patient --</option>';
    dischargePatientSelect.innerHTML = '<option value="">-- Select Patient --</option>';

    patients.filter(p => p.status === "Admitted").forEach(p => {
        const opt = `<option value="${p.id}">${p.name} (${p.username})</option>`;
        carePatientSelect.innerHTML += opt;
        dischargePatientSelect.innerHTML += opt;
    });
}

// ---------- PATIENT LIST ----------
function updatePatientList() {
    patientListDisplay.innerHTML = "";

    if (!patients.length) {
        patientListDisplay.innerHTML = "<li>No patients stored</li>";
        return;
    }

    patients.forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${p.name}</strong> (${p.department})<br>
            Dr. ${p.doctor} | Room ${p.room} | <b>${p.status}</b>
        `;
        patientListDisplay.appendChild(li);
    });
}
