# HealthAI System Architecture Document

## Executive Summary

HealthAI is a full-stack AI healthcare assistant application built with modern web technologies. It combines advanced symptom matching algorithms with secure user authentication and health tracking capabilities.

---

## System Components

### 1. Frontend Layer

**Technology**: React 18 + TypeScript + Vite

**Components:**
- **HomePage**: Landing page with feature showcase and call-to-action
- **LoginPage**: Secure user authentication
- **SignupPage**: User registration with profile creation
- **ChatPage**: Main interactive interface for symptom consultation
- **DashboardPage**: Personal health analytics and history

**Key Features:**
- Responsive design (mobile, tablet, desktop)
- Real-time message updates
- Alert notifications for critical conditions
- Smooth animations and transitions
- Protected routes for authenticated users

### 2. Authentication & Authorization

**System**: Supabase Auth (Email/Password)

**Flow:**
```
User Sign Up
  ├── Create Supabase Auth User
  ├── Create user_profiles record
  └── Initialize user_analytics record

User Sign In
  ├── Authenticate with Supabase
  ├── Fetch user profile
  └── Set session in AuthContext

Protected Routes
  ├── Check authentication state
  ├── Redirect if not authenticated
  └── Load user data
```

**Security Measures:**
- JWT-based session management
- Secure password hashing
- Row-level security on all tables
- User data isolation

### 3. Backend Layer

**Technology**: Supabase Edge Functions (Deno)

**Edge Function: `/functions/v1/chat`**

**Purpose**: Process user messages and generate AI responses

**Workflow:**
```
Request
  ├── Validate input
  ├── Detect greeting
  ├── Fetch diseases database
  ├── Run matching algorithm
  ├── Determine severity
  ├── Record consultation
  ├── Update analytics
  └── Return response
```

**Functions:**
1. `calculateSimilarity()`: String similarity using edit distance
2. `findDiseaseMatches()`: Multi-level disease matching
3. `determineSeverity()`: Classify condition severity

### 4. Database Layer

**Technology**: PostgreSQL (Supabase)

**Schema Overview:**

```
┌─────────────────────────────────────────────────────┐
│                   DISEASES TABLE                     │
├─────────────────────────────────────────────────────┤
│ id (uuid)                                            │
│ name (text)                                          │
│ symptoms (text[])                                    │
│ advice (text)                                        │
│ is_critical (boolean)                               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               USER_PROFILES TABLE                    │
├─────────────────────────────────────────────────────┤
│ id (uuid) - references auth.users                    │
│ full_name (text)                                     │
│ age (integer)                                        │
│ gender (text)                                        │
│ blood_type (text)                                    │
│ medical_conditions (text[])                          │
│ allergies (text[])                                   │
│ medications (text[])                                 │
│ emergency_contact (text)                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│          CONSULTATION_RECORDS TABLE                  │
├─────────────────────────────────────────────────────┤
│ id (uuid)                                            │
│ user_id (uuid) - references auth.users              │
│ symptoms (text)                                      │
│ diagnosis (text)                                     │
│ severity_level (text)                                │
│ recommended_action (text)                            │
│ specialist_recommended (text)                        │
│ follow_up_required (boolean)                         │
│ notes (text)                                         │
│ created_at (timestamptz)                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              USER_ANALYTICS TABLE                    │
├─────────────────────────────────────────────────────┤
│ id (uuid)                                            │
│ user_id (uuid) - references auth.users              │
│ total_consultations (integer)                        │
│ most_common_symptom (text)                           │
│ last_consultation_date (timestamptz)                 │
│ health_score (integer 0-100)                         │
│ updated_at (timestamptz)                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               CHAT_HISTORY TABLE                     │
├─────────────────────────────────────────────────────┤
│ id (uuid)                                            │
│ user_message (text)                                  │
│ bot_response (text)                                  │
│ disease_matched (text)                               │
│ is_alert (boolean)                                   │
│ created_at (timestamptz)                             │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### User Registration Flow

```
┌─────────────┐
│   SignUp    │
│   Page      │
└──────┬──────┘
       │ (fullName, email, password)
       ▼
┌──────────────────────────┐
│ AuthContext.signUp()     │
│ - Validate inputs        │
│ - Create auth user       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Supabase Auth            │
│ - Create user account    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Create user_profiles     │
│ - Store basic info       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Create user_analytics    │
│ - Initialize metrics     │
└──────┬───────────────────┘
       │
       ▼
┌──────────────┐
│ Navigate to  │
│ Login        │
└──────────────┘
```

### Symptom Analysis Flow

```
┌─────────────────┐
│  User Input     │
│ "fever, ache"   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ ChatPage.sendMessage()      │
│ - Create user message       │
│ - Add to chat               │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Edge Function /chat         │
│ - Receive message           │
│ - Validate input            │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ NLP Processing              │
│ - Text normalization        │
│ - Keyword extraction        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Disease Matching            │
│ - Calculate similarity      │
│ - Rank diseases             │
│ - Select best match         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Generate Response           │
│ - Format advice             │
│ - Add alternatives          │
│ - Determine severity        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Record Consultation         │
│ - Save to database          │
│ - Update analytics          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Return Response             │
│ {response, isAlert, disease}│
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Display Response            │
│ - Show bot message          │
│ - Highlight if alert        │
│ - Scroll to bottom          │
└─────────────────────────────┘
```

---

## NLP Algorithm Architecture

### Matching Algorithm Pipeline

```
Input Message
    │
    ▼
Step 1: Text Preprocessing
├── Convert to lowercase
├── Trim whitespace
└── Tokenize words

    │
    ▼
Step 2: Greeting Detection
├── Check common greetings
└── Return early if matched

    │
    ▼
Step 3: Fetch Disease Database
└── Get all diseases and symptoms

    │
    ▼
Step 4: Multi-Level Matching
├── Exact Keyword Matching
│   └── Direct symptom name match
├── Similarity Scoring (Levenshtein)
│   ├── Calculate edit distance
│   └── Apply 60% threshold
├── Disease Name Matching
│   └── Direct disease name reference
└── Aggregate Scores

    │
    ▼
Step 5: Rank and Filter
├── Sort by match score
├── Select best match
└── Get alternatives

    │
    ▼
Step 6: Severity Classification
├── Check is_critical flag
├── Analyze disease severity
└── Assign level (mild/moderate/severe/critical)

    │
    ▼
Step 7: Response Generation
├── Format medical advice
├── List matched symptoms
├── Add alternatives
└── Include severity warning

    │
    ▼
Output: {response, isAlert, disease, severity, matchedSymptoms}
```

### Similarity Calculation (Levenshtein Distance)

```python
def calculateSimilarity(input, target):
    # Edit distance between strings
    distance = levenshteinDistance(input, target)
    # Convert to similarity (0-1)
    return (max_length - distance) / max_length

# Scoring
if similarity > 0.6:
    matchScore += similarity
else if exact_match:
    matchScore += 1.0
else if substring_match:
    matchScore += 0.8
```

---

## Security Architecture

### Authentication Model

```
User Credentials
    │
    ▼
Supabase Auth
├── Hash password (bcrypt)
├── Store securely
└── Issue JWT

    │
    ▼
Session Management
├── Store JWT in secure cookie
├── Validate on each request
└── Auto-refresh on expiry

    │
    ▼
Protected Routes
├── Check authentication state
├── Verify JWT
└── Allow/deny access
```

### Data Access Control (RLS)

```
Row Level Security Policies

users table:
  - User can SELECT own profile
  - User can UPDATE own profile
  - User can INSERT own profile

consultations:
  - User can SELECT own consultations
  - User can INSERT own consultations
  - Cannot DELETE (audit trail)

analytics:
  - User can SELECT own analytics
  - System can UPDATE own analytics
  - Cannot DELETE (history)

chat_history:
  - Anyone can INSERT (anonymous chat)
  - Anyone can SELECT (conversation logging)
```

---

## Deployment Architecture

### Development Environment

```
Local Development
├── React Dev Server (Vite)
├── Supabase Local (optional)
└── .env (local credentials)
```

### Production Environment

```
Frontend
├── Build: npm run build
├── Output: dist/ directory
├── Deployment: Vercel/Netlify/Static Hosting
└── Environment: Production Supabase

Backend
├── Edge Functions: Supabase Deployment
├── Database: Production PostgreSQL
└── Environment Variables: Securely stored
```

---

## Performance Optimization

### Database Queries

```sql
-- Indexed columns for fast lookup
CREATE INDEX idx_diseases_name ON diseases(name);
CREATE INDEX idx_consultations_user ON consultation_records(user_id);
CREATE INDEX idx_analytics_user ON user_analytics(user_id);
```

### Caching Strategy

```
Frontend Caching:
├── Disease list: Cache in memory after first fetch
├── User profile: Cache after login
└── Analytics: Update on each consultation

Backend Caching:
├── Disease database: Fetch once per request
└── User data: Fetch only when needed
```

### API Response Time

```
Target: < 500ms per request

Breakdown:
├── Input validation: 10ms
├── Database query: 50ms
├── NLP processing: 200ms
├── Response generation: 50ms
├── Database insert: 150ms
└── Total: ~460ms
```

---

## Error Handling & Recovery

### Frontend Error Handling

```
User Action
    │
    ▼
Try Block
├── Execute request
├── Validate response
└── Update UI

    │
    ▼
Catch Block
├── Log error
├── Show user-friendly message
└── Suggest recovery action
```

### Backend Error Handling

```
Edge Function Request
    │
    ▼
Request Validation
├── Check input format
└── Verify required fields

    │
    ▼
Processing
├── Try NLP operation
├── Try database operation
└── Handle errors gracefully

    │
    ▼
Response
├── Success: Return result
└── Error: Return error message with status code
```

---

## Scalability Considerations

### Current Capacity

```
Users: 1,000-10,000 concurrent
Requests: 10,000-100,000 per day
Storage: ~100MB for all data
Response Time: <500ms
```

### Scaling Strategy

1. **Database**
   - Enable read replicas for analytics queries
   - Implement caching layer (Redis)
   - Use connection pooling

2. **Backend**
   - Horizontal scaling of Edge Functions
   - Load balancing
   - Cache disease database

3. **Frontend**
   - CDN for static assets
   - Lazy loading components
   - Optimize bundle size

---

## Testing Strategy

### Unit Testing

```
Components:
├── ChatMessage component
├── ChatInput component
└── Message formatting

Utilities:
├── Similarity calculation
├── Disease matching
└── Severity determination
```

### Integration Testing

```
API Tests:
├── Test /chat endpoint
├── Test with various inputs
└── Verify response format

Database Tests:
├── Test RLS policies
├── Test data integrity
└── Test constraint validation

Auth Tests:
├── Test signup flow
├── Test login flow
└── Test session management
```

### End-to-End Testing

```
User Journeys:
├── New user signup & consultation
├── Returning user login & chat
├── Dashboard analytics view
└── Critical alert handling
```

---

## Monitoring & Logging

### Application Monitoring

```
Metrics to Track:
├── Response times
├── Error rates
├── User engagement
├── Disease match accuracy
└── System health
```

### Logging

```
Levels:
├── ERROR: Critical failures
├── WARN: Potential issues
├── INFO: Major events
└── DEBUG: Detailed information

What to Log:
├── API requests/responses
├── Database operations
├── Authentication events
├── Algorithm decisions
└── Error stack traces
```

---

## Future Architecture Improvements

1. **Machine Learning Integration**
   - Train custom NLP model
   - Improve symptom matching
   - Personalized recommendations

2. **Real-time Features**
   - WebSocket for live updates
   - Notification system
   - Live health monitoring

3. **Advanced Analytics**
   - Predictive models
   - Disease trend analysis
   - Epidemiological tracking

4. **Microservices**
   - Separate API services
   - Async processing
   - Event-driven architecture

5. **External Integrations**
   - Hospital systems
   - Pharmacy APIs
   - Insurance providers
   - Lab services

---

## Conclusion

HealthAI demonstrates a complete modern web application stack with:
- Secure authentication and authorization
- Intelligent data processing
- User-friendly interface
- Scalable architecture
- Production-ready code

This architecture is designed to be maintainable, secure, and scalable for future enhancements.
