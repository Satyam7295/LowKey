---
description: Repository Information Overview
alwaysApply: true
---

# LOWKEY Repository Information

## Repository Summary
LOWKEY is a full-stack MERN (MongoDB, Express, React, Node.js) starter scaffold. It features a Node.js/Express backend with Socket.io for real-time communication and a React frontend powered by Vite and TailwindCSS. The project includes pre-configured JWT authentication middleware and error handling.

## Repository Structure
- **backend/**: Node.js Express server with Socket.io, Mongoose models, and JWT authentication.
- **frontend/**: React application using Vite, TailwindCSS, and React Router.
- **Root Files**: Includes utility scripts (`lowkeyAliasGenerator.js.js`, `lowkeyCode.util.js`) and project assets.

### Main Repository Components
- **Backend API**: Express server handling authentication, user management, and real-time messaging.
- **Frontend SPA**: React-based user interface with routing and real-time updates.

## Projects

### Backend Project
**Configuration File**: `backend/package.json`

#### Language & Runtime
**Language**: JavaScript (Node.js)  
**Version**: >=18.0.0  
**Build System**: npm  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `express` (^4.19.2): Web framework
- `mongoose` (^8.5.1): MongoDB ODM
- `socket.io` (^4.8.3): Real-time communication
- `jsonwebtoken` (^9.0.2): Authentication
- `bcryptjs` (^2.4.3): Password hashing
- `helmet` (^7.1.0): Security headers
- `cors` (^2.8.5): Cross-origin resource sharing

**Development Dependencies**:
- `nodemon` (^3.1.4): Development server
- `eslint` (^9.13.0): Linting

#### Build & Installation
```bash
cd backend
npm install
npm run dev
```

#### Main Files
- **Entry Point**: `backend/src/index.js`
- **Application Logic**: `backend/src/app.js`
- **Database Config**: `backend/src/config/database.js`

---

### Frontend Project
**Configuration File**: `frontend/package.json`

#### Language & Runtime
**Language**: JavaScript (React)  
**Build System**: Vite  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `react` (^18.3.1): UI library
- `react-router-dom` (^6.28.0): Routing
- `axios` (^1.7.7): HTTP client
- `socket.io-client` (^4.8.3): Real-time client
- `tailwindcss` (^3.4.14): Styling

**Development Dependencies**:
- `vite` (^5.4.8): Build tool
- `eslint` (^9.13.0): Linting

#### Build & Installation
```bash
cd frontend
npm install
npm run dev
```

#### Main Files
- **Entry Point**: `frontend/src/main.jsx`
- **Root Component**: `frontend/src/App.jsx`
- **Config**: `frontend/vite.config.js`, `frontend/tailwind.config.js`

#### Testing
No formal testing framework (e.g., Jest, Vitest) was found in the current configuration.

#### Operations
- **Build Production**: `npm run build` (inside `frontend/`)
- **Linting**: `npm run lint` (inside `frontend/`)
