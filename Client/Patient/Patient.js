/**
 * =========================================
 * 1. MOCK DATA & CONFIGURATION
 * =========================================
 */
// Simulated Patient Data
const MOCK_PATIENT_DATA = {
    name: "John Doe",
    doctor: "Dr. Eleanor Vance",
    department: "Cardiology",
    room: "203A",
    status: "Discharged",
    followUp: "January 15, 2026",
    medications: [
        { name: "Amlodipine (5mg)", dose: "Once Daily", time: "8:00 AM" },
        { name: "Metformin (500mg)", dose: "Twice Daily", time: "9:00 AM & 6:00 PM" },
        { name: "Aspirin (81mg)", dose: "Once Daily", time: "10:00 AM" }
    ],
    logs: [
        { date: "Dec 10, 2025", remark: "Patient advised on diet changes and exercise. Stable condition." },
        { date: "Dec 09, 2025", remark: "Reviewed lab reports. Minor adjustment to blood pressure medication." },
    ]
};

/**
 * =========================================
 * 2. CORE DASHBOARD FUNCTIONS
 * =========================================
 */
function login() {
    const username = document.getElementById('usernameInput').value;
    if (username.trim()) {
        document.getElementById('loginOverlay').style.display = 'none';
        populateDashboard(MOCK_PATIENT_DATA);
    } else {
        alert("Please enter a username to proceed.");
    }
}

function populateDashboard(data) {
    // 1. Header and Status
    document.getElementById('dispName').textContent = data.name;
    document.getElementById('dispDoctor').textContent = data.doctor;
    document.getElementById('dispDept').textContent = data.department;
    document.getElementById('dispRoom').textContent = data.room;
    document.getElementById('dispFollowUp').textContent = data.followUp;
    
    const statusEl = document.getElementById('dispStatus');
    statusEl.textContent = data.status;
    statusEl.className = data.status === "Admitted" ? 'badge status-admitted' : 'badge status-discharged';

    // 2. Medications List
    const medListEl = document.getElementById('medList');
    medListEl.innerHTML = '';
    data.medications.forEach(med => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div><strong>${med.name}</strong></div>
            <span style="color: #888;">${med.dose} (${med.time})</span>
        `;
        medListEl.appendChild(li);
    });

    // 3. Doctor Notes
    const logListEl = document.getElementById('logList');
    logListEl.innerHTML = '';
    data.logs.forEach(log => {
        logListEl.innerHTML += `
            <div class="log-item">
                <small style="color: #888; display: block; margin-bottom: 5px;">${log.date}</small>
                <p>${log.remark}</p>
            </div>
        `;
    });
}


/**
 * =========================================
 * 3. GEMINI CHATBOT LOGIC
 * =========================================
 */

function addMessage(text, sender) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender === 'user' ? 'user-msg' : 'ai-msg'}`;
    messageDiv.innerHTML = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
    const userInput = document.getElementById('userMsg');
    const userText = userInput.value.trim();

    if (userText === "") return;

    addMessage(userText, 'user');
    userInput.value = '';

    // Show loading indicator
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'message ai-msg loading-dots';
    loadingMessage.id = 'ai-loading';
    loadingMessage.textContent = '...Thinking'; 
    document.getElementById('chatBox').appendChild(loadingMessage);
    document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;

    // --- Simulated AI Response ---
    setTimeout(() => {
        document.getElementById('ai-loading')?.remove();
        
        let aiResponse = "I can only provide general information based on your health data. Please contact your doctor for specific medical advice.";
        const lowerText = userText.toLowerCase();

        if (lowerText.includes("medication") || lowerText.includes("medicine")) {
            const medNames = MOCK_PATIENT_DATA.medications.map(m => `**${m.name}** (${m.dose})`).join(', ');
            aiResponse = `Your current prescribed medications are: ${medNames}. Would you like to know more about a specific one?`;
        } else if (lowerText.includes("symptom") || lowerText.includes("feel")) {
            aiResponse = `If your symptoms are severe, please contact emergency services. For non-urgent checks, use the **camera icon** to upload an image for the Visual Symptom Checker.`;
        } else if (lowerText.includes("doctor")) {
            aiResponse = `Your attending physician is **${MOCK_PATIENT_DATA.doctor}** from the ${MOCK_PATIENT_DATA.department} department.`;
        }

        addMessage(aiResponse, 'ai');

    }, 1500); 
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}


/**
 * =========================================
 * 4. MULTIMODAL (IMAGE) LOGIC
 * =========================================
 */
function handleImageUpload() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (!file) return;

    // 1. Display the image preview in the chat
    const reader = new FileReader();
    reader.onload = function(e) {
        const imgHtml = `<img src="${e.target.result}" style="max-width: 100%; height: auto; border-radius: 10px; margin-top: 5px;">`;
        addMessage(`*Image uploaded, please wait for analysis.*${imgHtml}`, 'user');
    };
    reader.readAsDataURL(file);

    // 2. Prompt user for analysis type
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

    // 3. Trigger the simulated API call
    sendMultimodalRequest(file, aiPrompt);
    
    fileInput.value = ''; 
}


function sendMultimodalRequest(imageFile, promptText) {
    // Show loading indicator
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'message ai-msg loading-dots';
    loadingMessage.id = 'ai-loading-multimodal';
    loadingMessage.textContent = '...Analyzing Image with Gemini'; 
    document.getElementById('chatBox').appendChild(loadingMessage);
    document.getElementById('chatBox').scrollTop = document.getElementById('chatBox').scrollHeight;
    
    // --- Simulated AI Response for Demo ---
    setTimeout(() => {
        document.getElementById('ai-loading-multimodal')?.remove();

        let simulatedResponse = "";
        if (promptText.includes("medicine")) {
            simulatedResponse = `
                💊 **Medicine Scan Result (Simulated)**
                <hr style="border: 0; border-top: 1px solid #eee; margin: 5px 0;">
                **Identified Drug:** Appears to be **Ibuprofen 200mg** (Common OTC Painkiller).
                <br><strong>Usage:</strong> Relief of mild to moderate pain, fever, and inflammation.
                <br><strong>Side Effects:</strong> May include stomach upset, nausea, or headache.
                <br><br><strong>Disclaimer:</strong> This is NOT a prescription. Consult your doctor or pharmacist.
            `;
             
        } else if (promptText.includes("symptom")) {
            simulatedResponse = `
                👀 **Symptom Check Assessment (Simulated)**
                <hr style="border: 0; border-top: 1px solid #eee; margin: 5px 0;">
                **Visual Assessment:** The image suggests visual characteristics consistent with a **mild localized rash or irritation**.
                <br><strong>Next Step:</strong> Please monitor the area.
                <br><strong>Recommended Specialist:</strong> Consult a **Dermatologist** for a formal diagnosis and treatment plan.
                <br><br><strong>Disclaimer:</strong> This is NOT a diagnosis.
            `;
             
        }

        addMessage(simulatedResponse, 'ai');

    }, 3000); 
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Start with the login overlay visible
});