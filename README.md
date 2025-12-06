# 🎯 Dot Collector - Peer Feedback Application

A real-time peer feedback tool with comprehensive heatmap visualization. Perfect for classroom presentations, team meetings, and group evaluations.

![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10.x-FFA611?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)

## ✨ Features

- **📊 Real-time Feedback Grid** - See all participants' ratings in an interactive heatmap
- **🎨 4 Evaluation Categories** - Rate across Delivery, Content, Audience Impact, and Structure
- **🔒 Privacy Controls** - Review anonymity with flexible reveal settings
- **👥 Live Collaboration** - Updates in real-time as participants submit reviews
- **📱 Mobile Responsive** - Works seamlessly on phones, tablets, and desktops
- **🌙 Dark Mode** - Automatic dark mode with manual toggle
- **📄 PDF Export** - Save feedback reports as PDFs

## 🎯 How It Works

### For Session Hosts:
1. Visit the admin panel and create a session
2. Share the unique 6-character code with participants
3. Start the session when everyone has joined
4. Monitor feedback in real-time
5. Export results as PDFs

### For Participants:
1. Visit the home page
2. Enter your name and the session code
3. Submit reviews for your peers across different categories
4. View the comprehensive feedback grid
5. See your own feedback summary

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dot-collector.git
cd dot-collector

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Environment Setup

1. Copy `.env.example` to `.env`
2. Add your Firebase credentials to `.env`
3. Restart the dev server

## 📊 Evaluation Categories

### 1. Delivery Dynamics
- Voice Clarity
- Pacing & Flow
- Body Language
- Energy Level
- Professionalism

### 2. Content Strength  
- Concept Clarity
- Depth of Analysis
- Argument Logic
- Evidence & Data
- Relevance

### 3. Audience Impact
- Engagement
- Interaction / Q&A
- Inspiration
- Empathy / Tone
- Key Takeaway

### 4. Structure & Visuals
- Visual Aids
- Organization
- Time Management
- Opening Hook
- Closing Impact

## 🎨 Score Legend

Ratings from 1-6 with color coding:
- **6** - Excellent (Dark Green)
- **5** - Very Good (Emerald)
- **4** - Good (Lime)
- **3** - Below Average (Amber)
- **2** - Poor (Orange)
- **1** - Very Poor (Red)

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore + Authentication)
- **Routing**: React Router
- **PDF**: jsPDF + html2canvas
- **Icons**: Lucide React

## 📂 Project Structure

```
src/
├── components/      # React components
│   ├── Auth/       # Authentication components
│   ├── Grid/       # Feedback grid visualization
│   ├── Student/    # Participant interfaces
│   └── Teacher/    # Host/Admin interfaces
├── config/         # Configuration files
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── App.jsx         # Main application component
├── firebase.js     # Firebase initialization
└── main.jsx        # Entry point
```

## 📱 Mobile Support

The app is fully responsive and optimized for:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktop computers

## 🎓 Use Cases

- **Education**: Classroom presentations and peer evaluations
- **Business**: Team meetings and performance reviews
- **Events**: Conference speakers and workshop facilitators
- **Training**: Skills assessment and coaching sessions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

---

Built for effective peer feedback and continuous improvement.
