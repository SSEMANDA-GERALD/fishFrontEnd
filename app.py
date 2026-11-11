import csv
import io
import json
import os
import re
import secrets
from functools import wraps
from pathlib import Path

from flask import Flask, Response, jsonify, redirect, request, send_from_directory
from flask_login import current_user, login_user, logout_user
from flask_wtf.csrf import generate_csrf
from sqlalchemy import URL, func, or_

from extensions import csrf, db, login_manager
from models import Account, PaymentOrder, Prediction, RecommendationFeedback, utc_now

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
app.config.update(
    SECRET_KEY=os.environ.get("FISHTREES_SECRET_KEY") or secrets.token_urlsafe(32),
    SQLALCHEMY_DATABASE_URI=os.environ.get(
        "FISHTREES_DATABASE_URL",
        URL.create(
            "mysql+pymysql",
            username=os.environ.get("FISHTREES_DB_USER", "fishtrees_app"),
            password=os.environ.get("FISHTREES_DB_PASSWORD", ""),
            host=os.environ.get("FISHTREES_DB_HOST", "127.0.0.1"),
            port=int(os.environ.get("FISHTREES_DB_PORT", "3306")),
            database=os.environ.get("FISHTREES_DB_NAME", "fishtrees"),
        ).render_as_string(hide_password=False),
    ),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.environ.get("FISHTREES_HTTPS", "0") == "1",
    MAX_CONTENT_LENGTH=10 * 1024 * 1024,
    WTF_CSRF_TIME_LIMIT=3600,
)
db.init_app(app)
login_manager.init_app(app)
csrf.init_app(app)


@login_manager.user_loader
def load_user(account_id):
    return db.session.get(Account, int(account_id))


@login_manager.unauthorized_handler
def unauthorized():
    if request.path.startswith("/api/"):
        return jsonify({"error": "Sign in to continue."}), 401
    return redirect("/signin.html")


def api_login_required(function):
    @wraps(function)
    def wrapped(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({"error": "Sign in to continue."}), 401
        if current_user.status != "approved":
            return jsonify({"error": "This account is awaiting approval or is not active."}), 403
        return function(*args, **kwargs)
    return wrapped


def roles_required(*roles):
    def decorator(function):
        @wraps(function)
        def wrapped(*args, **kwargs):
            if not current_user.is_authenticated:
                return jsonify({"error": "Sign in to continue."}), 401
            if current_user.status != "approved":
                return jsonify({"error": "This account is awaiting approval or is not active."}), 403
            if current_user.role not in roles:
                return jsonify({"error": "You do not have permission to perform this action."}), 403
            return function(*args, **kwargs)
        return wrapped
    return decorator


def account_payload(account):
    return {
        "id": account.id,
        "email": account.email,
        "username": account.username,
        "displayName": account.display_name,
        "organizationName": account.organization_name,
        "institutionType": account.institution_type,
        "role": account.role,
        "status": account.status,
    }


def order_payload(order, include_predictions=False):
    data = {
        "id": order.id,
        "reference": order.reference,
        "mode": order.mode,
        "status": order.status,
        "amount": order.amount,
        "currency": order.currency,
        "predictionCount": order.prediction_count,
        "paymentMethod": order.payment_method,
        "paymentReference": order.payment_reference,
        "createdAt": order.created_at.isoformat(),
        "paidAt": order.paid_at.isoformat() if order.paid_at else None,
    }
    if include_predictions and order.status == "paid":
        predictions = sorted(order.predictions, key=lambda item: item.created_at)
        if order.mode == "individual":
            data["reports"] = predictions[0].output_data["reports"] if predictions else []
            data["predictionId"] = predictions[0].id if predictions else None
            data["profile"] = predictions[0].input_data if predictions else {}
        else:
            data["students"] = [{
                "id": item.id,
                "name": item.student_name,
                "profile": item.input_data,
                "reports": item.output_data["reports"],
            } for item in predictions]
    return data


def _validated_grades(profile):
    final_grades = profile.get("oLevelResults") or profile.get("finalGrades") or profile.get("grades") or {}
    if not isinstance(final_grades, dict):
        return False
    return any(grade_value(value) is not None for value in final_grades.values())


def _create_order_for_user(account, payload):
    mode = payload.get("mode")
    if mode not in {"individual", "bulk"}:
        return None, (jsonify({"error": "Choose an individual or bulk recommendation."}), 400)
    if mode == "bulk" and account.role not in {"school", "institution", "admin", "superadmin"}:
        return None, (jsonify({"error": "Only approved institutions can request bulk recommendations."}), 403)

    if mode == "individual":
        profile = payload.get("profile")
        if not isinstance(profile, dict) or not _validated_grades(profile):
            return None, (jsonify({"error": "Add at least one final examination grade before continuing."}), 400)
        schools = profile.get("schools", [])
        if not isinstance(schools, list) or not 1 <= len(schools) <= 3:
            return None, (jsonify({"error": "Select between one and three schools."}), 400)
        request_data = {"profile": profile}
        count = 1
    else:
        students = payload.get("students")
        if not isinstance(students, list) or not students or len(students) > 500:
            return None, (jsonify({"error": "A bulk order must contain between 1 and 500 students."}), 400)
        if any(not isinstance(student, dict) or not student.get("name") or not _validated_grades(student) for student in students):
            return None, (jsonify({"error": "Every student needs a name and at least one final grade."}), 400)
        request_data = {
            "school": account.organization_name or str(payload.get("school") or "Institution report").strip(),
            "students": students,
        }
        count = len(students)

    method = payload.get("paymentMethod")
    allowed_methods = {"mobile-money", "bank-transfer", "card"}
    if method not in allowed_methods:
        return None, (jsonify({"error": "Choose a supported payment method."}), 400)
    order = PaymentOrder(
        reference="FT" + secrets.token_hex(5).upper(),
        account_id=account.id,
        mode=mode,
        amount=count * 500,
        prediction_count=count,
        payment_method=method,
        request_payload=request_data,
    )
    db.session.add(order)
    db.session.commit()
    return order, None


def _generate_paid_order_predictions(order):
    if order.status != "paid" or order.predictions:
        return
    if order.mode == "individual":
        profile = order.request_payload["profile"]
        reports = make_reports(profile, profile.get("schools", []))
        name = profile.get("studentName") or order.account.display_name
        db.session.add(Prediction(
            order_id=order.id,
            account_id=order.account_id,
            student_name=str(name)[:160],
            input_data=profile,
            output_data={"reports": reports},
        ))
        return

    for student in order.request_payload["students"]:
        profile = {key: value for key, value in student.items() if key != "name"}
        reports = make_reports(profile, [order.request_payload["school"]])
        db.session.add(Prediction(
            order_id=order.id,
            account_id=order.account_id,
            student_name=str(student["name"])[:160],
            input_data=profile,
            output_data={"reports": reports},
        ))


@app.get("/api/csrf-token")
def csrf_token():
    return jsonify({"csrfToken": generate_csrf()})


@app.post("/api/auth/signup")
def signup():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email") or "").strip().casefold()
    username = str(payload.get("username") or "").strip().casefold() or None
    password = str(payload.get("password") or "")
    display_name = str(payload.get("displayName") or "").strip()
    role = payload.get("role")
    organization = str(payload.get("organizationName") or "").strip() or None
    institution_type = payload.get("institutionType")
    if role not in {"student", "school", "institution"}:
        return jsonify({"error": "Choose student, school, or other institution."}), 400
    if not email or "@" not in email or not display_name:
        return jsonify({"error": "Enter a valid email address and your name."}), 400
    if len(password) < 12:
        return jsonify({"error": "Use a password with at least 12 characters."}), 400
    if role in {"school", "institution"} and (not organization or not institution_type):
        return jsonify({"error": "Institution name and type are required for approval."}), 400
    if username and not re.fullmatch(r"[a-z0-9._-]{3,80}", username):
        return jsonify({"error": "Username must be 3-80 characters using letters, numbers, dots, underscores, or hyphens."}), 400
    if Account.query.filter(or_(Account.email == email, Account.username == username) if username else Account.email == email).first():
        return jsonify({"error": "An account already uses that email or username."}), 409

    account = Account(
        email=email,
        username=username,
        display_name=display_name,
        organization_name=organization,
        institution_type=institution_type if role in {"school", "institution"} else None,
        role=role,
        status="pending" if role in {"school", "institution"} else "approved",
    )
    account.set_password(password)
    db.session.add(account)
    db.session.commit()
    return jsonify({
        "message": "Your institution application is waiting for admin approval." if account.status == "pending" else "Account created. You can now sign in.",
        "status": account.status,
    }), 201


@app.post("/api/auth/login")
def signin():
    payload = request.get_json(silent=True) or {}
    identifier = str(payload.get("identifier") or "").strip().casefold()
    password = str(payload.get("password") or "")
    account = Account.query.filter(or_(Account.email == identifier, Account.username == identifier)).first()
    if not account or not account.check_password(password) or not account.is_active:
        return jsonify({"error": "Email, username, or password is not correct."}), 401
    login_user(account, remember=bool(payload.get("remember")))
    destination = "admin.html" if account.role in {"admin", "superadmin"} else "dashboard.html"
    return jsonify({"account": account_payload(account), "redirect": destination})


@app.post("/api/auth/logout")
def signout():
    if not current_user.is_authenticated:
        return jsonify({"error": "Sign in to continue."}), 401
    logout_user()
    return jsonify({"message": "Signed out."})


@app.get("/api/auth/me")
def current_account():
    if not current_user.is_authenticated:
        return jsonify({"account": None})
    return jsonify({"account": account_payload(current_user)})


@app.get("/api/dashboard")
@api_login_required
def dashboard_data():
    orders = PaymentOrder.query.filter_by(account_id=current_user.id).order_by(PaymentOrder.created_at.desc()).limit(50).all()
    return jsonify({
        "account": account_payload(current_user),
        "predictionCount": Prediction.query.filter_by(account_id=current_user.id).count(),
        "amountPaid": db.session.query(func.coalesce(func.sum(PaymentOrder.amount), 0)).filter_by(account_id=current_user.id, status="paid").scalar(),
        "orders": [order_payload(order) for order in orders],
    })


@app.post("/api/payment-orders")
@api_login_required
def create_payment_order():
    payload = request.get_json(silent=True) or {}
    order, error = _create_order_for_user(current_user, payload)
    if error:
        return error
    return jsonify({"order": order_payload(order)}), 201


def owned_order_or_404(order_id):
    order = db.session.get(PaymentOrder, order_id)
    if order is None or (current_user.role not in {"admin", "superadmin"} and order.account_id != current_user.id):
        return None
    return order


@app.get("/api/payment-orders/<order_id>")
@api_login_required
def get_payment_order(order_id):
    order = owned_order_or_404(order_id)
    if order is None:
        return jsonify({"error": "Payment order not found."}), 404
    return jsonify({"order": order_payload(order, include_predictions=True)})


@app.post("/api/payment-orders/<order_id>/reference")
@api_login_required
def submit_payment_reference(order_id):
    order = owned_order_or_404(order_id)
    if order is None:
        return jsonify({"error": "Payment order not found."}), 404
    if order.status != "pending":
        return jsonify({"error": "This payment order is no longer pending."}), 409
    payload = request.get_json(silent=True) or {}
    reference = str(payload.get("paymentReference") or "").strip()
    if not reference or len(reference) > 120:
        return jsonify({"error": "Enter the transaction or transfer reference."}), 400
    order.payment_reference = reference
    payment_method = payload.get("paymentMethod")
    if payment_method in {"mobile-money", "bank-transfer", "card"}:
        order.payment_method = payment_method
    db.session.commit()
    return jsonify({"order": order_payload(order), "message": "Reference submitted for admin verification."})


@app.post("/api/recommendations")
def individual_recommendations_blocked():
    if not current_user.is_authenticated:
        return jsonify({"error": "Sign in and create a payment order before requesting recommendations."}), 401
    return jsonify({"error": "Recommendations are generated only after payment is verified."}), 402


@app.post("/api/recommendations/bulk")
def bulk_recommendations_blocked():
    if not current_user.is_authenticated:
        return jsonify({"error": "Sign in and create a payment order before requesting recommendations."}), 401
    return jsonify({"error": "Bulk recommendations are generated only after payment is verified."}), 402


@app.post("/api/predictions/<prediction_id>/feedback")
@api_login_required
def submit_feedback(prediction_id):
    prediction = db.session.get(Prediction, prediction_id)
    if prediction is None or prediction.account_id != current_user.id:
        return jsonify({"error": "Prediction not found."}), 404
    payload = request.get_json(silent=True) or {}
    try:
        rating = int(payload.get("rating"))
    except (TypeError, ValueError):
        rating = 0
    if not 1 <= rating <= 5:
        return jsonify({"error": "Choose a satisfaction rating from 1 to 5."}), 400
    feedback = RecommendationFeedback.query.filter_by(prediction_id=prediction.id, account_id=current_user.id).first()
    if feedback is None:
        feedback = RecommendationFeedback(prediction_id=prediction.id, account_id=current_user.id)
    feedback.rating = rating
    feedback.helpful = payload.get("helpful") is True
    feedback.comment = str(payload.get("comment") or "").strip()[:1200] or None
    feedback.consent_to_train = payload.get("consentToTrain") is True
    db.session.add(feedback)
    db.session.commit()
    return jsonify({"message": "Thank you. Your feedback has been recorded."})


@app.get("/api/admin/overview")
@roles_required("admin", "superadmin")
def admin_overview():
    pending_accounts = Account.query.filter_by(status="pending").order_by(Account.created_at.asc()).all()
    pending_orders = PaymentOrder.query.filter_by(status="pending").order_by(PaymentOrder.created_at.asc()).limit(100).all()
    return jsonify({
        "accounts": {
            "total": Account.query.count(),
            "pending": len(pending_accounts),
            "schools": Account.query.filter_by(role="school", status="approved").count(),
            "institutions": Account.query.filter_by(role="institution", status="approved").count(),
        },
        "predictions": Prediction.query.count(),
        "amountCollected": db.session.query(func.coalesce(func.sum(PaymentOrder.amount), 0)).filter_by(status="paid").scalar(),
        "paidOrders": PaymentOrder.query.filter_by(status="paid").count(),
        "pendingOrders": len(pending_orders),
        "feedbackCount": RecommendationFeedback.query.count(),
        "trainingFeedbackCount": RecommendationFeedback.query.filter_by(consent_to_train=True).count(),
        "pendingAccounts": [account_payload(account) for account in pending_accounts],
        "pendingOrdersList": [{**order_payload(order), "account": account_payload(order.account)} for order in pending_orders],
    })


@app.post("/api/admin/accounts/<int:account_id>/status")
@roles_required("admin", "superadmin")
def update_account_status(account_id):
    account = db.session.get(Account, account_id)
    if account is None or account.role in {"admin", "superadmin"}:
        return jsonify({"error": "Institution account not found."}), 404
    if account.id == current_user.id:
        return jsonify({"error": "You cannot change your own account status."}), 403
    status = (request.get_json(silent=True) or {}).get("status")
    if status not in {"approved", "rejected", "suspended"}:
        return jsonify({"error": "Choose approved, rejected, or suspended."}), 400
    account.status = status
    db.session.commit()
    return jsonify({"account": account_payload(account)})


@app.post("/api/admin/payment-orders/<order_id>/verify")
@roles_required("admin", "superadmin")
def verify_payment_order(order_id):
    order = db.session.get(PaymentOrder, order_id)
    if order is None:
        return jsonify({"error": "Payment order not found."}), 404
    payload = request.get_json(silent=True) or {}
    action = payload.get("action")
    if action not in {"paid", "rejected"}:
        return jsonify({"error": "Choose paid or rejected after checking the payment."}), 400
    if order.status != "pending":
        return jsonify({"error": "This order has already been reviewed."}), 409
    if action == "paid" and not order.payment_reference:
        return jsonify({"error": "A transaction reference must be submitted before payment can be verified."}), 400
    order.status = action
    order.verified_by_id = current_user.id
    if action == "paid":
        order.paid_at = utc_now()
        _generate_paid_order_predictions(order)
    db.session.commit()
    return jsonify({"order": order_payload(order, include_predictions=True)})


@app.get("/api/admin/training-feedback.csv")
@roles_required("admin", "superadmin")
def export_training_feedback():
    feedback_rows = RecommendationFeedback.query.filter_by(consent_to_train=True).join(Prediction).order_by(RecommendationFeedback.created_at.asc()).all()
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["record_number", "training_features", "recommended_codes", "rating", "helpful", "comment"])
    for record_number, feedback in enumerate(feedback_rows, start=1):
        prediction = feedback.prediction
        codes = [item.get("code") for report in prediction.output_data.get("reports", []) for item in report.get("recommendations", [])]
        profile = prediction.input_data
        features = {
            "interests": profile.get("interests", []),
            "finalGrades": profile.get("oLevelResults") or profile.get("finalGrades") or profile.get("grades") or {},
            "mockGrades": profile.get("mockResults") or profile.get("mockGrades") or {},
        }
        comment = feedback.comment or ""
        if comment[:1] in {"=", "+", "-", "@", "\t", "\r"}:
            comment = "'" + comment
        writer.writerow([record_number, json.dumps(features, ensure_ascii=True), ",".join(codes), feedback.rating, feedback.helpful, comment])
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=fishtrees-consented-feedback.csv"},
    )


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