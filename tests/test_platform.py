import os
import unittest

os.environ["FISHTREES_DATABASE_URL"] = "sqlite://"
os.environ["FISHTREES_FRONTEND_ORIGINS"] = "https://frontend.example.test"

import app as platform
from extensions import db
from models import Account


class PlatformWorkflowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        platform.app.config.update(
            SQLALCHEMY_DATABASE_URI="sqlite://",
            WTF_CSRF_ENABLED=True,
            TESTING=True,
        )

    def setUp(self):
        self.app_context = platform.app.app_context()
        self.app_context.push()
        db.drop_all()
        db.create_all()
        self.client = platform.app.test_client()
        self.student = self.make_account("student@example.test", "Student", "student")
        self.admin = self.make_account("admin@example.test", "Admin", "superadmin")

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def make_account(self, email, name, role, status="approved"):
        account = Account(email=email, display_name=name, role=role, status=status)
        account.set_password("TestingPassword123!")
        db.session.add(account)
        db.session.commit()
        return account

    def post(self, path, payload):
        token = self.client.get("/api/csrf-token").get_json()["csrfToken"]
        return self.client.post(path, json=payload, headers={"X-CSRFToken": token})

    def login(self, account):
        return self.post("/api/auth/login", {
            "identifier": account.email,
            "password": "TestingPassword123!",
        })

    def switch_to(self, account):
        self.post("/api/auth/logout", {})
        self.login(account)

    def test_post_requests_require_csrf(self):
        response = self.client.post("/api/auth/login", json={})
        self.assertEqual(response.status_code, 400)

    def test_api_cors_only_allows_configured_frontend(self):
        allowed = self.client.get("/api/health", headers={"Origin": "https://frontend.example.test"})
        denied = self.client.get("/api/health", headers={"Origin": "https://untrusted.example.test"})
        self.assertEqual(allowed.headers.get("Access-Control-Allow-Origin"), "https://frontend.example.test")
        self.assertEqual(allowed.headers.get("Access-Control-Allow-Credentials"), "true")
        self.assertIsNone(denied.headers.get("Access-Control-Allow-Origin"))

    def test_institution_requires_admin_approval(self):
        response = self.post("/api/auth/signup", {
            "email": "office@school.example",
            "displayName": "School Office",
            "organizationName": "Sample School",
            "institutionType": "school",
            "role": "school",
            "password": "StrongSchoolPassword123!",
        })
        self.assertEqual(response.status_code, 201)
        institution = Account.query.filter_by(email="office@school.example").one()
        self.assertEqual(institution.status, "pending")
        self.post("/api/auth/login", {
            "identifier": institution.email,
            "password": "StrongSchoolPassword123!",
        })
        blocked = self.post("/api/payment-orders", {"mode": "bulk"})
        self.assertEqual(blocked.status_code, 403)

        self.switch_to(self.admin)
        approved = self.post(f"/api/admin/accounts/{institution.id}/status", {"status": "approved"})
        self.assertEqual(approved.status_code, 200)
        self.post("/api/auth/logout", {})
        self.post("/api/auth/login", {
            "identifier": institution.email,
            "password": "StrongSchoolPassword123!",
        })
        dashboard = self.client.get("/api/dashboard")
        self.assertEqual(dashboard.status_code, 200)

    def test_prediction_requires_verified_payment_and_feedback_opt_in(self):
        self.login(self.student)
        order_response = self.post("/api/payment-orders", {
            "mode": "individual",
            "paymentMethod": "mobile-money",
            "profile": {
                "schools": ["Sample School"],
                "interests": ["Medicine and Healthcare"],
                "oLevelResults": {"Biology": "A", "Chemistry": "B"},
                "mockResults": {},
            },
        })
        self.assertEqual(order_response.status_code, 201)
        order_id = order_response.get_json()["order"]["id"]
        selected_method = self.post(f"/api/payment-orders/{order_id}/method", {"paymentMethod": "bank-transfer"})
        self.assertEqual(selected_method.status_code, 200)
        self.assertEqual(selected_method.get_json()["order"]["paymentMethod"], "bank-transfer")
        denied = self.post("/api/recommendations", {})
        self.assertEqual(denied.status_code, 402)

        self.switch_to(self.admin)
        no_reference = self.post(f"/api/admin/payment-orders/{order_id}/verify", {"action": "paid"})
        self.assertEqual(no_reference.status_code, 400)

        self.switch_to(self.student)
        reference = self.post(f"/api/payment-orders/{order_id}/reference", {
            "paymentMethod": "mobile-money",
            "paymentReference": "TEST-TRANSFER-001",
        })
        self.assertEqual(reference.status_code, 200)

        self.switch_to(self.admin)
        verified = self.post(f"/api/admin/payment-orders/{order_id}/verify", {"action": "paid"})
        report = verified.get_json()["order"]
        self.assertEqual(verified.status_code, 200)
        self.assertEqual(report["status"], "paid")
        self.assertEqual(len(report["reports"]), 1)
        prediction_id = report["predictionId"]
        overview = self.client.get("/api/admin/overview").get_json()
        self.assertEqual(overview["predictions"], 1)
        self.assertEqual(overview["amountCollected"], 500)

        self.switch_to(self.student)
        feedback = self.post(f"/api/predictions/{prediction_id}/feedback", {
            "rating": 5,
            "helpful": True,
            "comment": "=not-a-spreadsheet-formula",
            "consentToTrain": "false",
        })
        self.assertEqual(feedback.status_code, 200)
        self.switch_to(self.admin)
        export = self.client.get("/api/admin/training-feedback.csv")
        self.assertEqual(export.status_code, 200)
        self.assertNotIn("finalGrades", export.get_data(as_text=True))

        self.switch_to(self.student)
        opted_in = self.post(f"/api/predictions/{prediction_id}/feedback", {
            "rating": 5,
            "helpful": True,
            "comment": "=not-a-spreadsheet-formula",
            "consentToTrain": True,
        })
        self.assertEqual(opted_in.status_code, 200)
        self.switch_to(self.admin)
        export = self.client.get("/api/admin/training-feedback.csv")
        self.assertIn("finalGrades", export.get_data(as_text=True))
        self.assertNotIn(self.student.email, export.get_data(as_text=True))
        self.assertIn("'=not-a-spreadsheet-formula", export.get_data(as_text=True))


if __name__ == "__main__":
    unittest.main()