"""
AI-Based Resume Screening & Job Fit Analyzer
Department of Data Science | GRIET Hyderabad | 2025-26
Flask Backend - app.py
"""

from flask import Flask, render_template, request, jsonify, session
import json
import datetime
import os
import random
from predictor import predict_job_fit

app = Flask(__name__)
app.secret_key = "griet_ds_2025_resume_analyzer_secret"

# In-memory storage for dashboard analytics
analytics_store = {
    "total_users": 0,
    "approved": 0,
    "needs_improvement": 0,
    "roles": {},
    "cgpa_list": [],
    "domains": {},
    "submissions": []
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/result")
def result():
    return render_template("result.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """Main prediction endpoint — receives form data and returns predictions."""
    try:
        data = request.get_json()

        # ── Extract inputs ─────────────────────────────────────────────────
        skills          = data.get("skills", [])
        education       = data.get("education", "UG")
        cgpa            = float(data.get("cgpa", 7.0))
        projects        = int(data.get("projects", 0))
        certifications  = int(data.get("certifications", 0))
        internships     = data.get("internships", "No Internship")
        communication   = int(data.get("communication", 5))
        aptitude        = int(data.get("aptitude", 5))
        english_fluency = data.get("english_fluency", "Average")
        preferred_domain = data.get("preferred_domain", "Software Developer")
        resume_file     = data.get("resume_file", None)

        # ── Run prediction via predictor.py ────────────────────────────────
        result = predict_job_fit(
            skills=skills,
            education=education,
            cgpa=cgpa,
            projects=projects,
            certifications=certifications,
            internships=internships,
            communication=communication,
            aptitude=aptitude,
            english_fluency=english_fluency,
            preferred_domain=preferred_domain
        )

        # ── Update analytics ───────────────────────────────────────────────
        analytics_store["total_users"] += 1
        analytics_store["cgpa_list"].append(cgpa)

        if result["job_fit"] == "Approved":
            analytics_store["approved"] += 1
        else:
            analytics_store["needs_improvement"] += 1

        role = result["recommended_role"]
        analytics_store["roles"][role] = analytics_store["roles"].get(role, 0) + 1
        analytics_store["domains"][preferred_domain] = analytics_store["domains"].get(preferred_domain, 0) + 1

        analytics_store["submissions"].append({
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "cgpa": cgpa,
            "skills_count": len(skills),
            "job_fit": result["job_fit"],
            "role": role
        })

        return jsonify({"success": True, "result": result})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/dashboard", methods=["GET"])
def dashboard_data():
    """Returns analytics data for the admin dashboard."""
    cgpa_avg = (
        round(sum(analytics_store["cgpa_list"]) / len(analytics_store["cgpa_list"]), 2)
        if analytics_store["cgpa_list"] else 0
    )

    top_roles = sorted(analytics_store["roles"].items(), key=lambda x: x[1], reverse=True)[:5]
    top_domains = sorted(analytics_store["domains"].items(), key=lambda x: x[1], reverse=True)[:6]

    return jsonify({
        "total_users": analytics_store["total_users"],
        "approved": analytics_store["approved"],
        "needs_improvement": analytics_store["needs_improvement"],
        "avg_cgpa": cgpa_avg,
        "top_roles": top_roles,
        "top_domains": top_domains,
        "recent_submissions": analytics_store["submissions"][-10:][::-1],
        "approval_rate": (
            round(analytics_store["approved"] / analytics_store["total_users"] * 100, 1)
            if analytics_store["total_users"] > 0 else 0
        )
    })


@app.route("/api/seed-demo", methods=["POST"])
def seed_demo():
    """Seeds demo data so the dashboard is not empty on first run."""
    demo_roles  = ["Software Developer", "Data Analyst", "AI/ML Engineer",
                   "Web Developer", "Cloud Engineer", "Testing Engineer"]
    demo_fit    = ["Approved", "Needs Improvement"]
    demo_cgpa   = [7.2, 8.1, 6.9, 9.0, 7.8, 8.5, 7.4, 6.5, 8.9, 7.1]

    for i in range(10):
        cgpa = demo_cgpa[i]
        role = random.choice(demo_roles)
        fit  = random.choice(demo_fit)

        analytics_store["total_users"] += 1
        analytics_store["cgpa_list"].append(cgpa)
        analytics_store["roles"][role] = analytics_store["roles"].get(role, 0) + 1

        if fit == "Approved":
            analytics_store["approved"] += 1
        else:
            analytics_store["needs_improvement"] += 1

    return jsonify({"success": True, "message": "Demo data seeded"})


if __name__ == "__main__":
    print("=" * 60)
    print("  AI-Based Resume Screening & Job Fit Analyzer")
    print("  Department of Data Science | GRIET Hyderabad | 2025-26")
    print("=" * 60)
    print("  Server running at: http://127.0.0.1:5000")
    print("=" * 60)
    app.run(debug=True, host="0.0.0.0", port=5000)
