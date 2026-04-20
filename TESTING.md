# HealthAI - Testing Documentation

## Testing Overview

This document outlines the comprehensive testing strategy for the HealthAI healthcare assistant system, including test cases, scenarios, and validation procedures.

---

## Test Categories

### 1. Unit Testing

#### Symptom Matching Algorithm

**Test Case 1.1: Exact Symptom Match**
```
Input: "I have fever"
Expected: Matches diseases with "fever" symptom
Database: Flu, Dengue, Common Cold all have fever
Result: Returns one of these with high score
Status: [PASS/FAIL]
```

**Test Case 1.2: Multiple Symptoms**
```
Input: "fever and headache and body ache"
Expected: Matches diseases with all three symptoms
Best Match: Flu (all three symptoms)
Accuracy: High score for Flu
Status: [PASS/FAIL]
```

**Test Case 1.3: Partial Symptom Match**
```
Input: "slight cough and sneezing"
Expected: Matches Cold/Allergy
Best Match: Common Cold
Alternatives: Allergies, Flu
Status: [PASS/FAIL]
```

**Test Case 1.4: No Match**
```
Input: "strange feeling in my toe"
Expected: No specific disease matched
Response: Ask for more details
Fallback Message: Returned
Status: [PASS/FAIL]
```

**Test Case 1.5: Similarity Calculation**
```
Input: "I have flue"  (typo)
Expected: Matches to "flu" using Levenshtein distance
Similarity: > 0.6 threshold
Result: Still identifies Flu
Status: [PASS/FAIL]
```

#### Severity Classification

**Test Case 1.6: Mild Disease**
```
Input: "Common cold symptoms"
Expected: severity = "mild"
Confidence: ✓
Status: [PASS/FAIL]
```

**Test Case 1.7: Critical Disease**
```
Input: "High fever and severe headache and pain behind eyes"
Expected: severity = "critical", isAlert = true
Alert Display: Should show warning
Status: [PASS/FAIL]
```

---

### 2. Functional Testing

#### Authentication System

**Test Case 2.1: User Signup**
```
Scenario: New user registration
Steps:
  1. Fill signup form with valid data
  2. Click "Create Account"
  3. Verify user profile created
  4. Check user_analytics initialized
Expected: User created, redirected to login
Status: [PASS/FAIL]
```

**Test Case 2.2: Invalid Email**
```
Input: "not-an-email"
Expected: Validation error displayed
Status: [PASS/FAIL]
```

**Test Case 2.3: Weak Password**
```
Input: "123"
Expected: "Password must be at least 6 characters"
Status: [PASS/FAIL]
```

**Test Case 2.4: User Login**
```
Scenario: Existing user logs in
Steps:
  1. Enter email and password
  2. Click "Sign In"
  3. Verify user profile loaded
  4. Check redirect to chat/dashboard
Expected: Successful login, session created
Status: [PASS/FAIL]
```

**Test Case 2.5: Incorrect Password**
```
Input: Correct email, wrong password
Expected: "Invalid login credentials"
Status: [PASS/FAIL]
```

**Test Case 2.6: Non-existent User**
```
Input: Email that doesn't exist
Expected: "User not found"
Status: [PASS/FAIL]
```

#### Chat Interface

**Test Case 2.7: Send Message**
```
Scenario: User sends symptom message
Steps:
  1. Type message in input
  2. Click Send button
  3. Message appears in chat
  4. Bot responds with analysis
Expected: Message sent, response received within 500ms
Status: [PASS/FAIL]
```

**Test Case 2.8: Empty Message**
```
Input: Empty text or whitespace
Expected: Send button disabled, no request sent
Status: [PASS/FAIL]
```

**Test Case 2.9: Response Display**
```
Scenario: Bot response shows correctly
Expected:
  - Bot message displayed
  - Timestamp shown
  - Alert highlight if critical
  - Matched symptoms listed
Status: [PASS/FAIL]
```

**Test Case 2.10: Critical Alert Display**
```
Input: "dengue symptoms"
Expected:
  - Red alert styling
  - "CRITICAL ALERT" label
  - Warning icon
  - Clear action recommendation
Status: [PASS/FAIL]
```

#### Dashboard

**Test Case 2.11: Analytics Display**
```
Scenario: User views dashboard
Expected:
  - Total consultations count
  - Health score displayed
  - Last consultation date
  - Recent consultations list
Status: [PASS/FAIL]
```

**Test Case 2.12: Consultation History**
```
Scenario: View past consultations
Expected:
  - Shows last 5 consultations
  - Displays: symptoms, diagnosis, severity
  - Shows consultation date/time
  - Severity badge color coding
Status: [PASS/FAIL]
```

---

### 3. Integration Testing

#### API Integration

**Test Case 3.1: Full Chat Flow**
```
Steps:
  1. User sends symptom message
  2. Edge function processes request
  3. Database queried for diseases
  4. NLP algorithm runs
  5. Response generated
  6. Consultation recorded
  7. Analytics updated
Expected: Complete flow succeeds
Status: [PASS/FAIL]
```

**Test Case 3.2: User Consultation Persistence**
```
Steps:
  1. Send symptom message
  2. Close browser
  3. Reopen and login
  4. Check dashboard
Expected: Previous consultation visible in history
Status: [PASS/FAIL]
```

#### Database Integration

**Test Case 3.3: Data Insertion**
```
Steps:
  1. Send consultation
  2. Check database for insertion
  3. Verify all fields stored
Expected: consultation_records has new entry
Status: [PASS/FAIL]
```

**Test Case 3.4: Analytics Update**
```
Steps:
  1. Send first consultation
  2. user_analytics total_consultations = 1
  3. Send second consultation
  4. total_consultations = 2
Expected: Analytics increment correctly
Status: [PASS/FAIL]
```

#### Security - RLS Policies

**Test Case 3.5: User Data Isolation**
```
Scenario: User A cannot access User B's data
Steps:
  1. User A logs in
  2. Query user_profiles (own)
  3. Attempt to query User B's profile
Expected: RLS blocks unauthorized access
Status: [PASS/FAIL]
```

**Test Case 3.6: Consultation Privacy**
```
Scenario: User A cannot see User B's consultations
Steps:
  1. User A queries consultation_records
  2. RLS filters to only User A's consultations
Expected: Cannot access other users' data
Status: [PASS/FAIL]
```

---

### 4. Performance Testing

#### Response Time

**Test Case 4.1: Chat Response Time**
```
Metric: Time from message send to bot response
Target: < 500ms
Test: Send 10 messages, measure average
Expected: All responses < 500ms
Status: [PASS/FAIL]
```

**Test Case 4.2: Dashboard Load Time**
```
Metric: Time to render dashboard
Target: < 2 seconds
Test: Load dashboard 5 times
Expected: All loads < 2s
Status: [PASS/FAIL]
```

#### Load Testing

**Test Case 4.3: Concurrent Users**
```
Scenario: Multiple users sending messages simultaneously
Load: 10 concurrent users
Duration: 5 minutes
Expected: All requests succeed, no timeouts
Status: [PASS/FAIL]
```

**Test Case 4.4: Database Query Performance**
```
Metric: Disease lookup query time
Target: < 50ms
Data: 15+ diseases
Expected: Fast retrieval
Status: [PASS/FAIL]
```

---

### 5. Usability Testing

#### User Interface

**Test Case 5.1: Responsive Design**
```
Devices:
  - Desktop (1920x1080)
  - Tablet (768x1024)
  - Mobile (375x667)
Expected: UI adapts correctly on all devices
Status: [PASS/FAIL]
```

**Test Case 5.2: Navigation**
```
Paths:
  - Home → Signup → Chat
  - Home → Login → Dashboard
  - Chat → Dashboard
  - Dashboard → Chat
Expected: All navigation paths work
Status: [PASS/FAIL]
```

**Test Case 5.3: Error Messages**
```
Scenarios:
  - Invalid email format
  - Wrong password
  - Network error
  - Server error
Expected: Clear, actionable error messages
Status: [PASS/FAIL]
```

#### Accessibility

**Test Case 5.4: Keyboard Navigation**
```
Expected: All buttons/inputs accessible via Tab
Status: [PASS/FAIL]
```

**Test Case 5.5: Color Contrast**
```
Expected: Text readable, WCAG AA standard
Status: [PASS/FAIL]
```

---

## Scenario-Based Tests

### Scenario 1: New User Journey

```
1. User visits homepage
   Expected: Landing page displays
   Status: [PASS/FAIL]

2. Click "Get Started"
   Expected: Redirects to signup
   Status: [PASS/FAIL]

3. Fill signup form
   - Full name: John Doe
   - Email: john@example.com
   - Password: SecurePass123
   Expected: Account created
   Status: [PASS/FAIL]

4. Redirected to login
   Expected: Login form displays
   Status: [PASS/FAIL]

5. Sign in with credentials
   Expected: Redirected to chat
   Status: [PASS/FAIL]

6. Send first message: "I have fever and headache"
   Expected: Receives diagnosis (Flu/Dengue)
   Status: [PASS/FAIL]

7. View response
   Expected:
   - Bot message shows
   - Severity indicated
   - Advice provided
   Status: [PASS/FAIL]

8. Click Dashboard
   Expected: Shows 1 consultation
   Status: [PASS/FAIL]

9. Logout
   Expected: Redirected to home
   Session cleared
   Status: [PASS/FAIL]
```

### Scenario 2: Critical Alert Handling

```
1. User sends: "High fever, severe headache, pain behind eyes"
   Expected: System identifies Dengue
   Status: [PASS/FAIL]

2. Response shows critical alert
   Expected:
   - Red background
   - Warning icon
   - "CRITICAL ALERT" label
   Status: [PASS/FAIL]

3. Advice emphasizes urgent action
   Expected:
   - "Seek immediate medical attention"
   - Mentions specialist
   - Recommends follow-up
   Status: [PASS/FAIL]

4. Dashboard shows critical status
   Expected:
   - Severity badge: "critical"
   - Red color coding
   - Alert indicator
   Status: [PASS/FAIL]
```

### Scenario 3: Medical History Tracking

```
1. User Day 1: "I have mild cough"
   Expected: Cold diagnosis, mild severity
   Status: [PASS/FAIL]

2. User Day 3: "Still coughing, now have fever"
   Expected: Identifies as Flu
   Previous consultation visible
   Status: [PASS/FAIL]

3. Dashboard shows pattern
   Expected:
   - 2 consultations total
   - Progression tracked
   - Health score adjusted
   Status: [PASS/FAIL]
```

---

## Test Data

### Disease Test Cases

| Symptom Input | Expected Disease | Severity | Alert |
|---|---|---|---|
| fever, cough, cold | Cold | mild | No |
| high fever, body ache, cough | Flu | moderate | No |
| fever, headache, pain behind eyes | Dengue | critical | Yes |
| recurring fever, chills, sweating | Malaria | critical | Yes |
| frequent urination, thirst | Diabetes | moderate | No |
| severe headache, nausea, light sensitivity | Migraine | moderate | No |
| chest pain, shortness of breath | Hypertension | severe | Yes |
| fever, dry cough, loss of taste | COVID-19 | critical | Yes |

### User Test Cases

| Action | Input | Expected | Status |
|---|---|---|---|
| Signup | john@example.com, Pass123 | Success | [PASS/FAIL] |
| Login | john@example.com, Pass123 | Success | [PASS/FAIL] |
| Wrong Password | john@example.com, WrongPass | Error | [PASS/FAIL] |
| Invalid Email | not-email, Pass123 | Error | [PASS/FAIL] |
| Short Password | john@ex.com, 123 | Error | [PASS/FAIL] |

---

## Test Execution Plan

### Phase 1: Unit Testing (Week 1)
- Algorithm testing
- Component testing
- Utility function testing

### Phase 2: Integration Testing (Week 2)
- API integration
- Database operations
- Authentication flow

### Phase 3: System Testing (Week 3)
- End-to-end scenarios
- Performance testing
- Security validation

### Phase 4: UAT (Week 4)
- User acceptance testing
- Usability feedback
- Final verification

---

## Test Report Template

```
Test Case ID: 2.1
Title: User Signup
Date: 2024-04-08
Tester: [Name]
Status: [PASS/FAIL]
Notes: [Details]
```

---

## Acceptance Criteria

### Must Pass:
- All authentication tests
- All critical security tests
- Core chat functionality
- Database operations
- Response time < 500ms

### Should Pass:
- All UI tests
- All integration tests
- Performance tests
- Accessibility tests

### Nice to Have:
- Load testing
- Stress testing
- Extended scenarios

---

## Known Issues & Limitations

1. **Typo Tolerance**
   - Limited to Levenshtein distance > 0.6
   - May miss very different spellings

2. **Multi-language**
   - Currently English-only
   - Non-English symptoms may not match

3. **Contextual Understanding**
   - Simple keyword matching
   - Limited context awareness
   - No conversation history consideration

4. **Rare Diseases**
   - Database limited to common diseases
   - Rare conditions may not be identified

---

## Continuous Testing

- Automated tests on each deployment
- Regular security audits
- Performance monitoring
- User feedback collection
- Bug tracking system

---

## Conclusion

This comprehensive testing strategy ensures HealthAI is reliable, secure, and user-friendly. Regular testing and validation maintain high quality standards.
