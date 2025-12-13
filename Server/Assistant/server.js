// ====================================================================
// File: server.js (Node.js Backend) - UPDATED for Medicine Assistance
// ====================================================================
import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createPart, createUserContent } from '@google/genai/server';

// --- Configuration & Initialization ---
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🚨 HACKATHON-SPECIFIC: HARDCODED API KEY 🚨
const HARDCODED_API_KEY = "AIzaSyAhBJkO5oLgnoAeAAbABMedBkKJRo0GoH8";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: HARDCODED_API_KEY });
const STT_MODEL = 'gemini-2.5-flash'; 
const TTS_MODEL = 'gemini-2.5-flash-tts'; 
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hackathon_hospital_db';

// --- Middlewares ---
app.use(cors()); 
const upload = multer({ storage: multer.memoryStorage() }); 
app.use(express.json()); // To handle JSON body if needed

// --- MongoDB Schema and Mock Data ---
// In a hackathon, we use Mongoose for structure but mock the data lookup logic
const MedicineSchema = new mongoose.Schema({
    patientId: String,
    name: String,
    dosage: String,
    frequency: String, // e.g., "Twice a day"
    timing: String,    // e.g., "After breakfast, after dinner"
    sideEffects: String,
});
const Medicine = mongoose.model('Medicine', MedicineSchema);

// Mock Medicine Data (simulating a patient's current prescription)
const mockPatientMedicines = [
    { name: "Paracetamol", dosage: "500 mg", frequency: "Three times a day", timing: "After meals (Breakfast, Lunch, Dinner)", sideEffects: "Generally safe. Rarely, stomach upset or allergic reaction." },
    { name: "Amlodipine", dosage: "5 mg", frequency: "Once a day", timing: "Every morning before breakfast", sideEffects: "Dizziness, swelling in ankles or feet. Report severe swelling immediately." },
];

// --- MongoDB Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- Core Utility: Convert LINEAR16 to WAV format (Unchanged) ---
const createWavHeader = (dataLength, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) => {
    // ... (WAV header construction logic remains the same)
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF'); 
    view.setUint32(4, 36 + dataLength, true); 
    writeString(view, 8, 'WAVE'); 

    writeString(view, 12, 'fmt '); 
    view.setUint32(16, 16, true); 
    view.setUint16(20, 1, true); 
    view.setUint16(22, numChannels, true); 
    view.setUint32(24, sampleRate, true); 
    view.setUint32(28, byteRate, true); 
    view.setUint16(32, blockAlign, true); 
    view.setUint16(34, bitsPerSample, true); 

    writeString(view, 36, 'data'); 
    view.setUint32(40, dataLength, true); 

    return Buffer.from(buffer);
};


// --- Step 1 & 2: STT, NLU, and Structured Response (via Gemini) ---
const processAudioWithGemini = async (audioBuffer, mimeType) => {
    
    // Convert mock medicine data into a string for Gemini context
    const patientPrescriptionContext = mockPatientMedicines.map(med => 
        `Medicine: ${med.name}, Dose: ${med.dosage}, Frequency: ${med.frequency}, Timing: ${med.timing}, Warnings: ${med.sideEffects}`
    ).join(' | ');

    // UPDATED System Instruction for clinical assistance
    const systemInstruction = `You are 'Awaaz' (Voice), a Clinical Pharmacist AI Assistant for a hospital. You understand Hindi, English (India), and code-switching. Your user is an admitted or discharged patient asking about their medication cycle.

    **Patient Prescription Context:**
    [${patientPrescriptionContext}]

    Your task is to: 
    1. Transcribe the user's spoken input.
    2. Analyze the intent. If the user asks about a medicine's DOSE, TIMING, or CONSEQUENCES (side effects), look up the information in the 'Patient Prescription Context' and provide a detailed, reassuring, and precise answer. If the medicine is not found, provide general guidance.
    3. Output ONLY the transcription and response in the specified JSON format. 
    Example (Medicine Query): {"transcript": "Paracetamol kab lena hai?", "response": "You must take your 500 mg Paracetamol three times a day, specifically after your breakfast, lunch, and dinner."}
    `;
    
    const audioPart = createPart({
        inlineData: {
            mimeType: mimeType,
            data: audioBuffer.toString('base64'),
        },
    });

    try {
        const response = await ai.models.generateContent({
            model: STT_MODEL,
            contents: createUserContent([
                audioPart,
                createPart({ text: "Transcribe the audio and generate the clinical assistant response based on the intent and the patient context provided in the system instructions. STRICTLY provide output in the requested JSON format." }),
            ]),
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json", 
            },
        });

        const jsonText = response.text.trim().replace(/^```json|```$/g, '');
        const jsonResponse = JSON.parse(jsonText);

        return {
            transcript: jsonResponse.transcript,
            response: jsonResponse.response,
        };

    } catch (error) {
        console.error('Gemini Audio Processing Error:', error);
        throw new Error(`Gemini STT/NLU failed. Error: ${error.message.substring(0, 80)}...`);
    }
};

// --- Step 3: TTS for Indian Accent (Unchanged) ---
const synthesizeSpeechWithGemini = async (text) => {
    try {
        const response = await ai.models.generateContent({
            model: TTS_MODEL,
            contents: createUserContent([
                createPart({ text: text })
            ]),
            config: {
                responseModalities: 'audio',
                speechConfig: {
                    prompt: `Speak this in a professional, polite, and clear Indian English accent.`,
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Aoede" } 
                    },
                    outputFormat: 'LINEAR16', 
                },
            },
        });
        
        const audioPart = response.candidates[0].content.parts.find(p => p.inlineData && p.inlineData.mimeType.startsWith('audio/'));
        if (!audioPart) {
             throw new Error('Gemini TTS did not return audio data.');
        }
        
        const rawAudioBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
        const wavHeader = createWavHeader(rawAudioBuffer.length);
        const finalWavBuffer = Buffer.concat([wavHeader, rawAudioBuffer]);

        return finalWavBuffer.toString('base64');

    } catch (error) {
        console.error('Gemini TTS Error:', error);
        throw new Error(`Gemini TTS failed. Error: ${error.message.substring(0, 80)}...`);
    }
};


// --- Voice Assistant API Route (Unchanged) ---
app.post('/api/transcribe', upload.single('audioFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype; 

    try {
        const { transcript, response: assistantResponse } = await processAudioWithGemini(audioBuffer, mimeType);
        
        const audioBase64 = await synthesizeSpeechWithGemini(assistantResponse);

        const audioUrl = `data:audio/wav;base64,${audioBase64}`; 

        res.status(200).json({
            transcript: transcript,
            voiceAssistantResponse: assistantResponse,
            audioUrl: audioUrl,
        });

    } catch (error) {
        console.error('Final API Error:', error.message);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});