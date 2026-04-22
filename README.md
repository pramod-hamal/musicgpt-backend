# Running the Project with Docker

Follow the steps below to run the project using Docker.

## 1. Navigate to Project Directory

```bash
cd musicgpt-backend
```

## 2. Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with the required configuration before proceeding.

## 3. Start Docker Services

Build and start all services in detached mode:

```bash
docker compose up -d
```

## 4. Access the Application

The server will be available at:

http://localhost:6001

## Stopping the Services

To stop all running containers:

```bash
docker compose down
```

## Rebuilding Containers

If you make changes to dependencies or Docker configuration, rebuild the containers:

```bash
docker compose up -d --build
```

---

## Running Locally

Follow these steps to run the project without Docker.

### 1. Navigate to Project Directory

```bash
cd musicgpt-backend
```

### 2. Ensure Dependencies Are Running

Make sure the following services are up and accessible:

- PostgreSQL
- Redis

Update your `.env` file with the correct connection details.

### 3. Generate Prisma Client

```bash
pnpm run generate
```

### 4. Run Database Migrations

```bash
pnpm run migrate
```

### 5. Start Development Server

```bash
pnpm run dev
```

The server will start on the configured port (default: http://localhost:6001).

---

## Notes

- Ensure Docker and Docker Compose are installed and running.
- Configuration values can be adjusted in the `.env` file.

---

## Environment Variables

You can quickly set up environment variables by copying the example file:

```bash
cp .env.example .env
```

The `.env.example` file already contains a working configuration. Update values as needed for your setup.

### Reference Configuration

```env
PORT=6001

# Docker environment variables for PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=musicgpt

# PRISMA
DATABASE_URL="postgresql://admin:admin@postgres:5432/musicgpt?schema=public"
# DATABASE_URL="postgresql://admin:admin@localhost:5432/musicgpt?schema=public"

# JWT
JWT_SECRET=UPX4Q6BEekop0rfogvpcZ0L0
JWT_REFRESH_SECRET=AEX4Q6BEekop0rfogvpier987
JWT_EXPIRES_IN=900 # 15 minutes in seconds
JWT_REFRESH_EXPIRES_IN=604800 # 7 days in seconds

# Throttle
DEFAULT_RATE_LIMIT=10
PAID_USER_RATE_LIMIT=1000
THROTTLE_BLOCK_DURATION_MS=60000 # 1 minute in milliseconds

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Authentication Flow

### Overview

The authentication system uses a combination of short-lived access tokens and longer-lived sessions stored in the database. A Redis-based blacklist is used to handle logout and token invalidation.

### Flow

1. **User Login**
   - The user logs in with valid credentials.

2. **Session Creation**
   - A session is created in the backend and stored in the database.
   - The session includes a refresh token with an expiry of approximately 7 days.

3. **Access Token Issuance**
   - An access token is generated with a short expiry (10–15 minutes).
   - The token includes a unique identifier (`jti`).

4. **Session ID in Cookie**
   - The `sessionId` (UUID) is sent to the frontend via HTTP-only cookies.

5. **Access Token in Response**
   - The access token is returned in the response body.

6. **Authenticated Requests**
   - The frontend sends:
     - Access token in the `Authorization` header (`Bearer <token>`)
     - Session ID automatically via cookies

7. **Validation on Request**
   - Backend validates:
     - Access token (valid or expired)
     - Presence of `sessionId`

8. **Unauthorized Handling**
   - If either the access token or session ID is missing, an unauthorized error is returned.

9. **Token Refresh Flow**
   - If the access token is expired but the session is still valid (not expired or revoked):
     - Frontend calls the refresh token API
     - `sessionId` is automatically included via cookies
     - A new access token is issued

10. **Logout Handling**
    - On logout:
      - The session is revoked in the database
      - The `sessionId` is added to a Redis blacklist
      - Blacklist expiry is set to 15–20 minutes (longer than access token expiry)

11. **Blacklist Validation**
    - On every request:
      - Backend checks if `sessionId` exists in Redis blacklist
      - If present:
        - Access is denied
        - Refresh token is not allowed
        - All authenticated routes are blocked

---

### Notes

- Access tokens are stateless and short-lived for security.
- Sessions act as a source of truth for refresh operations.
- Redis blacklist ensures immediate invalidation after logout.
- Cookie-based session handling improves security (HTTP-only, not accessible via JavaScript).

---

## Token Rotation and Invalidation Strategy

### Overview

The system uses a session-based authentication model with short-lived access tokens and longer-lived refresh sessions. Token invalidation is primarily handled through session revocation and a Redis-based blacklist to ensure immediate enforcement.

---

### Current Implementation

#### 1. Logout-Based Invalidation

- When a user logs out:
  - The corresponding session (refresh token) is revoked in the database.
  - The `sessionId` (used as the refresh token identifier) is added to a Redis blacklist.
  - The blacklist entry is set with an expiry slightly longer than the access token lifetime (typically 15–20 minutes).

- Effect:
  - All access tokens associated with that session become unusable.
  - Refresh operations are blocked.
  - Any further authenticated requests using that session are denied.

#### 2. Blacklist Validation

- On every authenticated request:
  - The backend checks whether the `sessionId` exists in the Redis blacklist.
  - If present:
    - The request is rejected as unauthorized.
    - Token refresh is not allowed.
    - All protected routes are blocked for that session.

---

### Token Lifecycle

- **Access Token**
  - Short-lived (10–15 minutes)
  - Stateless JWT
  - Contains a unique identifier (`jti`)

- **Session / Refresh Token**
  - Long-lived (~7 days)
  - Stored in the database
  - Identified via `sessionId` (UUID stored in cookies)

---

### Design Considerations

- Short-lived access tokens reduce the impact of token leakage.
- Session-based control allows server-side invalidation.
- Redis blacklist provides immediate revocation without waiting for token expiry.
- Blacklist TTL is aligned to outlive access tokens to ensure full invalidation coverage.

---

### Planned / Future Enhancements

#### 1. Admin-Initiated Session Revocation

- A dedicated API can be introduced to allow administrators to:
  - Revoke active sessions for a user
  - Force logout across devices

- Status: Not implemented (time constraint)

#### 2. Access Token (JTI) Blacklisting

- Each access token includes a `jti` (unique identifier).
- This can be used to:
  - Blacklist specific access tokens without revoking the entire session
  - Provide fine-grained control (e.g., suspicious activity handling)

- Status: Not implemented (time constraint)

---

### Limitations (Current State)

- Access tokens cannot be individually invalidated (only session-level invalidation is active).
- Admin-level session control is not yet available.

---

### Summary

The current approach ensures:

- Immediate session invalidation on logout
- Protection against reuse of revoked sessions
- Controlled token lifecycle using short-lived access tokens

Future improvements can enhance granularity and administrative control over active sessions and tokens.

---

## Job Queue Processing Flow and Cron

### Overview

The system processes user prompts asynchronously using a priority-based job queue. A scheduled cron job periodically scans for pending tasks, enqueues them, and workers process them based on priority. This ensures fair usage while giving preference to paid users.

---

### Priority Model

- Each prompt is assigned a priority at creation:
  - **Paid Users** → Priority `1`
  - **Free Users** → Priority `5`

- Lower numeric value indicates higher priority.

---

### Processing Flow

#### 1. Prompt ստեղծion

- When a prompt is submitted:
  - Its initial state is set to `PENDING`.
  - A priority is assigned based on user type.

#### 2. Cron Scheduler

- A cron job runs every **5 seconds**.
- Location:
  ```
  src/frameworks/scheduler/scheduler.service.ts
  ```
- Responsibility:
  - Fetch prompts with `PENDING` status from the database.

#### 3. Queue Insertion

- The cron job:
  - Pushes pending prompts into the job queue.
  - Ensures jobs are added with their assigned priority.
  - Updates prompt status from `PENDING` → `PROCESSING`.

#### 4. Job Processing

- A queue processor (worker):
  - Listens for incoming jobs.
  - Picks jobs based on priority (higher priority first).
  - Executes the required processing logic for the prompt.

#### 5. Completion

- After successful processing:
  - An audio record is created (output of the job).
  - Prompt status is updated to `COMPLETED`.

---

### State Transitions

```
PENDING → PROCESSING → COMPLETED
```

---

### Notes

- The cron-based polling ensures decoupling between request handling and job execution.
- Priority queuing guarantees better service for paid users without starving free users.
- The 5-second interval provides a balance between responsiveness and system load.
- Failure handling, retries, and dead-letter queues can be added for improved reliability (not covered in current implementation).

---

## Subscription Perks Logic

### Overview

The system differentiates between paid and free users by assigning priority levels to their prompt processing jobs. This ensures that paid users receive faster processing while maintaining access for free users.

---

### Priority Assignment

- **Paid Users**
  - Assigned priority: `1`
  - Higher execution priority in the job queue

- **Free Users**
  - Assigned priority: `5`
  - Lower execution priority compared to paid users

> Note: Lower numeric value indicates higher priority.

---

### Execution Behavior

- Jobs are processed by the queue in order of priority.
- Prompts from paid users are picked and processed before those from free users when both are in the queue.
- Free users are still served, but may experience delays during high load.

---

### Design Considerations

- Ensures better performance and reduced wait times for paid users.
- Maintains fairness by still allowing free users to access the system.
- Simple priority-based model keeps implementation straightforward and scalable.

---

### Summary

The priority-based queue system provides a clear and effective differentiation between paid and free users, improving the overall experience for subscribed users without blocking access for others.

---

## Unified Search Ranking Logic

### Overview

The current search implementation behaves as a **parallel search system**, where multiple resource types are queried independently and returned in a combined response structure. It does not yet implement true unified ranking across different entities.

---

### Current Response Structure

The API returns results grouped by entity type:

```json
{
  "users": {
    "data": [...],
    "meta": {
      "next_cursor": "cursor_id"
    }
  },
  "audio": {
    "data": [...],
    "meta": {
      "next_cursor": "cursor_id"
    }
  }
}
```

---

### Observations

- Each entity type (`users`, `audio`, etc.) has its own:
  - Data set
  - Pagination cursor (`next_cursor`)

- This indicates:
  - Independent queries per entity
  - No global ranking across all results
  - No merged or unified result ordering

---

### Current Implementation

- The system currently performs **parallel search execution**.
- Each entity type is queried separately.
- Results are returned as-is without cross-entity ranking.

#### Query Strategy

- Uses Prisma `ilike` (case-insensitive matching)
- Basic substring matching on fields
- No advanced ranking or scoring logic is applied

---

### Limitations

- No unified ranking across `users`, `audio`, etc.
- Results are not ordered by relevance globally
- Cursor pagination is isolated per entity type
- Search relevance is basic and keyword-based only

---

### Considered Approach (Not Implemented)

A more advanced ranking system was considered using PostgreSQL full-text search:

- Using `pg_trgm` (trigram similarity extension)
- Splitting text into 3-character or word-based segments
- Matching query terms against indexed text
- Generating a relevance score per result
- Sorting results based on score

This approach was not implemented due to time constraints.

---

### Future Direction

A proper unified search system could include:

- Global ranking across all entity types
- Relevance scoring using:
  - `pg_trgm` similarity
  - Full-text search vectors
- Single combined result set instead of separated groups
- Unified cursor strategy (or cursor per type with merged ordering layer)

---

### Summary

The current system is a **parallel search implementation** with basic substring matching. While functional, it does not yet provide unified ranking or relevance scoring across different data types. The next evolution would involve introducing a scoring-based search layer using PostgreSQL full-text capabilities or a dedicated search engine.

````


---
## Rate Limit Logic

### Overview

The system implements a per-user rate limiting mechanism using a combination of in-memory caching (Redis via cache service) and a sliding time window approach. Rate limits differ based on user subscription status.

The logic is enforced through a NestJS `ThrottleGuard` and a service layer `ThrottleUsecaseService`.

---

## Architecture

### 1. Throttle Guard (Request Layer)

The `ThrottleGuard` acts as the entry point for rate limiting on protected routes.

Responsibilities:
- Retrieves the authenticated user from request context
- Calls the throttle service to check rate limit status
- Blocks request if limit is exceeded

Behavior:

- If user is missing → `401 Unauthorized`
- If rate limited → `429 Too Many Requests`
- Otherwise → request continues

---

### 2. Throttle Service (Business Logic Layer)

The `ThrottleUsecaseService` handles all rate limit calculations and state management.

---

## Rate Limit Rules

### Request Limits

- **Free Users**
  - Default limit: `10 requests per minute`

- **Paid Users**
  - Higher limit: `100 requests per minute`

> These values are configurable via environment variables:
```env
DEFAULT_RATE_LIMIT=10
PAID_USER_RATE_LIMIT=1000
````

---

## Time Window Logic

- Time window: **60 seconds (1 minute)**
- Each user has an independent tracking window

---

## State Stored in Cache

Each user has a throttle state stored in cache (Redis):

```ts
interface ThrottleState {
  requestCount: number;
  lastRequestAt: number;
  blockedUntil?: number;
}
```

---

## Execution Flow

### 1. First Request

- If no throttle state exists:
  - Create a new record
  - Set request count = 1
  - Allow request

---

### 2. Within Time Window

- If request is within 60 seconds:
  - Increment request count
  - Check against limit

---

### 3. Exceeding Limit

If request count exceeds limit:

- User is blocked
- `blockedUntil` is set:
  ```
  current_time + block_duration
  ```
- Block duration is configurable:

```env
THROTTLE_BLOCK_DURATION_MS=60000
```

- User receives:

```
429 Too Many Requests
```

---

### 4. Block Enforcement

- If `blockedUntil` exists and current time is still within block period:
  - All requests are rejected immediately

---

### 5. Window Reset

- If 60 seconds have passed since `lastRequestAt`:
  - Counter resets
  - New window starts

---

## Key Behaviors

- Each user is rate limited independently
- Paid users receive significantly higher limits
- Temporary blocking is applied after exceeding limits
- Cache (Redis) is used to persist state across requests

---

## Design Highlights

- Sliding window approach (not strict fixed window)
- Fast rejection using cache lookup
- Subscription-aware throttling
- Temporary block mechanism prevents abuse bursts

---

## Limitations (Current Implementation)

- No distributed token bucket or leaky bucket algorithm
- No global rate limiting (only per-user)
- No IP-based fallback throttling
- Block duration is fixed per configuration, not adaptive

---

## Summary

This rate limiting system provides a lightweight, subscription-aware throttling mechanism using Redis-backed state tracking. It ensures fair usage for free users while prioritizing higher throughput for paid users, with temporary blocking to handle abuse scenarios.

````

# Summary of Architecture

## Overview

**MusicGPT Backend** is a NestJS-based REST API for AI-powered music generation. It follows a clean layered architecture with strict separation of concerns:

- Controllers (HTTP layer)
- Use Cases (business logic)
- Repositories (data access)
- Framework adapters (external systems)

It uses:
- PostgreSQL (Prisma) for persistence
- Redis for caching, rate limiting, and blacklisting
- BullMQ for async job processing
- Socket.io for real-time updates

---

## High-Level Architecture
```mermaid
flowchart TD

A[HTTP Requests<br/>(Port 6001)] --> B[NestJS Application Layer]

B --> C[Controllers]
B --> D[Use Cases]
B --> E[Guards & Interceptors]

C --> F[Core Layer<br/>Domain + Repository Abstractions]
D --> F
E --> F

F --> G[PostgreSQL<br/>(Prisma)]
F --> H[Redis]
F --> I[BullMQ Queue]
````

---

## Layered Architecture

### 1. Controllers

- Handle HTTP requests
- Validate DTOs
- Call use-case services
- Return standardized responses

### 2. Use Cases (Business Layer)

- Contain all application logic
- Orchestrate repositories and external services
- No direct HTTP or database coupling

### 3. Repositories (Data Layer)

- Abstract data access logic
- Implemented using Prisma and Redis
- Support Unit of Work pattern for transactions

### 4. Framework Layer

Handles external systems:

- Prisma (PostgreSQL ORM)
- Redis (cache, blacklist, rate limiting)
- BullMQ (job queue)
- Socket.io (WebSocket communication)

### 5. Core Layer

- Domain models (User, Prompt, Audio, etc.)
- Abstract interfaces (repositories, cache, queue)
- Keeps business logic framework-agnostic

---

## Key Design Patterns

### Repository Pattern

- Abstract interfaces in `core/abstracts`
- Implementations in `frameworks/data-service`
- Enables database flexibility

### Unit of Work

- Ensures transactional consistency via Prisma
- Coordinates multiple repository operations

### Dependency Injection

- NestJS module-based DI system
- Clean separation of implementations and contracts

### Guards & Interceptors

- Auth Guard → JWT + session validation
- Throttle Guard → rate limiting
- Response Interceptor → standard response format
- Logging Interceptor → request/response logging

---

## Authentication Flow

- User logs in
- Session created in DB (valid ~7 days)
- Access token generated (10–15 min expiry, includes `jti`)
- `sessionId` stored in HTTP-only cookies
- Access token returned in response

On every request:

- Validate access token + sessionId
- Check Redis blacklist
- Reject if invalid or revoked

Logout:

- Session revoked
- sessionId added to Redis blacklist (TTL > access token expiry)

---

## Prompt Processing Flow

```
User submits prompt
        ↓
Status = PENDING + priority assigned
        ↓
Cron (every 5s) fetches pending prompts
        ↓
Push to BullMQ queue (priority-based)
        ↓
Worker processes job
        ↓
Generate audio
        ↓
Save Audio record
        ↓
Status = COMPLETED
```

Priority:

- Paid user → 1
- Free user → 5

---

## Rate Limiting

Implemented using Redis-backed sliding window.

### Limits

- Free users: 10 requests/min
- Paid users: 1000 requests/min

### Behavior

- Track request count per user in Redis
- Block user if limit exceeded
- Temporary block duration: 60 seconds

---

## Token Invalidation Strategy

### Current Approach

On logout:

- Session is revoked in DB
- sessionId added to Redis blacklist
- TTL set slightly higher than access token expiry

Result:

- All session tokens are invalidated immediately

### Validation

- Every request checks Redis blacklist
- If sessionId exists → request denied

---

## Search System

Currently implemented as **parallel search**, not unified search.

Response structure:

- Separate results per entity (users, audio)
- Each has independent pagination cursor

Example:

```json
{
  "users": { "data": [], "meta": { "next_cursor": "..." } },
  "audio": { "data": [], "meta": { "next_cursor": "..." } }
}
```

### Current State

- Prisma `ILIKE` based search
- No ranking or scoring system
- No cross-entity ordering

### Future Idea (not implemented)

- PostgreSQL `pg_trgm` similarity
- Unified ranking layer across entities
- Relevance scoring system

---

## Job Queue System

- Built using BullMQ
- Cron runs every 5 seconds:
  - Fetch pending prompts
  - Enqueue jobs based on priority
  - Mark as PROCESSING
- Worker processes jobs asynchronously
- Output stored as Audio entity

---

## WebSocket System

- Socket.io used for real-time updates
- Redis adapter enables multi-instance scaling
- Used to notify client when audio generation completes

---

## Data Storage

### PostgreSQL (Prisma)

- Users
- Sessions (refresh tokens)
- Prompts
- Audio records

### Redis

- Session blacklist
- Rate limiting counters
- Cache layer

### BullMQ

- Audio generation jobs
- Priority-based processing

---

## Cross-Cutting Concerns

### Logging

- Structured logs (Winston)
- HTTP request logging via interceptor

### Error Handling

- Global exception filter
- Custom application exceptions
- Prisma error transformation

### Response Format

Standard API response wrapper:

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

---

## Scalability

- Stateless API design
- Redis-backed distributed systems
- BullMQ workers for horizontal scaling
- WebSocket Redis adapter for multi-instance support

---

## Future Improvements

- Admin session revocation API
- Per-token (JTI) blacklisting
- Unified search ranking system
- Event-driven architecture (replace cron)
- Dead-letter queue for failed jobs

---

## Summary

The system is designed with clean architecture principles:

- Clear separation of layers
- Framework independence in core logic
- Scalable async processing pipeline
- Strong focus on authentication, rate limiting, and job processing

It is optimized for:

- AI workload processing
- High concurrency
- Horizontal scaling

```

```
