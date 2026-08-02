# Tedbus

<p align="center">
	<img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular Badge" />
	<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js Badge" />
	<img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express Badge" />
	<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Badge" />
	<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS Badge" />
	<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge" />
	<img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm Badge" />
	<img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License Badge" />
</p>

Tedbus is a full-stack online bus ticket booking application built with Angular, Node.js, Express, and MongoDB. It supports route searching, live seat layout selection, passenger booking management, payment workflow simulation, and customer profile trip history.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Usage](#usage)
- [License](#license)

## Overview

The application uses Angular 21 for the single-page frontend UI, Express for REST API routing, and MongoDB with Mongoose for data persistence. Users can search routes between major cities, view real-time booked seats, select available seats from an interactive layout, submit passenger details, complete payment UI simulation, and view past booking history in their profile dashboard.

## Features

- Search routes with Material Datepicker and origin/destination selectors
- Browse available bus listings with filters (AC/Non-AC, sleeper, price, departure time)
- Interactive 40-seat layout with real-time booked seat tracking from MongoDB
- Collect passenger details with optional travel insurance and business GST add-ons
- Payment UI options (Credit/Debit Cards, Net Banking, UPI, Wallets)
- Customer profile dashboard displaying trip history fetched from the backend API
- Express REST API with MongoDB models for routes, buses, customers, and bookings
- Database repair script (`fix-bus-routes.js`) for linking bus operator documents to route IDs

## Tech Stack

- Frontend: Angular 21, TypeScript 5.9, Angular Material, Tailwind CSS 4
- Runtime: Node.js
- Framework: Express 5
- Database: MongoDB with Mongoose 9
- State Management: RxJS `BehaviorSubject` Services
- Package Manager: pnpm

### Running with Docker (Recommended)

You can run the entire application (Backend + Frontend) with a single command on any machine using Docker:

```bash
# 1. Clone repository
git clone https://github.com/devkhansalman/TedBus.git
cd TedBus

# 2. Copy environment file template
cp .env.example .env

# 3. Build and start containers
docker compose up --build
```

Access the application:
- **Frontend UI**: http://localhost:4200
- **Backend API**: http://localhost:8000
- **Backend Health Check**: http://localhost:8000/health

---

### Local Manual Installation


- Node.js 18 or newer
- MongoDB running locally on `127.0.0.1:27017`
- pnpm installed locally

### Installation

```bash
git clone https://github.com/devkhansalman/TedBus.git
cd Tedbus

# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install --frozen-lockfile
```

## Environment Variables

### Backend Configuration (`backend/index.js`)

Default configuration values used by the server:

```env
PORT=8000
MONGODB_URL=mongodb://127.0.0.1:27017/tedbus-server
```

### Frontend Configuration (`frontend/src/app/config/index.ts`)

API Base URL configuration:

```typescript
export const url: string = 'http://localhost:8000/';
```

## Scripts

### Backend Scripts (`cd backend`)

```bash
pnpm start               # Starts Express backend server with Nodemon on port 8000
node fix-bus-routes.js   # Fixes bus-route ObjectId relationships in MongoDB
```

### Frontend Scripts (`cd frontend`)

```bash
pnpm start               # Starts Angular development server on http://localhost:4200
pnpm build               # Compiles production build in dist/ directory
pnpm test                # Runs unit tests via Vitest & jsdom
```

## Usage

1. Start MongoDB service locally on port `27017`.
2. Start the backend server:
   ```bash
   cd backend
   pnpm start
   ```
3. Start the frontend client in a new terminal:
   ```bash
   cd frontend
   pnpm start
   ```
4. Open `http://localhost:4200` in your web browser.
5. Search for a route (e.g., *Delhi to Jaipur*), select available seats, enter traveller details, and complete the booking process.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
