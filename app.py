import csv
import re
from pathlib import Path

from flask import Flask, jsonify, redirect, request, send_from_directory


ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "fishTreesFrontEnd"
TRAINING_FILE = ROOT / "datasets" / "training_profiles.csv"
GRADE_POINTS = {"A": 5, "B": 4, "C": 3, "D": 2, "E": 1, "F": 0, "U": 0}
GRADE_SUBJECTS = [
    "Mathematics", "English", "Physics", "Chemistry", "Biology",
    "Geography", "History", "Economics", "Computer Studies",
]

PATHWAYS = [
    {
        "code": "PCM", "subjects": ["Physics", "Chemistry", "Mathematics"],
        "interests": ["Technology and Computing", "Engineering and Innovation"],
        "career": "Engineering, computing, architecture, physical sciences and technical research.",
        "why": "It builds on mathematical reasoning and physical science, which are central to this combination."
    },
    {
        "code": "PCB", "subjects": ["Physics", "Chemistry", "Biology"],
        "interests": ["Medicine and Healthcare", "Education and Research"],
        "career": "Medicine, pharmacy, laboratory science, public health and biological research.",
        "why": "It combines the core physical and biological sciences used in many health and life-science pathways."
    },
    {
        "code": "BCM", "subjects": ["Biology", "Chemistry", "Mathematics"],
        "interests": ["Medicine and Healthcare", "Agriculture and Environmental Sciences", "Education and Research"],
        "career": "Agricultural science, biotechnology, environmental science and selected health-related fields.",
        "why": "It connects life sciences and chemistry with quantitative study."
    },
    {
        "code": "MEG", "subjects": ["Mathematics", "Economics", "Geography"],
        "interests": ["Business and Entrepreneurship", "Agriculture and Environmental Sciences"],
        "career": "Economics, finance, planning, logistics, business analytics and land-use studies.",
        "why": "It pairs quantitative reasoning and economic systems with spatial and environmental study."
    },
    {
        "code": "HEG", "subjects": ["History", "Economics", "Geography"],
        "interests": ["Law and Governance", "Education and Research", "Arts and Humanities"],
        "career": "Law, public policy, governance, teaching, development work and social research.",
        "why": "It explores institutions, economies and societies from historical and geographic perspectives."
    },
    {
        "code": "HEL", "subjects": ["History", "Economics", "English"],
        "interests": ["Law and Governance", "Arts and Humanities", "Media and Communication"],
        "career": "Law, journalism, communications, public service, writing and humanities research.",
        "why": "It emphasizes analysis, communication and understanding of social and economic systems."
    },
    {
        "code": "PEM", "subjects": ["Physics", "Economics", "Mathematics"],
        "interests": ["Engineering and Innovation", "Business and Entrepreneurship", "Technology and Computing"],
        "career": "Industrial economics, technology management, quantitative business and selected engineering fields.",
        "why": "It brings together quantitative methods, physical science and economic decision-making."
    },
]

app = Flask(__name__, static_folder=None)


def load_training_profiles():
    with TRAINING_FILE.open(encoding="utf-8-sig", newline="") as training_file:
        return list(csv.DictReader(training_file))


TRAINING_PROFILES = load_training_profiles()


def grade_value(value):
    grade = str(value or "").strip().upper()
    return GRADE_POINTS.get(grade)


def normalize_interests(value):
    if isinstance(value, str):
        values = re.split(r"[,;|]", value)
    elif isinstance(value, list):
        values = value
    else:
        values = []
    return {str(item).strip().casefold() for item in values if str(item).strip()}


def collect_grades(profile):
    final_grades = profile.get("oLevelResults") or profile.get("finalGrades") or profile.get("grades") or {}
    mock_grades = profile.get("mockResults") or profile.get("mockGrades") or {}
    combined = {}
    for subject in GRADE_SUBJECTS:
        final = grade_value(final_grades.get(subject))
        mock = grade_value(mock_grades.get(subject))
        available = [value for value in (final, mock) if value is not None]
        if available:
            combined[subject] = sum(available) / len(available)
    return combined


def profile_distance(profile_interests, profile_grades, training_row):
    training_interests = normalize_interests(training_row.get("interests"))
    union = profile_interests | training_interests
    interest_distance = 1 - len(profile_interests & training_interests) / len(union) if union else 0.5

    grade_distances = []
    for subject in GRADE_SUBJECTS:
        student_grade = profile_grades.get(subject)
        sample_grade = grade_value(training_row.get(subject))
        if student_grade is not None and sample_grade is not None:
            grade_distances.append(abs(student_grade - sample_grade) / 5)
    grade_distance = sum(grade_distances) / len(grade_distances) if grade_distances else 0.5
    return 0.55 * interest_distance + 0.45 * grade_distance


def model_votes(profile_interests, profile_grades):
    neighbors = sorted(
        ((profile_distance(profile_interests, profile_grades, row), row["combination"]) for row in TRAINING_PROFILES),
        key=lambda item: item[0],
    )[:5]
    totals = {}
    total_weight = 0
    for distance, label in neighbors:
        weight = 1 / (0.15 + distance)
        totals[label] = totals.get(label, 0) + weight
        total_weight += weight
    return {label: weight / total_weight for label, weight in totals.items()} if total_weight else {}


def score_pathways(profile):
    student_interests = normalize_interests(profile.get("interests"))
    grades = collect_grades(profile)
    votes = model_votes(student_interests, grades)
    ranked = []

    for pathway in PATHWAYS:
        pathway_interests = {item.casefold() for item in pathway["interests"]}
        if student_interests:
            interest_fit = len(student_interests & pathway_interests) / len(student_interests | pathway_interests)
        else:
            interest_fit = 0.5

        relevant_grades = [grades[subject] for subject in pathway["subjects"] if subject in grades]
        academic_fit = sum(relevant_grades) / (5 * len(relevant_grades)) if relevant_grades else 0.55
        model_fit = votes.get(pathway["code"], 0)
        score = round(100 * (0.35 * model_fit + 0.30 * interest_fit + 0.35 * academic_fit))
        weak_subjects = [subject for subject in pathway["subjects"] if grades.get(subject, 5) <= 2]
        ranked.append({
            **pathway,
            "score": score,
            "interestFit": round(interest_fit * 100),
            "academicFit": round(academic_fit * 100),
            "weakSubjects": weak_subjects,
        })

    ranked.sort(key=lambda item: (-item["score"], item["code"]))
    recommendations = []
    for rank, pathway in enumerate(ranked[:5], start=1):
        reasons = [pathway["why"]]
        if pathway["weakSubjects"]:
            reasons.append("Review the current grade in " + ", ".join(pathway["weakSubjects"]) + " before choosing this pathway.")
        if pathway["interestFit"] >= 35 and student_interests:
            reasons.append("Your selected interests overlap with this pathway.")
        recommendations.append({**pathway, "rank": rank, "reason": " ".join(reasons)})

    cautions = []
    for pathway in ranked[5:]:
        if pathway["weakSubjects"] or pathway["interestFit"] < 20:
            reasons = []
            if pathway["weakSubjects"]:
                reasons.append("current grades are low in " + ", ".join(pathway["weakSubjects"]))
            if pathway["interestFit"] < 20 and student_interests:
                reasons.append("the selected interests do not strongly align")
            cautions.append({
                "code": pathway["code"],
                "subjects": pathway["subjects"],
                "reason": "Consider this a lower-priority option because " + " and ".join(reasons) + ".",
            })
    return recommendations, cautions[:3]


def make_reports(profile, schools):
    recommendations, cautions = score_pathways(profile)
    selected_schools = [str(school).strip() for school in schools if str(school).strip()][:3]
    if not selected_schools:
        selected_schools = [str(profile.get("school") or "Your school").strip()]
    return [{
        "school": school,
        "availabilityNote": "Confirm current subject offerings and entry requirements directly with the school.",
        "recommendations": recommendations,
        "cautions": cautions,
    } for school in selected_schools]


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "trainingProfiles": len(TRAINING_PROFILES)})


@app.post("/api/recommendations")
def recommendations():
    profile = request.get_json(silent=True) or {}
    return jsonify({"reports": make_reports(profile, profile.get("schools") or [profile.get("school", "")])})


@app.post("/api/recommendations/bulk")
def bulk_recommendations():
    payload = request.get_json(silent=True) or {}
    students = payload.get("students")
    if not isinstance(students, list) or not students:
        return jsonify({"error": "The file did not contain any student rows."}), 400
    if len(students) > 500:
        return jsonify({"error": "A batch can contain at most 500 students."}), 400

    school = str(payload.get("school") or "School report").strip()
    results = []
    for index, student in enumerate(students, start=1):
        if not isinstance(student, dict):
            continue
        reports = make_reports(student, [school])
        results.append({
            "name": str(student.get("name") or student.get("student_name") or f"Student {index}").strip(),
            "reports": reports,
        })
    return jsonify({"school": school, "students": results})


@app.get("/")
def home():
    return redirect("/index.html")


@app.get("/<path:asset_path>")
def frontend_files(asset_path):
    return send_from_directory(FRONTEND, asset_path)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)