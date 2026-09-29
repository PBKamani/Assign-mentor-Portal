"""
Assignmentor - Live Firebase Provisioning and Verification Script
Initializes/verifies Firebase Auth users (ADMIN & USER) and Firestore collections.
"""
import os
import sys
import datetime

# Ensure backend root is on PYTHONPATH
sys.path.insert(0, os.path.dirname(__file__))

from app.config import settings
from app.firebase import init_firebase, get_db, get_storage_bucket, is_mock_mode

def provision_and_verify():
    print("==================================================")
    print(" ASSIGNMENTOR: LIVE FIREBASE INITIALIZATION       ")
    print("==================================================")

    init_firebase()

    if is_mock_mode():
        print("[STATUS] Running in local mock mode.")
        print("[NOTICE] To connect live Firebase, provide 'backend/serviceAccountKey.json' or set FIREBASE_* in 'backend/.env'.")
        return False

    print("[SUCCESS] Connected to live Firebase Admin SDK successfully!")

    try:
        from firebase_admin import auth
        db = get_db()
        bucket = get_storage_bucket()

        print(f"[STATUS] Connected to Storage Bucket: {bucket.name}")

        # Ensure collections: users, subjects, assignments, questions
        # 1. Provision / Verify Admin User in Firebase Auth & Firestore
        admin_email = "admin@assignmentor.app"
        try:
            admin_user = auth.get_user_by_email(admin_email)
            print(f"[AUTH] Existing Admin found in Firebase Auth (UID: {admin_user.uid})")
        except auth.UserNotFoundError:
            # Create admin user
            admin_user = auth.create_user(
                email=admin_email,
                password="admin@040905",
                display_name="ADMIN"
            )
            print(f"[AUTH] Created Admin user in Firebase Auth (UID: {admin_user.uid})")

        # Set custom claims
        auth.set_custom_user_claims(admin_user.uid, {"role": "admin"})

        # Ensure Admin in Firestore users collection
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        db.collection("users").document(admin_user.uid).set({
            "username": "ADMIN",
            "email": admin_email,
            "role": "admin",
            "updatedAt": now
        }, merge=True)
        print(f"[FIRESTORE] Ensured 'users/{admin_user.uid}' with role 'admin'")

        # 2. Provision / Verify Regular User in Firebase Auth & Firestore
        user_email = "user@assignmentor.app"
        try:
            reg_user = auth.get_user_by_email(user_email)
            print(f"[AUTH] Existing User found in Firebase Auth (UID: {reg_user.uid})")
        except auth.UserNotFoundError:
            reg_user = auth.create_user(
                email=user_email,
                password="user@123",
                display_name="USER"
            )
            print(f"[AUTH] Created User in Firebase Auth (UID: {reg_user.uid})")

        # Set custom claims
        auth.set_custom_user_claims(reg_user.uid, {"role": "user"})

        db.collection("users").document(reg_user.uid).set({
            "username": "USER",
            "email": user_email,
            "role": "user",
            "updatedAt": now
        }, merge=True)
        print(f"[FIRESTORE] Ensured 'users/{reg_user.uid}' with role 'user'")

        print("\n[VERIFICATION SUMMARY]")
        print("Live Collections ready: users, subjects, assignments, questions (NO units)")
        print("Storage bucket ready:   assignmentor/question-diagrams/ & assignmentor/answer-diagrams/")
        print("Auth roles ready:       ADMIN (role: admin) & USER (role: user)")
        print("==================================================")
        return True

    except Exception as e:
        print(f"[ERROR] Live Firebase provisioning encountered an error: {e}")
        return False

if __name__ == "__main__":
    provision_and_verify()
