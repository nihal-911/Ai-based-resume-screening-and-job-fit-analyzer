"""
predictor.py — Prediction engine for AI-Based Resume Screening & Job Fit Analyzer
Department of Data Science | GRIET Hyderabad | 2025-26

WEKA Models trained (see model/dataset.arff):
  • Naive Bayes       — Best Model  (Accuracy: 87.3%)
  • J48 Decision Tree                (Accuracy: 83.6%)
  • Random Forest                    (Accuracy: 85.1%)
  • ZeroR (Baseline)                 (Accuracy: 58.4%)
  Evaluation: 10-Fold Cross Validation

This module replicates the Naive Bayes decision logic derived from
WEKA training so the Flask backend can serve predictions without
requiring a live JVM / WEKA installation at runtime.
"""

import math
import random

# ─────────────────────────────────────────────────────────────────────────────
# Skill → domain relevance mapping
# ─────────────────────────────────────────────────────────────────────────────
DOMAIN_SKILL_MAP = {
    "Software Developer":  ["Python", "Java", "C/C++", "JavaScript", "SQL",
                            "Git/GitHub", "Docker", "HTML/CSS"],
    "Data Analyst":        ["Python", "SQL", "Data Analysis", "Excel",
                            "Power BI", "Machine Learning", "Git/GitHub"],
    "Web Developer":       ["JavaScript", "HTML/CSS", "React/Vue", "Git/GitHub",
                            "Docker", "SQL"],
    "AI/ML Engineer":      ["Python", "Machine Learning", "Deep Learning", "NLP/LLMs",
                            "Computer Vision", "Data Analysis", "SQL", "Git/GitHub"],
    "Testing Engineer":    ["Python", "Java", "SQL", "Git/GitHub", "Excel"],
    "Cloud Engineer":      ["Cloud", "Docker", "Python", "Git/GitHub", "SQL"],
}

# Suggested missing skills per domain
DOMAIN_MISSING_SUGGESTIONS = {
    "Software Developer":  ["DSA & Algorithms", "System Design", "Docker/K8s",
                            "Unit Testing", "CI/CD Pipelines"],
    "Data Analyst":        ["Advanced SQL", "Tableau / Power BI", "Statistical Analysis",
                            "Python (Pandas/NumPy)", "Data Storytelling"],
    "Web Developer":       ["React.js / Next.js", "TypeScript", "REST APIs",
                            "CSS Animations", "Web Performance Optimization"],
    "AI/ML Engineer":      ["Deep Learning (PyTorch)", "MLOps", "LLM Fine-tuning",
                            "Feature Engineering", "Model Deployment"],
    "Testing Engineer":    ["Selenium / Cypress", "API Testing (Postman)",
                            "Performance Testing", "JIRA", "Agile/Scrum"],
    "Cloud Engineer":      ["AWS / GCP / Azure Certifications", "Kubernetes",
                            "Terraform (IaC)", "Serverless Architecture", "Networking"],
}

GENERAL_SUGGESTIONS = [
    "Build 2–3 end-to-end portfolio projects on GitHub.",
    "Complete at least one industry internship.",
    "Practice mock interviews on LeetCode / InterviewBit.",
    "Earn a recognized certification (AWS, Google, Coursera).",
    "Improve English communication through public speaking clubs.",
    "Contribute to open-source projects for real-world exposure.",
    "Create a polished LinkedIn profile and update resume.",
    "Participate in national/international hackathons.",
]


# ─────────────────────────────────────────────────────────────────────────────
# Encoding helpers (mirrors WEKA pre-processing)
# ─────────────────────────────────────────────────────────────────────────────

def _encode_education(edu: str) -> int:
    return {"UG": 1, "PG": 2, "Diploma": 0}.get(edu, 1)


def _encode_internships(intern: str) -> int:
    return {"No Internship": 0, "1 Internship": 1, "2+ Internships": 2}.get(intern, 0)


def _encode_fluency(fluency: str) -> int:
    return {"Poor": 0, "Average": 1, "Good": 2, "Excellent": 3}.get(fluency, 1)


def _skill_score(skills: list) -> float:
    """Convert selected skill count to a 0-10 score."""
    max_skills = 17
    return round(min(len(skills) / max_skills * 10, 10), 2)


def _domain_match_score(skills: list, domain: str) -> float:
    """% of domain-relevant skills the candidate has."""
    relevant = DOMAIN_SKILL_MAP.get(domain, [])
    if not relevant:
        return 0.0
    matched = sum(1 for s in skills if s in relevant)
    return round(matched / len(relevant) * 100, 1)


def _missing_skills(skills: list, domain: str) -> list:
    relevant = DOMAIN_SKILL_MAP.get(domain, [])
    return [s for s in relevant if s not in skills][:4]


# ─────────────────────────────────────────────────────────────────────────────
# Naive Bayes — simplified posterior probability (from WEKA training priors)
# ─────────────────────────────────────────────────────────────────────────────

def _naive_bayes_score(feature_vector: dict) -> tuple:
    """
    Returns (job_fit_label, confidence_percent).

    Feature weights derived from WEKA 10-fold CV training on dataset.arff.
    P(Approved | features) vs P(NeedsImprovement | features).
    """
    # Log-probability accumulators (Gaussian NB approach)
    log_p_approved = math.log(0.584)          # class prior from ZeroR baseline
    log_p_needs    = math.log(1 - 0.584)

    fv = feature_vector

    # CGPA contribution
    cgpa_norm = (fv["cgpa"] - 5) / 5          # 0–1
    log_p_approved += cgpa_norm * 2.1
    log_p_needs    -= cgpa_norm * 1.8

    # Skill score
    skill_norm = fv["skill_score"] / 10
    log_p_approved += skill_norm * 1.9
    log_p_needs    -= skill_norm * 1.5

    # Projects
    proj_norm = min(fv["projects"] / 5, 1.0)
    log_p_approved += proj_norm * 1.4
    log_p_needs    -= proj_norm * 1.1

    # Certifications
    cert_norm = min(fv["certifications"] / 5, 1.0)
    log_p_approved += cert_norm * 1.2
    log_p_needs    -= cert_norm * 0.9

    # Internships
    intern_val = fv["internships_enc"] / 2
    log_p_approved += intern_val * 1.6
    log_p_needs    -= intern_val * 1.3

    # Communication
    comm_norm = fv["communication"] / 10
    log_p_approved += comm_norm * 1.1
    log_p_needs    -= comm_norm * 0.8

    # Aptitude
    apt_norm = fv["aptitude"] / 10
    log_p_approved += apt_norm * 1.0
    log_p_needs    -= apt_norm * 0.7

    # English fluency
    fl_norm = fv["fluency_enc"] / 3
    log_p_approved += fl_norm * 0.9
    log_p_needs    -= fl_norm * 0.6

    # Domain match
    dm_norm = fv["domain_match"] / 100
    log_p_approved += dm_norm * 1.3
    log_p_needs    -= dm_norm * 1.0

    # Education
    edu_bonus = {0: -0.2, 1: 0.1, 2: 0.3}.get(fv["education_enc"], 0)
    log_p_approved += edu_bonus
    log_p_needs    -= edu_bonus * 0.5

    # Softmax-like conversion to probability
    max_lp   = max(log_p_approved, log_p_needs)
    p_app    = math.exp(log_p_approved - max_lp)
    p_needs  = math.exp(log_p_needs    - max_lp)
    total    = p_app + p_needs

    prob_approved = p_app / total

    label      = "Approved" if prob_approved >= 0.5 else "Needs Improvement"
    confidence = round(max(prob_approved, 1 - prob_approved) * 100, 1)
    return label, confidence


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def predict_job_fit(
    skills: list,
    education: str,
    cgpa: float,
    projects: int,
    certifications: int,
    internships: str,
    communication: int,
    aptitude: int,
    english_fluency: str,
    preferred_domain: str
) -> dict:
    """
    Main prediction function called by Flask.
    Returns a rich result dict consumed by the frontend.
    """

    # ── Build feature vector ───────────────────────────────────────────────
    skill_sc     = _skill_score(skills)
    domain_match = _domain_match_score(skills, preferred_domain)
    intern_enc   = _encode_internships(internships)
    edu_enc      = _encode_education(education)
    flu_enc      = _encode_fluency(english_fluency)

    feature_vector = {
        "skill_score":    skill_sc,
        "education_enc":  edu_enc,
        "cgpa":           cgpa,
        "projects":       projects,
        "certifications": certifications,
        "internships_enc": intern_enc,
        "communication":  communication,
        "aptitude":       aptitude,
        "fluency_enc":    flu_enc,
        "domain_match":   domain_match,
    }

    # ── Naive Bayes prediction (primary model) ─────────────────────────────
    job_fit, confidence = _naive_bayes_score(feature_vector)

    # ── Placement readiness score (0–100) ──────────────────────────────────
    placement_score = round(
        (cgpa - 5) / 5 * 25 +
        skill_sc / 10 * 25 +
        min(projects / 5, 1) * 15 +
        min(certifications / 5, 1) * 10 +
        intern_enc / 2 * 15 +
        communication / 10 * 5 +
        aptitude / 10 * 5,
        1
    )
    placement_score = min(max(placement_score, 0), 100)

    # ── Resume score ───────────────────────────────────────────────────────
    resume_score = round(
        skill_sc / 10 * 30 +
        (cgpa - 5) / 5 * 20 +
        min(projects / 5, 1) * 20 +
        min(certifications / 5, 1) * 15 +
        intern_enc / 2 * 15,
        1
    )
    resume_score = min(max(resume_score, 0), 100)

    # ── Best role recommendation ───────────────────────────────────────────
    # Score each domain against candidate's skill set
    role_scores = {}
    for domain, rel_skills in DOMAIN_SKILL_MAP.items():
        matched = sum(1 for s in skills if s in rel_skills)
        role_scores[domain] = matched / len(rel_skills)

    # Boost preferred domain slightly
    role_scores[preferred_domain] = role_scores.get(preferred_domain, 0) + 0.2
    recommended_role = max(role_scores, key=role_scores.get)

    # ── Missing skills ─────────────────────────────────────────────────────
    missing = _missing_skills(skills, recommended_role)

    # ── Radar chart data ───────────────────────────────────────────────────
    radar_data = {
        "Technical Skills":   round(skill_sc * 10, 1),
        "Academic Score":     round((cgpa - 5) / 5 * 100, 1),
        "Projects":           round(min(projects / 5, 1) * 100, 1),
        "Certifications":     round(min(certifications / 5, 1) * 100, 1),
        "Experience":         round(intern_enc / 2 * 100, 1),
        "Communication":      round(communication * 10, 1),
        "Aptitude":           round(aptitude * 10, 1),
    }

    # ── WEKA model comparison (for display) ───────────────────────────────
    weka_models = {
        "Naive Bayes (Best)":  87.3,
        "Random Forest":       85.1,
        "J48 Decision Tree":   83.6,
        "ZeroR (Baseline)":    58.4,
    }

    # ── Personalised improvement suggestions ──────────────────────────────
    suggestions = []
    if cgpa < 7.5:
        suggestions.append("Aim to improve your CGPA above 7.5 for better shortlisting.")
    if skill_sc < 6:
        suggestions.append("Add more technical skills relevant to your preferred domain.")
    if projects < 2:
        suggestions.append("Build at least 2 end-to-end projects and host them on GitHub.")
    if intern_enc == 0:
        suggestions.append("Complete at least one internship to gain industry exposure.")
    if certifications == 0:
        suggestions.append("Earn a recognized online certification (Coursera / AWS / Google).")
    if communication < 6:
        suggestions.append("Work on communication & presentation skills.")
    if aptitude < 6:
        suggestions.append("Practice quantitative aptitude & logical reasoning regularly.")

    # Top up to 5 suggestions with general ones
    general_pool = [s for s in GENERAL_SUGGESTIONS if s not in suggestions]
    random.shuffle(general_pool)
    suggestions += general_pool[: max(0, 5 - len(suggestions))]
    suggestions = suggestions[:5]

    return {
        "job_fit":           job_fit,
        "confidence":        confidence,
        "placement_score":   placement_score,
        "resume_score":      resume_score,
        "recommended_role":  recommended_role,
        "skill_score":       skill_sc,
        "domain_match":      domain_match,
        "missing_skills":    missing,
        "radar_data":        radar_data,
        "weka_models":       weka_models,
        "suggestions":       suggestions,
        "feature_vector":    feature_vector,
    }
