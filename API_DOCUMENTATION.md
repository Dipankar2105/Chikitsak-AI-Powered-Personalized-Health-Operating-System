# Chikitsak AI Health Operating System - API Documentation

## Overview

Chikitsak AI is a full-stack healthcare AI application providing intelligent health guidance, symptom triage, lab analysis, medication checking, and emergency detection. The system combines local machine learning models with LLM fallback for comprehensive healthcare intelligence.

**Base URLs:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Authentication

All protected endpoints require JWT Bearer token authentication.

### Register New User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "city": "Mumbai",
  "country": "India"
}

Response (201 Created):
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "sarf5Lz5ualAwLUXWclIVHyceyUJaDAEtGqNMy...",
    "token_type": "bearer",
    "user": {
      "id": 11,
      "name": "John Doe",
      "email": "john@example.com",
      "age": null,
      "gender": null
    }
  },
  "message": "OK"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "bearer"
  },
  "message": "OK"
}
```

### Refresh Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "sarf5Lz5ualAwLUXWclIVHyceyUJaDAEtGqNMy..."
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  },
  "message": "OK"
}
```

---

## Core API Endpoints

### 1. Symptom Analysis (Hybrid Triage)

**Endpoint:** `POST /symptoms/analyze`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "symptoms": ["high fever", "cough", "fatigue"],
  "duration": "3 days",
  "severity": "moderate"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "triage_level": "MODERATE",
    "confidence": 0.92,
    "model_used": "triage_ml",
    "primary_diagnosis": "Common Cold/Flu",
    "differential_diagnoses": [
      "Bronchitis",
      "Early Pneumonia"
    ],
    "red_flags": ["persistent_high_fever"],
    "recommendations": [
      "Rest for 3-5 days",
      "Stay hydrated",
      "Monitor temperature"
    ]
  },
  "message": "Symptom analysis completed"
}
```

**Emergency Response Example:**
```json
{
  "status": "error",
  "data": {
    "emergency": true,
    "type": "sepsis",
    "level": "CRITICAL",
    "action": "CALL_EMERGENCY"
  },
  "message": "\n🚨 CRITICAL FEVER PATTERN DETECTED. SEEK EMERGENCY CARE IMMEDIATELY.\n\nCall Local Emergency Services:\nUS: 911\nUK: 999\nEU: 112\nIndia: 102/105\n\nDO NOT DELAY. SEEK IMMEDIATE HELP.\n",
  "confidence": 1.0
}
```

---

### 2. AI Chat Assistant

**Endpoint:** `POST /chat`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "I have a severe headache and fever, should I be worried?",
  "session_id": "session-001"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "response": "Yes, a combination of severe headache and fever can indicate several conditions...",
  "confidence": 0.95,
  "triage": "URGENT",
  "causes": [
    {
      "name": "Meningitis",
      "probability": 15,
      "confidence": 85,
      "risk": "critical",
      "description": "Inflammation of protective membranes around brain/spinal cord"
    }
  ],
  "next_steps": [
    "Seek medical attention today",
    "Monitor for neck stiffness",
    "Stay hydrated"
  ],
  "session_id": "session-001"
}
```

---

### 3. Health Profile Management

**Get User Health Profile**
```
GET /health-profile/
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": {
    "user_id": 11,
    "height": 180,
    "weight": 75,
    "bmi": 23.1,
    "activity_level": "moderate",
    "chronic_conditions": ["none"],
    "medications": [],
    "allergies": [],
    "last_updated": "2026-03-04T12:00:00Z"
  }
}
```

**Update Health Profile**
```
PUT /health-profile/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "height": 180,
  "weight": 75,
  "activity_level": "moderate",
  "chronic_conditions": ["hypertension"],
  "medications": ["Lisinopril 10mg"],
  "allergies": ["Penicillin"]
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "bmi": 23.1,
    "health_score": 78,
    "recommendations": [...]
  }
}
```

---

### 4. Lab Report Analysis

**Endpoint:** `POST /lab-reports/analyze`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "lab_name": "Complete Blood Count",
  "test_results": {
    "Hemoglobin": 14.5,
    "WBC": 7500,
    "Platelets": 250000,
    "RBC": 4.8
  }
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "lab_name": "Complete Blood Count",
    "analysis": {
      "Hemoglobin": {
        "value": 14.5,
        "status": "Normal",
        "reference_range": "13.5-17.5"
      },
      "WBC": {
        "value": 7500,
        "status": "Normal",
        "reference_range": "4500-11000"
      }
    },
    "summary": "All values normal",
    "confidence": 0.98
  }
}
```

---

### 5. Medication Verification

**Endpoint:** `POST /medications/check-interactions`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "medications": [
    "Aspirin 500mg",
    "Ibuprofen 200mg",
    "Warfarin 5mg"
  ]
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "interactions": [
      {
        "drug1": "Aspirin",
        "drug2": "Ibuprofen",
        "severity": "MODERATE",
        "description": "Both are NSAIDs. Combined use increases risk of GI bleeding"
      },
      {
        "drug1": "Aspirin",
        "drug2": "Warfarin",
        "severity": "SEVERE",
        "description": "Combined use significantly increases bleeding risk"
      }
    ],
    "safe_to_combine": false,
    "recommendation": "Consult your doctor before taking these medications together"
  }
}
```

---

### 6. Nutrition & Food Analysis

**Endpoint:** `POST /nutrition/analyze-food`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request:**
```
Form Data:
- image: [image file of food]
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "food_detected": "Grilled Chicken with Rice",
    "nutritional_info": {
      "calories": 450,
      "protein": 35,
      "carbs": 45,
      "fat": 8
    },
    "health_score": 8.5,
    "recommendations": [
      "Good protein source",
      "Add vegetables for more fiber"
    ]
  }
}
```

---

### 7. Medical Image Analysis

#### X-Ray Analysis
**Endpoint:** `POST /imaging/xray-analysis`

**Endpoint:** `POST /imaging/brain-mri-analysis`

**Endpoint:** `POST /imaging/skin-analysis`

All image endpoints follow similar pattern:
```
POST /imaging/{analysis_type}
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

Form Data:
- image: [medical image file]

Response (200 OK):
{
  "status": "success",
  "data": {
    "condition": "Normal / Pneumonia / Abnormality",
    "confidence": 0.94,
    "findings": [
      "Clear lung fields",
      "No consolidation"
    ],
    "recommendation": "No acute findings"
  }
}
```

---

### 8. Session Management

**Get Chat History**
```
GET /chat/history?session_id=session-001&limit=10
Authorization: Bearer {access_token}

Response (200 OK):
{
  "status": "success",
  "data": [
    {
      "role": "user",
      "message": "I have a headache",
      "timestamp": "2026-03-04T12:00:00Z"
    },
    {
      "role": "assistant",
      "response": "...",
      "confidence": 0.95,
      "timestamp": "2026-03-04T12:00:01Z"
    }
  ]
}
```

---

## Response Format

All API responses follow a standardized envelope format:

```json
{
  "status": "success|error",
  "data": {
    // Endpoint-specific data
  },
  "message": "Human-readable message",
  "confidence": 0.0-1.0
}
```

---

## Error Handling

### 400 Bad Request
```json
{
  "status": "error",
  "data": null,
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "data": null,
  "message": "Invalid or expired token"
}
```

### 422 Validation Error
```json
{
  "status": "error",
  "data": [
    {
      "type": "missing",
      "loc": ["body", "name"],
      "msg": "Field required"
    }
  ],
  "message": "Validation error — check your request body."
}
```

### 500 Server Error
```json
{
  "status": "error",
  "data": null,
  "message": "Internal server error"
}
```

---

## Safety & Emergency Patterns

The system automatically detects and responds to emergency conditions:

**Detected Emergencies:**
- Cardiac (chest pain, pressure, severe SOB)
- Respiratory (severe breathing difficulty)
- Neurological (stroke signs, severe headache with fever)
- Trauma (heavy bleeding, severe fractures)
- Anaphylaxis (allergic reactions)
- Sepsis (dangerous fever patterns)
- Poisoning (toxin exposure)
- Infant Fever (dangerous for babies)
- Suicidal Ideation (crisis detection)
- Self-harm (risk assessment)

**Emergency Response:**
```json
{
  "status": "error",
  "data": {
    "emergency": true,
    "type": "cardiac",
    "level": "CRITICAL",
    "action": "CALL_EMERGENCY"
  },
  "message": "🚨 CRITICAL CONDITION. CALL EMERGENCY SERVICES IMMEDIATELY.\n\nUS: 911\nUK: 999\nEU: 112\nIndia: 102/105"
}
```

---

## Model Information

All responses include model attribution:

```json
{
  "model_used": "triage_ml",  // "triage_ml" or "llm_fallback"
  "model_info": {
    "name": "Triage Model",
    "type": "sklearn",
    "version": "1.0",
    "confidence_threshold": 0.65
  }
}
```

---

## Rate Limiting

- No hard rate limit for localhost
- Production: 100 requests/minute per user
- LLM fallback: 30 requests/hour (API quota)

---

## Webhook Events

Future implementation for:
- `health.profile.updated`
- `symptom.analyzed`
- `emergency.detected`
- `medication.interaction.found`

---

## Code Examples

### Python
```python
import requests

BASE_URL = "http://localhost:8000"

# Register
response = requests.post(f"{BASE_URL}/auth/register", json={
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
})
token = response.json()["data"]["access_token"]

# Analyze symptoms
response = requests.post(
    f"{BASE_URL}/symptoms/analyze",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "symptoms": ["fever", "cough"],
        "duration": "3 days",
        "severity": "moderate"
    }
)
print(response.json())
```

### JavaScript/TypeScript
```javascript
const BASE_URL = "http://localhost:8000";

// Register
const registerRes = await fetch(`${BASE_URL}/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    password: "SecurePass123!"
  })
});

const { data } = await registerRes.json();
const token = data.access_token;

// Analyze symptoms
const symptomRes = await fetch(`${BASE_URL}/symptoms/analyze`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    symptoms: ["fever", "cough"],
    duration: "3 days",
    severity: "moderate"
  })
});

console.log(await symptomRes.json());
```

### cURL
```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Analyze symptoms
curl -X POST http://localhost:8000/symptoms/analyze \
  -H "Authorization: Bearer XXXXXX" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": ["fever", "cough"],
    "duration": "3 days",
    "severity": "moderate"
  }'
```

---

## Support

- **Issues/Bugs:** Open an issue in the repository
- **Documentation:** Full OpenAPI docs at `/docs`
- **Contact:** dipankar.pimple@vit.edu.in
- **Emergency:** Call local emergency services (911/999/112/102/105)

---

**Last Updated:** March 4, 2026
**API Version:** 1.0
**Status:** Production Ready
