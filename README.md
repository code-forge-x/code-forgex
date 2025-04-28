# CodeForegX Project

## Prerequisites
- Node.js (v16 or higher)
- Docker Desktop (with Docker Compose)
- PowerShell (for running setup scripts)

## Setup Instructions

1. **Copy component code from blueprint/amendment docs**
   - Add the code to the respective files

2. **Install dependencies**
   `
   npm run install-all
   `

3. **Generate JWT Secret**
   `
   npm run generate-jwt
   `
   - Copy the output and replace the JWT_SECRET value in the .env file
   - Add your Claude API key to the .env file

4. **Start Docker containers**
   `
   npm run docker:build
   `

5. **Create admin user**
   `
   npm run create-admin
   `

6. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - MongoDB UI: http://localhost:8081

## Development

- Start both frontend and backend in development mode:
  `
  npm run dev
  `

- Start only the backend:
  `
  npm run server
  `

- Start only the frontend:
  `
  npm run client
  `

## Docker Commands

- Start all containers:
  `
  npm run docker:up
  `

- Rebuild and start all containers:
  `
  npm run docker:build
  `

- Stop all containers:
  `
  npm run docker:down
  `

## Directory Structure

- /client: React frontend
- /server: Express backend
- /database: Database initialization scripts
