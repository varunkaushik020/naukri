# Naukri

A full-stack job portal application built with Node.js, Express, MongoDB, and React.

## Project Structure

- `backend/` – Express server, API routes, controllers, middleware, models, and services
- `frontend/` – React application for user authentication, dashboards, profiles, and job management

## Features

- Role-based access for recruiters and job seekers
- User authentication with MFA support
- Job posting and application tracking
- File upload support for resumes
- Admin dashboard for managing users, companies, and applications

## Getting Started

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Deployment

- Ensure backend and frontend are configured with the correct API endpoint URLs
- Build the React app for production with `npm run build`
- Serve the backend and frontend from a production-ready host

## Notes

- The frontend folder is tracked as part of the repository
- You may need to update `.env` settings for database and authentication
