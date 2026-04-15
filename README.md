# Social Media User Behavior Analysis System

A beginner-friendly full-stack DBMS project that analyzes social media activity using MySQL, Express, and React. It focuses on database design, analytics queries, and clean REST APIs.

## Tech Stack
- Backend: Node.js, Express
- Database: MySQL
- Frontend: React (Vite)

## Folder Structure
```
backend/
  app.js
  db.js
  routes/
  controllers/
  models/
frontend/
  index.html
  src/
    components/
    pages/
    App.js
    main.jsx
    index.css
database/
  schema.sql
  seed.sql
```

## Database Setup
1. Start MySQL and create the database tables:
```
mysql -u root -p < database/schema.sql
```
2. Seed sample data:
```
mysql -u root -p < database/seed.sql
```

## Backend Setup
1. Install dependencies:
```
cd backend
npm install
```
2. Set environment variables if needed:
- DB_HOST (default: localhost)
- DB_PORT (default: 3306)
- DB_USER (default: root)
- DB_PASSWORD (default: empty)
- DB_NAME (default: social_media_db)
- PORT (default: 4000)

3. Run the server:
```
npm run dev
```

## Frontend Setup
1. Install dependencies:
```
cd frontend
npm install
```
2. Optional environment variable:
- VITE_API_URL (default: backend on localhost port 4000)

3. Start the UI:
```
npm run dev
```

## API Endpoints
### Users
- GET /users
- GET /users/:id

### Posts
- GET /posts
- POST /posts
- GET /posts/:id

### Interactions
- POST /like
- POST /comment
- POST /follow

### Analytics
- GET /analytics/top-users
- GET /analytics/top-posts
- GET /analytics/engagement
- GET /analytics/user-activity

### Data Simulation
- POST /simulate-data

## Example API Responses
### GET /analytics/top-users
```json
[
  {
    "user_id": 1,
    "username": "alice_w",
    "follower_count": 3
  }
]
```

### GET /analytics/top-posts
```json
[
  {
    "post_id": 2,
    "content": "Sunrise run felt amazing.",
    "username": "ben_k",
    "like_count": 4
  }
]
```

### GET /analytics/engagement
```json
[
  {
    "post_id": 5,
    "content": "Homemade ramen success.",
    "username": "ethan_r",
    "like_count": 3,
    "comment_count": 2,
    "engagement": 5
  }
]
```

### POST /simulate-data
```json
{
  "message": "Simulation complete",
  "inserted": {
    "users": 7,
    "posts": 12,
    "comments": 18,
    "likes": 16,
    "followers": 14
  }
}
```

## How Simulation Works
The simulation endpoint creates random users, posts, comments, likes, and followers in a single transaction. It generates realistic timestamps, avoids duplicate likes and follows using unique constraints, and returns how many records were inserted. The dashboard refreshes to show the new analytics.
