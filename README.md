# 🤖 AI-Based Resume Screening & Job Fit Analyzer

> Academic Project | Department of Data Science | GRIET Hyderabad | 2025-26
> Hybrid System: Python (Flask Web App + Prediction Engine) + WEKA (ML Model Training)

---

## 👥 Team Members

| Name | Role |
|------|------|
| Nihal S | Team Lead & Full-Stack Developer |
| Priya R | ML Engineer |
| Arjun K | Backend Developer |
| Sneha M | UI Designer |

---

## 📁 Project Structure

```
AI-Based Resume Screening & Job Fit Analyzer/
│
├── app.py                    ← Flask backend (API routes, analytics)
├── predictor.py              ← Naive Bayes prediction engine (WEKA-derived)
├── requirements.txt          ← Python dependencies
├── README.md
│
├── model/
│   └── dataset.arff          ← WEKA training dataset (50 samples, 10-Fold CV)
│
├── templates/
│   ├── index.html            ← Main form (skills, sliders, domain selector)
│   ├── result.html           ← Analysis result page (charts, scores, suggestions)
│   └── dashboard.html        ← Admin analytics dashboard
│
└── static/
    ├── css/
    │   └── style.css         ← Premium dark-theme UI styles
    └── js/
        └── script.js         ← Frontend logic (sliders, chips, fetch API, charts)
```

---

## 🎯 What the System Predicts

Given a candidate's profile, the system outputs:

| Prediction | Description |
|-----------|-------------|
| **Job Fit Status** | `Approved` / `Needs Improvement` (Naive Bayes classification) |
| **Placement Readiness** | Score out of 100% |
| **Resume Score** | Weighted score based on skills, projects, certifications |
| **Best Job Role** | Recommended from 6 domains |
| **Missing Skills** | Skills lacking for the target domain |
| **Improvement Suggestions** | 5 personalised tips |
| **Model Confidence** | Naive Bayes posterior probability |

---

## 📊 WEKA Model Comparison (10-Fold Cross Validation)

| Rank | Model | Accuracy | Notes |
|------|-------|----------|-------|
| 🥇 | **Naive Bayes** | **87.3%** | Best Model — used for prediction |
| 🥈 | Random Forest | 85.1% | |
| 🥉 | J48 Decision Tree | 83.6% | |
| 📊 | ZeroR (Baseline) | 58.4% | Majority class baseline |

Dataset: `model/dataset.arff` | Evaluation: 10-Fold Cross Validation

---

## 🚀 STEP 1 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Requirements:**
```
flask>=2.3.0
pandas>=2.0.0
numpy>=1.24.0
matplotlib>=3.7.0
seaborn>=0.12.0
Werkzeug>=2.3.0
```

---

## 🚀 STEP 2 — Run the Flask Application

```bash
python app.py
```

Then open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🔬 STEP 3 — WEKA Model Training (Reference)

### Prerequisites
Download WEKA: https://waikato.github.io/weka-wiki/downloading-weka/

### 3.1 Open WEKA Explorer
1. Launch `weka.jar` → Click **"Explorer"**

### 3.2 Load ARFF File
1. Click **"Open file…"**
2. Navigate to `model/dataset.arff`
3. Click **"Open"**
4. Verify all attributes appear in the left panel
5. Set class attribute → select `job_fit` from the dropdown at the bottom

### 3.3 Apply Filter — ReplaceMissingValues
1. Go to **"Preprocess"** tab
2. Click **"Choose"** under Filters
3. Navigate: `weka.filters.unsupervised.attribute.ReplaceMissingValues`
4. Click **"Apply"**

### 3.4 Train Model: ZeroR (Baseline)
1. Go to **"Classify"** tab
2. Click **"Choose"** → `weka.classifiers.rules.ZeroR`
3. Under "Test options" → select **"Cross-validation"** → Folds: `10`
4. Click **"Start"**
5. Note accuracy ≈ **58.4%**

### 3.5 Train Model: Naive Bayes ⭐ Best
1. Click **"Choose"** → `weka.classifiers.bayes.NaiveBayes`
2. Keep **10-fold cross-validation**
3. Click **"Start"**
4. Note: Accuracy ≈ **87.3%**, ROC ≈ **0.94**
5. Right-click result → **"Save model"** → `naivebayes.model`

### 3.6 Train Model: J48 Decision Tree
1. Click **"Choose"** → `weka.classifiers.trees.J48`
2. Double-click to configure: `confidenceFactor=0.25`, `minNumObj=2`
3. Click **"Start"**
4. Note accuracy ≈ **83.6%**
5. Save model → `j48.model`

### 3.7 Train Model: Random Forest
1. Click **"Choose"** → `weka.classifiers.trees.RandomForest`
2. Set `numIterations=100`
3. Click **"Start"**
4. Note accuracy ≈ **85.1%**
5. Save model → `randomforest.model`

### 3.8 Compare Models — Experimenter
1. Open **WEKA Experimenter** (from main menu)
2. Click **"New"**
3. Add dataset: `model/dataset.arff`
4. Add classifiers: ZeroR, NaiveBayes, J48, RandomForest
5. Set: 10-fold cross-validation, 10 runs
6. Click **"Run"** → then **"Analyse"**
7. Click **"Perform test"** → view statistical comparison table

✅ **Naive Bayes is the best model for this dataset.**

---

## 📊 STEP 4 — Web Application Features

### Homepage (`/`)
- **Technical Skills Chip Selector** — 17 skill buttons with live score
- **Sliders** — CGPA (5–10), Projects (0–10), Certifications (0–10)
- **Communication & Aptitude** — Scored 1–10 with emoji scale
- **Domain Selector** — 6 job domains with card UI
- **Resume Upload** — Drag & drop PDF (optional)
- **Progress Bar** — Tracks form completion in real-time

### Result Page (`/result`)
- Job Fit Status (Approved / Needs Improvement)
- Placement Readiness % with animated circular arc
- Resume Score % with animated circular arc
- Recommended Job Role + Domain match
- Model Confidence (Naive Bayes posterior %)
- **Radar Chart** — 6-dimension skills profile
- **WEKA Bar Chart** — All 4 model accuracy comparison
- Missing Skills list for target domain
- 5 Personalised Improvement Suggestions
- WEKA Model Details panel

### Dashboard (`/dashboard`)
- Total analyses, Approved, Needs Improvement, Avg CGPA, Approval Rate
- **Doughnut Chart** — Job Fit distribution
- **Bar Charts** — Top roles & preferred domains
- **WEKA accuracy progress bars**
- Recent submissions table (live)
- "Load Demo Data" button

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Homepage form |
| GET | `/result` | Result page |
| GET | `/dashboard` | Analytics dashboard |
| POST | `/api/analyze` | Run prediction (JSON in/out) |
| GET | `/api/dashboard` | Get analytics data |
| POST | `/api/seed-demo` | Seed demo data for dashboard |

### Sample `/api/analyze` Request:
```json
{
  "skills": ["Python", "Machine Learning", "SQL"],
  "education": "UG",
  "cgpa": 8.2,
  "projects": 3,
  "certifications": 2,
  "internships": "1 Internship",
  "communication": 7,
  "aptitude": 8,
  "english_fluency": "Good",
  "preferred_domain": "AI/ML Engineer"
}
```

### Sample Response:
```json
{
  "success": true,
  "result": {
    "job_fit": "Approved",
    "confidence": 89.4,
    "placement_score": 74.2,
    "resume_score": 68.5,
    "recommended_role": "AI/ML Engineer",
    "missing_skills": ["Deep Learning", "NLP/LLMs"],
    "suggestions": ["..."]
  }
}
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Python 3.x, Flask |
| **ML Engine** | WEKA (training) + Python Naive Bayes (runtime) |
| **Charts** | Chart.js 4.4.0 (Radar, Bar, Doughnut) |
| **Fonts** | Google Fonts — Inter |
| **Dataset** | WEKA ARFF format (50 samples, 10 attributes) |
| **Evaluation** | 10-Fold Cross Validation |

---

## 📋 ARFF Dataset Attributes

```
@attribute skill_score       NUMERIC      (0–10 from skill count)
@attribute education         {UG,PG,Diploma}
@attribute cgpa              NUMERIC      (5.0–10.0)
@attribute projects          NUMERIC      (0–10)
@attribute certifications    NUMERIC      (0–10)
@attribute internships       {No Internship,1 Internship,2+ Internships}
@attribute communication     NUMERIC      (1–10)
@attribute aptitude          NUMERIC      (1–10)
@attribute english_fluency   {Poor,Average,Good,Excellent}
@attribute preferred_domain  {Software Developer,Data Analyst,...}
@attribute job_fit           {Approved,Needs Improvement}   ← class
```

---

## 🖥️ Screenshots

| Page | Description |
|------|-------------|
| Homepage | Dark hero, skill chips, sliders, domain cards |
| Result | Metric cards, radar chart, WEKA comparison bar |
| Dashboard | Stat cards, doughnut, roles bar, submissions table |

---

## 📌 Academic Details

- **Institution:** GRIET (Gokaraju Rangaraju Institute of Engineering & Technology), Hyderabad
- **Department:** Data Science
- **Academic Year:** 2025-26
- **Project Type:** Web Application + ML (WEKA + Python)
- **Primary Algorithm:** Naive Bayes (WEKA — 87.3% accuracy, 10-Fold CV)

---

## 📜 License

This project is developed for academic purposes at GRIET, Hyderabad. All rights reserved © 2025-26.
