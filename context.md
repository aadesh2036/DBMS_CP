# Project Context Document

## 1. Project Identity
- Project Title: Social Media User Behavior Analysis System
- Domain: Database Management Systems (DBMS), Full-Stack Web Application
- Primary Goal: Analyze social media behavior using a normalized relational database and present insights in a modern dashboard.
- Repository: DBMS_CP
- Main Branch: main

## 2. Problem Statement
Social media platforms generate large volumes of interaction data (users, posts, comments, likes, and follows). The project solves three practical problems:
- Designing a clean relational schema that avoids data redundancy.
- Implementing API endpoints to ingest and query social interaction data.
- Presenting analytics in an understandable dashboard for quick interpretation.

## 3. Objectives
- Build a normalized (3NF) MySQL schema for core social entities.
- Implement REST APIs with Node.js and Express.
- Provide analytics endpoints for user growth and engagement metrics.
- Seed realistic large sample data for demonstration and testing.
- Build a React dashboard with multiple visual elements and user report cards.

## 4. Tech Stack
- Backend: Node.js, Express, mysql2, dotenv, cors
- Frontend: React (Vite), Axios
- Database: MySQL 8.x
- Dev Tools: nodemon, npm scripts, PowerShell automation
- UI MCP Integration: Magic UI MCP configured in VS Code workspace

## 5. High-Level Architecture
### 5.1 Backend Layer
- Entry point initializes Express server, middleware, and routes.
- Route groups:
  - /users
  - /posts
  - / (interactions + simulation)
  - /analytics
- Models execute SQL queries via mysql2 connection pool.

### 5.2 Database Layer
- Relational schema with 5 core tables:
  - users
  - posts
  - comments
  - likes
  - followers
- Enforced integrity via primary keys, foreign keys, unique constraints, and a check constraint.

### 5.3 Frontend Layer
- Single-page dashboard using React.
- Pulls data from backend APIs.
- Renders KPIs, ranking bars, engagement visuals, and a searchable user report card grid.

## 6. Database Design and Normalization
### 6.1 Normal Form Target
- Third Normal Form (3NF)
- Strategy:
  - Atomic values (1NF)
  - Full dependency on primary keys (2NF)
  - No transitive dependencies via derived analytics at query time (3NF)

### 6.2 Tables and Key Columns
#### users
- user_id (PK)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- full_name
- bio
- profile_picture_url
- created_at
- last_login

#### posts
- post_id (PK)
- user_id (FK -> users.user_id)
- content
- image_url
- created_at
- updated_at

#### comments
- comment_id (PK)
- post_id (FK -> posts.post_id)
- user_id (FK -> users.user_id)
- content
- created_at
- updated_at

#### likes
- like_id (PK)
- post_id (FK -> posts.post_id)
- user_id (FK -> users.user_id)
- created_at
- UNIQUE(user_id, post_id)

#### followers
- follower_id (PK)
- follower_user_id (FK -> users.user_id)
- followed_user_id (FK -> users.user_id)
- created_at
- UNIQUE(follower_user_id, followed_user_id)
- CHECK(follower_user_id <> followed_user_id)

### 6.3 Relationship Mapping
- users 1:N posts
- users 1:N comments
- users M:N posts via likes
- users M:N users via followers (self-referential)

### 6.4 Derived Metrics (Not Stored)
- follower_count
- post_count
- like_count
- comment_count
- engagement = like_count + comment_count

## 7. API Surface
### 7.1 Health
- GET /

### 7.2 Users
- GET /users
- GET /users/:id

### 7.3 Posts
- GET /posts
- GET /posts/:id
- POST /posts

### 7.4 Interactions
- POST /like
- POST /comment
- POST /follow

### 7.5 Analytics
- GET /analytics/top-users
- GET /analytics/top-posts
- GET /analytics/engagement
- GET /analytics/user-activity

### 7.6 Simulation
- POST /simulate-data

## 8. Analytics Logic Summary
### 8.1 Top Users by Followers
- Left join users with followers on followed_user_id.
- Group by user and count follower rows.

### 8.2 Top Posts by Likes
- Join posts and users.
- Left join likes.
- Group by post and count likes.

### 8.3 Engagement Feed
- Compute per-post like_count and comment_count with grouped subqueries.
- Engagement is computed as likes + comments.

### 8.4 User Activity
- Left join users and posts.
- Group by user and count posts.

## 9. Frontend Dashboard Details
### 9.1 Data Sources
Dashboard loads all of the following in parallel:
- /analytics/top-users
- /analytics/top-posts
- /analytics/engagement
- /analytics/user-activity
- /users

### 9.2 Visual Components
- KPI Row:
  - Total Users
  - Total Posts
  - Total Interactions
  - Avg Engagement/Post
- Interaction Mix Donut:
  - Like share vs comment share
- Top Users by Followers (bar list)
- Top Posts by Likes (bar list)
- Engagement Highlights (card grid)
- Posts per User (bar list)
- User Reports Card View:
  - Searchable by username/full name
  - Shows posts, follower count, bio, and last-login status
  - Progressive "Load More" pagination behavior

### 9.3 UX/Error Behavior
- Shows loading and API error states.
- Displays "Failed to load analytics" when backend connectivity fails.

## 10. Seed Data Context
Current seed is designed for realistic project demo scale:
- 300 users
- 900 posts
- 2,200 comments
- 4,500 likes
- 1,500 follow relationships

Data includes:
- realistic names/usernames/emails
- profile/bio diversity
- timestamp distributions
- uniqueness compliance for like/follow constraints

## 11. Setup and Execution
### 11.1 Standard Manual Run
- Start MySQL.
- Apply schema and seed.
- Run backend and frontend separately.

### 11.2 Single-Command Showcase Run
Root script added for presentation convenience:
- Command: npm run showcase

What it does:
- reads DB connection from backend/.env
- drops and recreates configured DB
- applies database/schema.sql and database/seed.sql
- starts backend and frontend in separate PowerShell windows

Default local URLs:
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## 12. Configuration Variables
### Backend (.env)
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- PORT

### Frontend (optional)
- VITE_API_URL

## 13. Magic UI MCP Integration
Workspace includes MCP server config for Magic UI:
- File: .vscode/mcp.json
- Server command: npx -y @magicuidesign/mcp@latest

Purpose:
- Enables enhanced component/design assistance workflow via MCP tooling.

## 14. Security and Data Integrity Notes
- Passwords are stored as password_hash fields (no plaintext column in schema).
- Seed uses generated hashes suitable for demo data (not production auth flow).
- Constraints prevent duplicate likes and duplicate follows.
- Constraint prevents self-follow.
- Foreign keys with ON DELETE CASCADE maintain referential cleanup.

## 15. Demonstration Flow (Suggested for Viva/Report Demo)
1. Run npm run showcase.
2. Open frontend dashboard.
3. Explain schema entities and constraints.
4. Show analytics cards and bar visuals.
5. Open user report cards and search behavior.
6. Trigger simulation endpoint and show dashboard refresh.
7. Optionally call analytics endpoints directly via browser/Postman.

## 16. Current Scope vs Future Enhancements
### Implemented
- Core social schema and analytics
- REST API and simulation
- Visual dashboard and user reporting cards
- One-command demo startup flow

### Suggested Future Work
- JWT-based authentication and role management
- Advanced analytics (time-series trends, retention cohorts)
- Exportable reports (PDF/CSV)
- Caching layer for analytics endpoints
- Dockerized deployment
- Automated tests for API and UI

## 17. Key Files Reference
- README and run guide: README.md
- DB schema: database/schema.sql
- DB seed: database/seed.sql
- Backend entry: backend/app.js
- Analytics model: backend/models/analyticsModel.js
- Simulation model: backend/models/simulateModel.js
- Dashboard page: frontend/src/pages/Dashboard.jsx
- Root showcase command: package.json
- Showcase script: scripts/showcase.ps1
- MCP config: .vscode/mcp.json

## 18. One-Paragraph Report Abstract (Reusable)
This project implements a full-stack Social Media User Behavior Analysis System using MySQL, Express, and React. The database is designed in 3NF with entities for users, posts, comments, likes, and followers, enforcing integrity through foreign keys and uniqueness constraints. A REST API layer supports CRUD-style interactions and analytics endpoints for top users, top posts, engagement, and user activity. The frontend dashboard visualizes these insights through KPI cards, ranking charts, engagement highlights, and searchable user report cards. A scalable seed dataset and a single-command showcase script make the system easy to demonstrate in academic presentations.
