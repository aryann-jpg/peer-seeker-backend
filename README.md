
# Peer Seeker – Backend

## Overview
This repository contains the backend of the Peer Seeker application.  
The backend provides RESTful APIs for authentication, bookings, bookmarks, and database operations.

The backend follows DevOps and GitOps practices with automated deployment.

---

## Tech Stack
- Node.js
- Express.js
- MongoDB
- JavaScript
- GitHub Actions
- Render

---

## CI/CD Pipeline (GitOps)

The backend uses GitHub Actions for continuous integration.

### Trigger
- Any push to the `main` branch

### Pipeline Steps
1. Checkout repository
2. Install backend dependencies
3. Run automated checks (if available)

This ensures code stability before deployment.

---

## Deployment Architecture

- Cloud Platform: **Render**
- Deployment Type: **Automatic**
- Server Type: Node.js Web Service

Render automatically redeploys the backend whenever new changes are pushed to the `main` branch.

---

## Environment Variables
Backend environment variables are securely stored in Render.

Example:
```env
MONGO_URI=***************
JWT_SECRET=***************
PORT=5000
