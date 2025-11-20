#!/usr/bin/env python3
"""
StudentCBT API Testing Script
Tests all API endpoints dynamically with support for Admin and Student roles
Automatically handles authentication and token management
"""

import requests
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

# Configuration
BASE_URL = "http://localhost:3000/api"
VERBOSE = True  # Set to False to reduce output


class UserRole(Enum):
    ADMIN = "admin"
    STUDENT = "student"


@dataclass
class TestUser:
    """User credentials for testing"""
    email: str
    password: str
    role: UserRole


class APITester:
    """Main API testing class"""

    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.tokens: Dict[UserRole, str] = {}
        self.user_ids: Dict[UserRole, str] = {}
        self.created_resources = {
            'classes': [],
            'subjects': [],
            'assessments': [],
            'students': [],
            'class_subjects': []
        }
        self.test_results = []

    def log(self, message: str, level: str = "INFO"):
        """Log messages with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if level == "ERROR":
            prefix = "❌"
        elif level == "SUCCESS":
            prefix = "✅"
        elif level == "WARNING":
            prefix = "⚠️"
        else:
            prefix = "ℹ️"
        
        if VERBOSE or level in ["ERROR", "SUCCESS"]:
            print(f"[{timestamp}] {prefix} {message}")

    def log_request(self, method: str, endpoint: str, data: Optional[Dict] = None):
        """Log API request details"""
        if VERBOSE:
            print(f"\n📤 {method} {endpoint}")
            if data:
                print(f"   Data: {json.dumps(data, indent=2)[:200]}...")

    def log_response(self, status_code: int, response_data: Dict):
        """Log API response details"""
        if VERBOSE and status_code < 500:
            print(f"📥 Status: {status_code}")
            if response_data:
                print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")

    def register_user(self, user: TestUser) -> bool:
        """Register a new user"""
        self.log(f"Registering {user.role.value} user: {user.email}")
        
        endpoint = "/auth/register"
        data = {
            "email": user.email,
            "password": user.password,
            "role": user.role.value
        }

        # Add student-specific fields if registering as student
        if user.role == UserRole.STUDENT:
            data.update({
                "studentId": user.email.split('@')[0],
                "firstName": user.email.split('.')[0].capitalize(),
                "lastName": user.email.split('.')[1].split('@')[0].capitalize() if '.' in user.email else "Student",
                "classId": self.created_resources['classes'][0] if self.created_resources['classes'] else None
            })

        self.log_request("POST", endpoint, data)
        
        try:
            response = requests.post(
                f"{self.base_url}{endpoint}",
                json=data,
                timeout=10
            )
            self.log_response(response.status_code, response.json() if response.text else {})

            if response.status_code in [200, 201]:
                self.log(f"User {user.role.value} registered successfully", "SUCCESS")
                return True
            else:
                self.log(f"Registration failed: {response.text}", "ERROR")
                return False
        except requests.exceptions.RequestException as e:
            self.log(f"Registration request failed: {str(e)}", "ERROR")
            return False

    def login(self, user: TestUser) -> bool:
        """Login user and store token"""
        self.log(f"Logging in {user.role.value} user: {user.email}")
        
        endpoint = "/auth/login"
        data = {
            "email": user.email,
            "password": user.password
        }

        self.log_request("POST", endpoint, data)

        try:
            response = requests.post(
                f"{self.base_url}{endpoint}",
                json=data,
                timeout=10
            )
            self.log_response(response.status_code, response.json() if response.text else {})

            if response.status_code == 200:
                resp_data = response.json()
                token = resp_data.get('token') or resp_data.get('accessToken')
                user_id = resp_data.get('user', {}).get('id')
                
                if token:
                    self.tokens[user.role] = token
                    self.user_ids[user.role] = user_id
                    self.log(f"Login successful. Token: {token[:20]}...", "SUCCESS")
                    return True
                else:
                    self.log("No token in response", "ERROR")
                    return False
            else:
                self.log(f"Login failed: {response.text}", "ERROR")
                return False
        except requests.exceptions.RequestException as e:
            self.log(f"Login request failed: {str(e)}", "ERROR")
            return False

    def make_request(
        self,
        method: str,
        endpoint: str,
        role: UserRole = UserRole.ADMIN,
        data: Optional[Dict] = None,
        expected_status: int = 200
    ) -> Tuple[bool, Dict]:
        """Make authenticated API request"""
        self.log_request(method, endpoint, data)

        token = self.tokens.get(role)
        headers = {
            "Content-Type": "application/json"
        }

        if token:
            headers["Authorization"] = f"Bearer {token}"

        try:
            response = requests.request(
                method=method,
                url=f"{self.base_url}{endpoint}",
                json=data,
                headers=headers,
                timeout=10
            )

            self.log_response(response.status_code, response.json() if response.text else {})

            if response.status_code == expected_status:
                result = response.json() if response.text else {}
                return True, result
            else:
                self.log(f"Expected {expected_status}, got {response.status_code}", "WARNING")
                return False, response.json() if response.text else {}
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {str(e)}", "ERROR")
            return False, {}

    # ============= ADMIN ENDPOINTS =============

    def test_admin_auth(self):
        """Test admin authentication"""
        self.log("\n" + "="*60)
        self.log("TESTING ADMIN AUTHENTICATION", "INFO")
        self.log("="*60)

        admin_user = TestUser(
            email="admin@test.com",
            password="admin123!",
            role=UserRole.ADMIN
        )

        # Try login first (user might already exist)
        if not self.login(admin_user):
            # Register if login fails
            self.register_user(admin_user)
            self.login(admin_user)

    def test_admin_classes(self):
        """Test class management endpoints"""
        self.log("\n" + "="*60)
        self.log("TESTING ADMIN - CLASS MANAGEMENT", "INFO")
        self.log("="*60)

        # Create class
        class_data = {
            "name": "JSS1",
            "stream": "Science"
        }
        success, resp = self.make_request(
            "POST", "/admin/classes", UserRole.ADMIN, class_data, 201
        )
        if success and resp.get('class'):
            class_id = resp['class']['id']
            self.created_resources['classes'].append(class_id)
            self.log(f"Class created: {class_id}", "SUCCESS")

            # Get all classes
            self.make_request("GET", "/admin/classes", UserRole.ADMIN)

            # Get specific class
            self.make_request("GET", f"/admin/classes/{class_id}", UserRole.ADMIN)

            # Update class
            update_data = {"name": "JSS1", "stream": "Arts"}
            self.make_request("PUT", f"/admin/classes/{class_id}", UserRole.ADMIN, update_data)
        else:
            self.log("Failed to create class", "ERROR")

    def test_admin_subjects(self):
        """Test subject management endpoints"""
        self.log("\n" + "="*60)
        self.log("TESTING ADMIN - SUBJECT MANAGEMENT", "INFO")
        self.log("="*60)

        # Create subject
        subject_data = {"name": f"Mathematics_{datetime.now().timestamp()}"}
        success, resp = self.make_request(
            "POST", "/admin/subjects", UserRole.ADMIN, subject_data, 201
        )
        if success and resp.get('subject'):
            subject_id = resp['subject']['id']
            self.created_resources['subjects'].append(subject_id)
            self.log(f"Subject created: {subject_id}", "SUCCESS")

            # Get all subjects
            self.make_request("GET", "/admin/subjects", UserRole.ADMIN)

            # Assign subject to class
            if self.created_resources['classes']:
                assign_data = {
                    "classId": self.created_resources['classes'][0],
                    "subjectId": subject_id
                }
                success, resp = self.make_request(
                    "POST", "/admin/class-subjects", UserRole.ADMIN, assign_data, 201
                )
                if success:
                    self.log("Subject assigned to class", "SUCCESS")
        else:
            self.log("Failed to create subject", "ERROR")

    def test_admin_assessments(self):
        """Test assessment management endpoints"""
        self.log("\n" + "="*60)
        self.log("TESTING ADMIN - ASSESSMENT MANAGEMENT", "INFO")
        self.log("="*60)

        if not self.created_resources['classes'] or not self.created_resources['subjects']:
            self.log("Need class and subject to create assessment", "WARNING")
            return

        # Create assessment
        assessment_data = {
            "title": f"Test Assessment {datetime.now().timestamp()}",
            "description": "Test assessment for API testing",
            "classId": self.created_resources['classes'][0],
            "subjectId": self.created_resources['subjects'][0],
            "duration": 30,
            "passMarks": 50,
            "instructions": "Answer all questions",
            "showResults": True
        }
        success, resp = self.make_request(
            "POST", "/assessment", UserRole.ADMIN, assessment_data, 201
        )
        if success and resp.get('assessment'):
            assessment_id = resp['assessment']['id']
            self.created_resources['assessments'].append(assessment_id)
            self.log(f"Assessment created: {assessment_id}", "SUCCESS")

            # Get all assessments
            self.make_request("GET", "/assessment", UserRole.ADMIN)

            # Get specific assessment
            self.make_request("GET", f"/assessment/{assessment_id}", UserRole.ADMIN)

            # Test adding question
            self.test_admin_questions(assessment_id)

            # Update assessment
            update_data = {"title": "Updated Assessment Title"}
            self.make_request("PUT", f"/assessment/{assessment_id}", UserRole.ADMIN, update_data)
        else:
            self.log("Failed to create assessment", "ERROR")

    def test_admin_questions(self, assessment_id: str):
        """Test question management endpoints"""
        self.log("\n" + "-"*60)
        self.log("TESTING ADMIN - QUESTION MANAGEMENT", "INFO")
        self.log("-"*60)

        # Add MCQ
        question_data = {
            "questionText": "What is 2 + 2?",
            "questionType": "MULTIPLE_CHOICE",
            "options": ["3", "4", "5", "6"],
            "correctAnswer": "4",
            "marks": 1,
            "explanation": "The sum of 2 and 2 is 4",
            "orderIndex": 1
        }
        success, resp = self.make_request(
            "POST", f"/assessment/{assessment_id}/questions", UserRole.ADMIN, question_data, 201
        )
        if success:
            self.log("MCQ question added", "SUCCESS")

        # Add True/False
        tf_question = {
            "questionText": "Earth is round: True or False?",
            "questionType": "TRUE_FALSE",
            "correctAnswer": "True",
            "marks": 1,
            "orderIndex": 2
        }
        self.make_request(
            "POST", f"/assessment/{assessment_id}/questions", UserRole.ADMIN, tf_question, 201
        )

        # Add Fill blank
        fill_question = {
            "questionText": "The capital of France is ___",
            "questionType": "FILL_BLANK",
            "correctAnswer": "Paris",
            "marks": 1,
            "orderIndex": 3
        }
        self.make_request(
            "POST", f"/assessment/{assessment_id}/questions", UserRole.ADMIN, fill_question, 201
        )

        # Get assessment with questions
        self.make_request("GET", f"/assessment/{assessment_id}", UserRole.ADMIN)

    def test_admin_bulk_import(self):
        """Test bulk question import"""
        self.log("\n" + "="*60)
        self.log("TESTING ADMIN - BULK IMPORT", "INFO")
        self.log("="*60)

        if not self.created_resources['assessments']:
            self.log("Need assessment to test bulk import", "WARNING")
            return

        assessment_id = self.created_resources['assessments'][0]

        questions = [
            {
                "questionText": "Bulk Q1",
                "questionType": "MULTIPLE_CHOICE",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": "B",
                "marks": 2
            },
            {
                "questionText": "Bulk Q2: True or False?",
                "questionType": "TRUE_FALSE",
                "correctAnswer": "True",
                "marks": 1
            }
        ]

        success, resp = self.make_request(
            "POST", f"/assessment/{assessment_id}/questions/bulk",
            UserRole.ADMIN, {"questions": questions}, 201
        )
        if success:
            self.log("Bulk import successful", "SUCCESS")

    def test_admin_publish(self):
        """Test assessment publishing"""
        self.log("\n" + "="*60)
        self.log("TESTING ADMIN - ASSESSMENT PUBLISHING", "INFO")
        self.log("="*60)

        if not self.created_resources['assessments']:
            self.log("Need assessment to test publishing", "WARNING")
            return

        assessment_id = self.created_resources['assessments'][0]

        success, resp = self.make_request(
            "POST", f"/assessment/{assessment_id}/publish",
            UserRole.ADMIN, {}, 200
        )
        if success:
            self.log("Assessment published successfully", "SUCCESS")

    def test_admin_students(self):
        """Test student management endpoints"""
        self.log("\n" + "="*60)
        self.log("TESTING ADMIN - STUDENT MANAGEMENT", "INFO")
        self.log("="*60)

        if not self.created_resources['classes']:
            self.log("Need class to create student", "WARNING")
            return

        # Get all students
        self.make_request("GET", "/admin/students", UserRole.ADMIN)

    # ============= STUDENT ENDPOINTS =============

    def test_student_auth(self):
        """Test student authentication"""
        self.log("\n" + "="*60)
        self.log("TESTING STUDENT AUTHENTICATION", "INFO")
        self.log("="*60)

        if not self.created_resources['classes']:
            self.log("Need class to create student", "WARNING")
            return

        student_user = TestUser(
            email="student@test.com",
            password="Student123!@",
            role=UserRole.STUDENT
        )

        if not self.login(student_user):
            self.register_user(student_user)
            self.login(student_user)

    def test_student_assessments(self):
        """Test student assessment viewing"""
        self.log("\n" + "="*60)
        self.log("TESTING STUDENT - VIEW ASSESSMENTS", "INFO")
        self.log("="*60)

        self.make_request("GET", "/student/assessments", UserRole.STUDENT)

    def test_student_exam(self):
        """Test student exam interface"""
        self.log("\n" + "="*60)
        self.log("TESTING STUDENT - EXAM INTERFACE", "INFO")
        self.log("="*60)

        if not self.created_resources['assessments']:
            self.log("Need published assessment to test exam", "WARNING")
            return

        assessment_id = self.created_resources['assessments'][0]

        # Get assessment for exam
        success, resp = self.make_request(
            "GET", f"/student/assessments/{assessment_id}",
            UserRole.STUDENT
        )
        if success:
            self.log("Assessment loaded for exam", "SUCCESS")

            # Start assessment
            success, resp = self.make_request(
                "POST", f"/student/assessments/{assessment_id}/start",
                UserRole.STUDENT, {}, 201
            )
            if success:
                self.log("Exam started", "SUCCESS")

    def test_student_results(self):
        """Test student results viewing"""
        self.log("\n" + "="*60)
        self.log("TESTING STUDENT - VIEW RESULTS", "INFO")
        self.log("="*60)

        self.make_request("GET", "/student/results", UserRole.STUDENT)

    def run_full_test_suite(self):
        """Run all tests in sequence"""
        self.log("\n" + "🚀 "*30)
        self.log("STARTING FULL API TEST SUITE", "INFO")
        self.log("🚀 "*30)

        try:
            # Admin Tests
            self.test_admin_auth()
            self.test_admin_classes()
            self.test_admin_subjects()
            self.test_admin_assessments()
            self.test_admin_bulk_import()
            self.test_admin_publish()
            self.test_admin_students()

            # Student Tests
            self.test_student_auth()
            self.test_student_assessments()
            self.test_student_exam()
            self.test_student_results()

            self.print_summary()
        except Exception as e:
            self.log(f"Test suite error: {str(e)}", "ERROR")
            import traceback
            traceback.print_exc()

    def print_summary(self):
        """Print test summary"""
        self.log("\n" + "="*60)
        self.log("TEST SUMMARY", "INFO")
        self.log("="*60)

        summary = f"""
Resources Created:
  - Classes: {len(self.created_resources['classes'])}
  - Subjects: {len(self.created_resources['subjects'])}
  - Assessments: {len(self.created_resources['assessments'])}
  - Students: {len(self.created_resources['students'])}

Tokens Acquired:
  - Admin: {'✅' if UserRole.ADMIN in self.tokens else '❌'}
  - Student: {'✅' if UserRole.STUDENT in self.tokens else '❌'}

API Base URL: {self.base_url}
        """
        print(summary)


def main():
    """Main entry point"""
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║          StudentCBT API Testing Suite v1.0                   ║
    ║  Comprehensive API tests for Admin and Student roles         ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

    # Create tester instance
    tester = APITester(BASE_URL)

    # Run tests
    tester.run_full_test_suite()


if __name__ == "__main__":
    main()
