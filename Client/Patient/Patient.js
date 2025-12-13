/**
 * =========================================
 * 1. CONFIGURATION & HARDCODED DATABASE
 * =========================================
 */
// WARNING: In a real app, never expose your API key like this! 
const GEMINI_API_KEY = "AIzaSyAFRl2r-HoQAv9z8IW8xQviFF_eGUjNfVA";

// --- HARDCODED PATIENTS DATABASE ---
const PATIENTS_DATABASE = [
    {
        "id": "P001", // Currently Admitted Patient (Original)
        "name": "Jane Smith",
        "doctor": "Dr. Ben Carson",
        "department": "Orthopedics",
        "room": "312",
        "status": "Admitted",
        "followUp": "N/A (In-patient)",
        "diagnosis": "Left Femur Fracture",
        "medications": [
            { "name": "Codeine (30mg)", "dose": "Every 4 hours PRN", "time": "Pain Management" },
            { "name": "Cefazolin (1g)", "dose": "Twice Daily", "time": "8:00 AM & 8:00 PM" },
            { "name": "Vitamin D", "dose": "Once Daily", "time": "10:00 AM" }
        ],
        "logs": [
            { "date": "Dec 13, 2025", "remark": "Post-operative: Patient stable, complaining of mild discomfort. Vitals normal." },
            { "date": "Dec 12, 2025", "remark": "Successful procedure completed. Patient transferred to recovery ward." }
        ]
    },
    {
        "id": "P002", // Discharged Patient with Home Care Plan
        "name": "David Chen",
        "doctor": "Dr. Sarah Miller",
        "department": "Cardiology",
        "room": "N/A",
        "status": "Discharged",
        "followUp": "January 25, 2026, 11:00 AM",
        "diagnosis": "Stable Angina",
        "medications": [
            { "name": "Aspirin (81mg)", "dose": "Once Daily", "time": "8:00 AM" },
            { "name": "Amlodipine (5mg)", "dose": "Once Daily", "time": "8:00 AM" },
            { "name": "Lipitor (20mg)", "dose": "Once Daily", "time": "6:00 PM" }
        ],
        "logs": [
            { "date": "Dec 01, 2025", "remark": "Patient discharged. Condition stable. Diet and exercise plan provided." },
            { "date": "Nov 28, 2025", "remark": "Echocardiogram results reviewed. Medication adjusted for home care." }
        ]
    },
    {
        "id": "P003", // Admitted Patient for Respiratory Illness
        "name": "Maria Garcia",
        "doctor": "Dr. James Wilson",
        "department": "Pulmonology",
        "room": "405",
        "status": "Admitted",
        "followUp": "N/A (In-patient)",
        "diagnosis": "Community-Acquired Pneumonia",
        "medications": [
            { "name": "Azithromycin (500mg)", "dose": "Once Daily", "time": "10:00 AM" },
            { "name": "Acetaminophen (500mg)", "dose": "Every 6 hours PRN", "time": "Fever/Pain" }
        ],
        "logs": [
            { "date": "Dec 13, 2025", "remark": "Fever spike resolved. Oxygen saturation stable at 95% on room air." },
            { "date": "Dec 11, 2025", "remark": "Admitted due to severe shortness of breath and high fever." }
        ]
    }
];

// --- SET THE DEFAULT PATIENT HERE ---
// Change this ID to 'P002' or 'P003' to load a different scenario instantly!
const DEFAULT_PATIENT_ID = "P001"; 

// Initialize the global variable
let PATIENT_DATA = PATIENTS_DATABASE.find(p => p.id === DEFAULT_PATIENT_ID);


/**
 * =========================================
 * 2. DASHBOARD POPULATION
 * =========================================
 */

function populateDashboard(data) {
    // ... (This function remains the same, it populates the HTML fields using the data object) ...
    document.getElementById('dispName').textContent = data.name;
    document.getElementById('dispDoctor').textContent = data.doctor;
    document.getElementById('dispDept').textContent = data.department;
    document.getElementById('dispRoom').textContent = data.room;
    document.getElementById('dispFollowUp').textContent = data.followUp;
    
    const statusEl = document.getElementById('dispStatus');
    statusEl.textContent = data.status;
    statusEl.className = data.status === "Admitted" ? 'badge status-admitted' : 'badge status-discharged';

    const medListEl = document.getElementById('medList');
    medListEl.innerHTML = '';
    data.medications.forEach(med => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div><strong>${med.name}</strong></div>
            <span style="color: var(--text-muted);">${med.dose} (${med.time})</span>
        `;
        medListEl.appendChild(li);
    });

    const logListEl = document.getElementById('logList');
    logListEl.innerHTML = '';
    data.logs.forEach(log => {
        logListEl.innerHTML += `
            <div class="log-item">
                <small style="color: var(--text-muted); display: block; margin-bottom: 5px;">${log.date}</small>
                <p>${log.remark}</p>
            </div>
        `;
    });
}


/**
 * =========================================
 * 3. FULLY RESPONSIVE GEMINI CHATBOT LOGIC
 * =========================================
 */
 
// --- Canned Knowledge Base for General Queries (Simulating "details of any medicine or disease") ---
const KNOWLEDGE_BASE = {
    "aspirin": "Aspirin (acetylsalicylic acid) is a common medication used to reduce fever and pain. It's also used as an antiplatelet agent (blood thinner) to prevent heart attacks and strokes. Always check with a doctor before starting new medication.",
    "ibuprofen": "Ibuprofen is a Nonsteroidal Anti-Inflammatory Drug (NSAID) used to relieve pain, decrease fever, and reduce inflammation. It is commonly used for headaches, menstrual cramps, and arthritis.",
    "diabetes": "Diabetes is a chronic disease that occurs either when the pancreas does not produce enough insulin or when the body cannot effectively use the insulin it produces. Management typically involves diet, exercise, and medication like Metformin.",
    "flu": "The flu (influenza) is a contagious respiratory illness caused by influenza viruses. Symptoms include fever, cough, sore throat, and body aches. The best prevention is the annual flu shot.",
    "paracetamol": "Paracetamol (acetaminophen) is a widely used medication that treats pain and reduces fever. It is generally safe when taken at recommended doses but can cause liver damage if overdosed.",
    "pneumonia": "Pneumonia is an infection that inflames the air sacs in one or both lungs. The air sacs may fill with fluid or pus, causing cough with phlegm or pus, fever, chills, and difficulty breathing. Treatment usually involves antibiotics.",
    "angina": "Angina is chest pain caused by reduced blood flow to the heart. It is a symptom of coronary artery disease. Medications like nitroglycerin or beta-blockers are used to manage it.",
};


function addMessage(text, sender) { /* ... (remains the same) ... */
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'user' ? 'user-msg' : 'ai-msg'}`;
    messageDiv.innerHTML = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function createLoadingMessage(text, id = 'ai-loading') { /* ... (remains the same) ... */
    const chatBox = document.getElementById('chatBox');
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'message ai-msg loading-dots';
    loadingMessage.id = id;
    loadingMessage.textContent = text; 
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
    return loadingMessage;
}

function handleEnter(event) { /* ... (remains the same) ... */
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendMessage() {
    const userInput = document.getElementById('userMsg');
    const userText = userInput.value.trim();

    if (userText === "") return;

    addMessage(userText, 'user');
    userInput.value = '';

    const loadingMessage = createLoadingMessage('...Thinking, generating detailed response');

    setTimeout(() => {
        document.getElementById('ai-loading')?.remove();
        
        const lowerText = userText.toLowerCase();
        let aiResponse = "";
        
        // --- 1. CHECK AGAINST GENERAL KNOWLEDGE BASE ---
        let foundGeneralKnowledge = false;
        for (const [keyword, info] of Object.entries(KNOWLEDGE_BASE)) {
            if (lowerText.includes(keyword)) {
                aiResponse = `
                    **General Medical Information (Simulated):**
                    <br>${info}
                    <br><br>🚨 This information is general. Do not self-treat. Consult your doctor for personal advice.
                `;
                foundGeneralKnowledge = true;
                break;
            }
        }

        if (foundGeneralKnowledge) {
            addMessage(aiResponse, 'ai');
            return;
        }


        // --- 2. SEARCH FOR SPECIFIC PATIENT MEDICINE NAMES (LOCAL RECORDS) ---
        const userQueryWords = lowerText.split(/\s+/);
        let foundMedication = null;

        for (const med of PATIENT_DATA.medications) {
            const medNameLower = med.name.toLowerCase();
            if (userQueryWords.some(word => medNameLower.includes(word) || medNameLower.startsWith(word))) {
                foundMedication = med;
                break; 
            }
        }
        
        if (foundMedication) {
            aiResponse = `
                **Your Prescription Information (Local Data):**
                <br>I found **${foundMedication.name}** in your records.
                <br>Its prescribed dosage is: **${foundMedication.dose}**.
                <br>It is taken for: **${foundMedication.time}**.
                <br><br>Always follow your doctor's specific instructions.
            `;
        } 
        
        // --- 3. SEARCH FOR PATIENT DIAGNOSIS/CONDITION NAMES (LOCAL RECORDS) ---
        else if (lowerText.includes(PATIENT_DATA.diagnosis.toLowerCase().split(' ')[0]) || lowerText.includes("fracture") || lowerText.includes("angina") || lowerText.includes("pneumonia") ) {
             aiResponse = `
                Your primary condition is **${PATIENT_DATA.diagnosis}**. Your physician is **${PATIENT_DATA.doctor}**. 
                The plan focuses on managing symptoms and recovery. You are currently in room **${PATIENT_DATA.room}**.
            `;
        }
        
        // --- 4. HIGH-PRIORITY CONTEXTUAL QUERIES (BROAD) ---
        else if (lowerText.includes("pain") || lowerText.includes("fever") || lowerText.includes("shortness of breath")) {
            const symptomMed = PATIENT_DATA.medications.find(m => m.time.includes("Pain") || m.time.includes("Fever"));
            if (symptomMed) {
                 aiResponse = `
                    I am sorry you are experiencing ${lowerText}. You have **${symptomMed.name}** prescribed for this. 
                    **Action:** Please alert your nurse so they can log the dose and assess your current vital signs immediately.
                `;
            } else {
                 aiResponse = "Please alert your nurse immediately regarding your symptoms. I can only provide information, not clinical action.";
            }

        }
        
        // --- 5. DEFAULT/CATCH-ALL QUERY ---
        else {
            aiResponse = `
                I am your Gemini-powered Health Assistant. I specialize in your personal care data.
                <br>I couldn't find a direct match for that specific term. Please try a simpler name, or ask me about your **medications**, **diagnosis**, or use the camera icon for a **visual scan**.
            `;
        }

        addMessage(aiResponse, 'ai');

    }, 1200); 
}

function handleImageUpload() {
    /* ... (remains the same) ... */
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const imgHtml = `<img src="${e.target.result}" style="max-width: 100%; height: auto; border-radius: 10px; margin-top: 5px;">`;
        addMessage(`*Image uploaded, please wait for analysis.*${imgHtml}`, 'user');
    };
    reader.readAsDataURL(file);

    const analysisType = prompt("What are you scanning? Enter 'medicine' or 'symptom':").toLowerCase();

    let aiPrompt = "";
    if (analysisType === 'medicine') {
        aiPrompt = "Analyze this image of a pill/medicine strip. Identify the name and dosage, and provide a brief summary of its common usage and side effects.";
    } else if (analysisType === 'symptom') {
        aiPrompt = "Analyze this image for any visible external symptoms. Provide a non-diagnostic assessment and recommend the appropriate specialist. **DO NOT give a medical diagnosis.**";
    } else {
        addMessage("Please re-upload and specify 'medicine' or 'symptom' for the analysis.", 'ai');
        fileInput.value = ''; 
        return;
    }

    sendMultimodalRequest(file, aiPrompt);
    fileInput.value = ''; 
}

function sendMultimodalRequest(imageFile, promptText) {
    const loadingMessage = createLoadingMessage('...Analyzing Image with Gemini', 'ai-loading-multimodal');
    
    // --- SMART Simulated AI Response for Multimodal ---
    setTimeout(() => {
        document.getElementById('ai-loading-multimodal')?.remove();

        let simulatedResponse = "";
        
        // Find a relevant medication from the patient's record for a simulated match
        const relevantMed = PATIENT_DATA.medications.find(m => m.name.includes('mg') || m.name.includes('Vitamin')) || {name: 'Unidentified Medicine', dose: 'N/A'};
        const symptomCondition = PATIENT_DATA.diagnosis;

        if (promptText.includes("medicine")) {
            simulatedResponse = `
                💊 **Medicine Scan Result (Simulated)**
                <hr style="border: 0; border-top: 1px solid #6c757d; margin: 5px 0;">
                **Identified Drug:** Appears to match **${relevantMed.name}**.
                <br><strong>Usage:</strong> ${relevantMed.time}.
                <br><strong>Your Dosage:</strong> **${relevantMed.dose}**.
                <br><br><strong>ACTION:</strong> Confirm this is the correct pill before taking.
            `;
            
        } else if (promptText.includes("symptom")) {
            simulatedResponse = `
                👀 **Symptom Check Assessment (Simulated)**
                <hr style="border: 0; border-top: 1px solid #6c757d; margin: 5px 0;">
                **Visual Assessment:** The image suggests potential inflammation or localized issue near the ${symptomCondition} site.
                <br><strong>Action:</strong> Please inform your attending nurse immediately.
                <br><strong>Recommended Specialist:</strong> **${PATIENT_DATA.department} Team**.
                <br><br><strong>Disclaimer:</strong> This is NOT a diagnosis.
            `;
        }

        addMessage(simulatedResponse, 'ai');

    }, 3000); 
}


/**
 * =========================================
 * 4. INITIALIZATION
 * =========================================
 */

// --- INITIALIZATION: Automatically load the dashboard on page load ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if the default patient was found
    if (PATIENT_DATA) {
        populateDashboard(PATIENT_DATA);
        const initialGreeting = `Welcome, ${PATIENT_DATA.name.split(' ')[0]}! You are currently **${PATIENT_DATA.status}** with ${PATIENT_DATA.diagnosis}. How can I assist you today?`;
        addMessage(initialGreeting, 'ai');
    } else {
        alert("Error: Default patient data (ID: P001) not found in the database!");
    }
});