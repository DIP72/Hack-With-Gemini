   # Smart Perioperative Care System
   ## Overview

   🚀 The **Smart Perioperative Care System** is an innovative hospital management platform designed to streamline perioperative processes and enhance patient care through intelligent dashboards and voice-assisted medicine management. Built as a hackathon project by Team Avatars, this system leverages cutting-edge AI technology to provide seamless healthcare solutions.

   ## Features

   ### 🏥 Hospital Management Dashboard
   - **Role-based Access**: Separate interfaces for patients and hospital management staff
   - **Patient Management**: Comprehensive patient data handling and tracking
   - **Perioperative Workflow**: Streamlined processes for pre-operative, intra-operative, and post-operative care

   ### 🎤 Voice Assistant (Awaaz)
   - **Speech-to-Text (STT)**: Converts spoken queries into text using Google Gemini AI
   - **Natural Language Understanding (NLU)**: Analyzes intent and provides context-aware responses
   - **Text-to-Speech (TTS)**: Delivers responses in a professional Indian English accent
   - **Medicine Assistance**: Provides detailed information about dosages, timing, and side effects
   - **Multilingual Support**: Understands Hindi, English, and code-switching

   ### 🔐 Secure Authentication
   - **Role Selection**: Choose between Patient and Management roles during login
   - **Secure Login**: Username and password authentication with role-based redirection

   ### 📊 Data Management
   - **MongoDB Integration**: Robust database for storing patient and medicine data
   - **Mock Data Support**: Includes sample patient prescriptions for demonstration

   ## Tech Stack

   - **Backend**: Node.js, Express.js
   - **Database**: MongoDB with Mongoose
   - **AI/ML**: Google Gemini AI (Gemini 2.5 Flash models)
   - **Frontend**: HTML5, CSS3, JavaScript (ES6+)
   - **Additional Libraries**:
   - Multer (file uploads)
   - CORS (cross-origin resource sharing)
   - Dotenv (environment variables)

   ## Prerequisites

   ✅ Node.js (v14 or higher)  
   ✅ MongoDB (local or cloud instance)  
   ✅ Google Gemini API Key (hardcoded in server.js for hackathon purposes)

   ## Installation

   1. **Clone the repository**:
      ```bash
      git clone https://github.com/DIP72/Hack-With-Gemini.git
      cd Hack-With-Gemini
      ```

   2. **Install dependencies**:
      ```bash
      npm install
      ```

   3. **Set up environment variables**:
      Create a `.env` file in the root directory:
      ```
      PORT=5000
      MONGO_URI=mongodb://localhost:27017/hackathon_hospital_db
      ```

   4. **Start MongoDB**:
      Ensure MongoDB is running on your system or update `MONGO_URI` for a cloud instance.

   ## Usage

   1. 🚀 **Start the server**:
      ```bash
      npm start
      ```
      The server will run on `http://localhost:5000`

   2. 🌐 **Access the application**:
      - Open `Client/LandPage/views/index.html` in your browser for the landing page
      - Login with appropriate credentials and select your role (Patient or Management)

   3. 🎙️ **Using the Voice Assistant**:
      - Navigate to the Assistant interface (`Server/Assistant/index.html`)
      - Click the microphone button and speak your medicine-related query
      - The system will transcribe, process, and respond with voice and text

   ## Project Structure

   ```
   hack-with-gemini/
   ├── Client/
   │   ├── Data/
   │   │   ├── db.json
   │   │   └── users.json
   │   ├── LandPage/
   │   │   ├── css/
   │   │   ├── js/
   │   │   └── views/
   │   ├── Management/
   │   │   ├── static/
   │   │   └── views/
   │   └── Patient/
   ├── Server/
   │   └── Assistant/
   │       ├── index.html
   │       └── server.js
   ├── img/
   ├── .gitignore
   ├── package.json
   ├── package-lock.json
   ├── README.md
   └── TODO.md
   ```

   ## API Endpoints

   - `POST /api/transcribe`: Processes audio input for STT, NLU, and TTS response

   ## Contributing

   We welcome contributions to improve the Smart Perioperative Care System! Please follow these steps:

   1. Fork the repository
   2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
   3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
   4. Push to the branch (`git push origin feature/AmazingFeature`)
   5. Open a Pull Request

   ## License

   This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Authors

- **Team Avatars** - Hackathon Project Team
  - Atmadeep Maity - [LinkedIn](https://www.linkedin.com/in/atmadeep-maity-858893384/)
  - Aditya Narayan Panda - [LinkedIn](https://www.linkedin.com/in/aditya-panda-302454349/)
  - Anirban Pal - [LinkedIn](https://www.linkedin.com/in/anirban-pal-548239336/)
  

   ## Acknowledgments

   - Google Gemini AI for powering the voice assistant capabilities
   - Font Awesome for icons
   - Google Fonts for typography
   - Unsplash and iStock for hero images

   ## Future Enhancements

   - [ ] Real-time patient monitoring integration
   - [ ] Advanced analytics dashboard
   - [ ] Mobile app development
   - [ ] Multi-language support expansion
   - [ ] Integration with hospital EMR systems

   ---

   *Built with ❤️ for the Hack-With-Gemini Hackathon*
