from datetime import datetime, timezone
from uuid import uuid4

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db


def utc_now():
    return datetime.now(timezone.utc)


class Account(UserMixin, db.Model):
    __tablename__ = "accounts"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(254), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=True, index=True)
    display_name = db.Column(db.String(160), nullable=False)
    organization_name = db.Column(db.String(180), nullable=True)
    institution_type = db.Column(db.String(40), nullable=True)
    role = db.Column(db.String(24), nullable=False, default="student", index=True)
    status = db.Column(db.String(24), nullable=False, default="approved", index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    orders = db.relationship(
        "PaymentOrder",
        foreign_keys="PaymentOrder.account_id",
        back_populates="account",
        lazy="select",
    )

    @property
    def is_active(self):
        return self.status not in {"rejected", "suspended"}

    @property
    def is_approved(self):
        return self.status == "approved"

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method="scrypt")

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class PaymentOrder(db.Model):
    __tablename__ = "payment_orders"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    reference = db.Column(db.String(24), unique=True, nullable=False, index=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False, index=True)
    mode = db.Column(db.String(16), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending", index=True)
    amount = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="UGX")
    prediction_count = db.Column(db.Integer, nullable=False)
    payment_method = db.Column(db.String(30), nullable=True)
    payment_reference = db.Column(db.String(120), nullable=True)
    request_payload = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    paid_at = db.Column(db.DateTime(timezone=True), nullable=True)
    verified_by_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=True)

    account = db.relationship("Account", foreign_keys=[account_id], back_populates="orders")
    verifier = db.relationship("Account", foreign_keys=[verified_by_id])
    predictions = db.relationship("Prediction", back_populates="order", lazy="select")


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    order_id = db.Column(db.String(36), db.ForeignKey("payment_orders.id"), nullable=False, index=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False, index=True)
    student_name = db.Column(db.String(160), nullable=False)
    input_data = db.Column(db.JSON, nullable=False)
    output_data = db.Column(db.JSON, nullable=False)
    model_version = db.Column(db.String(40), nullable=False, default="synthetic-knn-v1")
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    order = db.relationship("PaymentOrder", back_populates="predictions")
    feedback = db.relationship("RecommendationFeedback", back_populates="prediction", lazy="select")


class RecommendationFeedback(db.Model):
    __tablename__ = "recommendation_feedback"

    id = db.Column(db.Integer, primary_key=True)
    prediction_id = db.Column(db.String(36), db.ForeignKey("predictions.id"), nullable=False, index=True)
    account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)
    helpful = db.Column(db.Boolean, nullable=False)
    comment = db.Column(db.String(1200), nullable=True)
    consent_to_train = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    prediction = db.relationship("Prediction", back_populates="feedback")