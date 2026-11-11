import getpass
import os

from app import app
from extensions import db
from models import Account


SUPERADMIN_EMAIL = os.environ.get("FISHTREES_SUPERADMIN_EMAIL", "ssemandagerald7@gmail.com").strip().casefold()
SAMPLE_SCHOOL_USERNAME = "1031highs"
SAMPLE_SCHOOL_EMAIL = "1031highs@example.test"


def prompt_password(label):
    while True:
        password = getpass.getpass(f"Set {label} password (12+ characters): ")
        confirmation = getpass.getpass("Confirm password: ")
        if password != confirmation:
            print("Passwords did not match. Try again.")
        elif len(password) < 12:
            print("Use at least 12 characters. Choose a unique password that has not been shared elsewhere.")
        else:
            return password


def create_account(email, username, display_name, role, organization_name=None, institution_type=None):
    existing = Account.query.filter_by(email=email).first()
    if existing is None and username:
        existing = Account.query.filter_by(username=username).first()
    if existing is not None:
        print(f"Account already exists: {username or email}. Password was not changed.")
        return

    password = prompt_password(username or email)
    account = Account(
        email=email,
        username=username,
        display_name=display_name,
        organization_name=organization_name,
        institution_type=institution_type,
        role=role,
        status="approved",
    )
    account.set_password(password)
    db.session.add(account)
    db.session.commit()
    print(f"Created approved {role} account: {username or email}")


def main():
    if not app.config["SQLALCHEMY_DATABASE_URI"].startswith("mysql+pymysql://"):
        print("Warning: FISHTREES_DATABASE_URL is not MySQL. Use a disposable test database only.")
    with app.app_context():
        db.create_all()
        create_account(
            email=SUPERADMIN_EMAIL,
            username=None,
            display_name="FishTrees Super Admin",
            role="superadmin",
        )
        create_account(
            email=SAMPLE_SCHOOL_EMAIL,
            username=SAMPLE_SCHOOL_USERNAME,
            display_name="1031 High School Administrator",
            organization_name="1031 High School",
            institution_type="school",
            role="school",
        )


if __name__ == "__main__":
    main()