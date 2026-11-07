# 🛡️ PhishGuard – AI-Based Phishing Message and URL Detection System

### 🔍 Intelligent Phishing Detection Using Machine Learning

<p align="center">

**Detect • Analyze • Protect**

</p>

## 🌐 Live Application

### [🚀 Visit PhishGuard](https://phishguardmini-dtljimyfz-sai-sudha.vercel.app/)


## 📌 About the Project

PhishGuard is an intelligent web-based application designed to detect potentially phishing messages, emails, and suspicious URLs using Machine Learning techniques.

The application helps users identify potential phishing attacks by analysing suspicious content and presenting classification results with understandable explanations.

It combines an interactive frontend, authentication, database integration, and analysis history to provide a user-friendly cybersecurity solution.

## 🎯 Objectives

- Detect potentially phishing SMS messages and emails.
- Identify suspicious URLs.
- Apply Machine Learning techniques for phishing classification.
- Provide understandable explanations for suspicious indicators.
- Maintain analysis history.
- Provide a user-friendly dashboard.
- Improve cybersecurity awareness.

## ✨ Features

### 👤 Authentication
- User registration and login.
- Secure authentication using Supabase.
- User session management.

### 📩 Message Analysis
- Analyse suspicious SMS messages.
- Analyse email content.
- Identify phishing-related patterns.
- Display classification results.

### 🔗 URL Analysis
- Analyse suspicious URLs.
- Identify suspicious URL characteristics.
- Detect potentially malicious link patterns.

### 🤖 AI & Machine Learning
- Machine Learning-based phishing classification.
- Text feature extraction using TF-IDF.
- Classification using Logistic Regression and Naive Bayes.
- URL classification using Random Forest.
- Model evaluation using classification metrics.

### 🔍 Explainable Detection
- Identify suspicious urgency.
- Detect account suspension threats.
- Identify credential-related language.
- Highlight suspicious URL patterns.
- Display understandable detection explanations.

### 📊 Dashboard
- View analysis statistics.
- Monitor phishing detections.
- Access recent analysis results.
- Visualize detection information.

### 📜 Analysis History
- View previous analysis results.
- Access saved detection information.
- Track suspicious messages and URLs.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React | Frontend development |
| TypeScript | Type-safe development |
| Vite | Development server and build tool |
| Tailwind CSS | UI styling |
| Supabase | Backend services |
| Supabase Auth | User authentication |
| PostgreSQL | Database |
| Supabase Edge Functions | Server-side functions |
| Python | Machine Learning development |
| Scikit-learn | ML algorithms |
| Pandas | Data processing |
| TF-IDF | Text feature extraction |
| Git | Version control |
| GitHub | Repository management |

## 🏗️ System Architecture

```text
             USER
              |
              v
       REACT FRONTEND
    TypeScript + Tailwind
              |
              v
       SUPABASE SERVICES
       |       |       |
       v       v       v
   AUTH     DATABASE  FUNCTIONS
       |       |       |
       +-------+-------+
               |
               v
      PHISHING ANALYSIS
               |
       +-------+-------+
       |               |
       v               v
 MESSAGE ANALYSIS   URL ANALYSIS
       |               |
       v               v
  ML CLASSIFIER    ML CLASSIFIER
       |               |
       +-------+-------+
               |
               v
       DETECTION RESULTS
               |
               v
       DASHBOARD & HISTORY
```

## 📂 Project Structure

```text
PhishGuard Mini/
│
├── bolt/
├── node_modules/
│
├── src/
│   ├── components/
│   │   ├── AppShell.tsx
│   │   ├── HistoryView.tsx
│   │   ├── LoginPage.tsx
│   │   └── ResultCard.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── supabase.ts
│   │
│   ├── types/
│   │   └── analysis.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── supabase/
│   ├── functions/
│   ├── migrations/
│   ├── config.toml
│   └── functions-deploy-state.json
│
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js
- npm
- Git
- Visual Studio Code
- Supabase account

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
```

```bash
cd PhishGuard-Mini
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Configure the required Supabase credentials.

### 4. Run the Application

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
```

## 🧠 Machine Learning Workflow

### Message Classification

1. Collect labelled phishing and legitimate message datasets.
2. Perform text preprocessing.
3. Extract features using TF-IDF.
4. Train classification algorithms.
5. Evaluate model performance.
6. Integrate predictions into the application.

### URL Classification

1. Collect phishing and legitimate URL datasets.
2. Extract URL-based features.
3. Identify suspicious URL patterns.
4. Train Random Forest classifier.
5. Evaluate classification performance.

### Evaluation Metrics

- Accuracy
- Precision
- Recall
- F1-score
- Confusion Matrix

## 🔐 Security Considerations

- Secure authentication.
- Protected user sessions.
- Secure environment variable management.
- Database access control.
- Input validation.
- Safe suspicious URL analysis.
- Avoid storing sensitive credentials in plain text.

## 📸 Screenshots

### Application Dashboard

_Add your dashboard screenshot here._

### Message Analysis

_Add your message analysis screenshot here._

### URL Analysis

_Add your URL analysis screenshot here._

### Analysis History

_Add your history screenshot here._

## 🚀 Future Enhancements

- Real-time phishing detection.
- Browser extension integration.
- Advanced email analysis.
- Threat intelligence API integration.
- Multilingual phishing detection.
- Advanced analytics dashboard.
- Automated phishing alerts.

## 🎓 Project Information

| Details | Description |
|---|---|
| Project Name | PhishGuard |
| Project Domain | Data Science & Cybersecurity |
| Project Type | Web-Based Phishing Detection System |
| Frontend | React + TypeScript |
| Backend Services | Supabase |
| Database | PostgreSQL |
| ML Framework | Scikit-learn |
| Institution | Rajeev Gandhi Memorial College of Engineering and Technology |
| Department | Data Science |

## 👩‍💻 Developed By

**Project Team:** Add your team members' names.

**Institution:** Rajeev Gandhi Memorial College of Engineering and Technology

**Department:** Data Science

## 📄 License

This project is developed for academic and educational purposes.

---

<p align="center">

🛡️ **PhishGuard – Stay Alert. Stay Secure.**

⭐ If you find this project interesting, consider giving the repository a star!

</p>
