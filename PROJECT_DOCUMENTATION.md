# Smart Food Donation & Redistribution Platform - Project Documentation

## 1. Project Overview
The **Smart Food Donation & Redistribution Platform** is a full-stack, microservices-based application designed to seamlessly connect food donors (restaurants, events, individuals) with NGOs and volunteers. Its primary goal is to minimize food waste and optimize the redistribution of surplus food to those in need, backed by an AI-driven prediction engine to assess donation priority and find the best-fit recipients.

## 2. High-Level Architecture
The project utilizes a modern microservices architecture comprising three main ecosystems:
1. **Frontend UI**: A Single Page Application (SPA) built with React and Vite.
2. **Backend Services**: A distributed system of Java Spring Boot microservices communicating via Eureka.
3. **AI Engine**: A standalone Python FastAPI service handling machine learning predictions.

---

## 3. Component Breakdown

### 3.1. Frontend (`/frontend`)
The frontend is the user-facing interface for different roles: Donors, NGOs, and Volunteers.
- **Tech Stack**: React 19, Vite, React Router, Recharts (for analytics), Axios.
- **Key Features**:
  - **Role-Based Dashboards**: Specific dashboards tailored for Donors, NGOs, and Volunteers.
  - **Context-Aware Layouts**: Sidebar, Navbar, and an emergency SOS Banner component.
  - **Donation Management**: Create, track, and manage donations.
  - **AI Recommendations**: View intelligent suggestions for NGO routing.
  - **Impact Reporting**: Visualizing the impact of donations (meals served, CO2 reduced).

### 3.2. Backend Microservices (`/backend`)
The backend is powered by Spring Cloud and Spring Boot, breaking down the application domains into highly cohesive, loosely coupled services:
- **`eureka-server`**: Service registry for the microservices to discover each other.
- **`api-gateway`**: The central entry point for the frontend, routing incoming requests to the appropriate microservices.
- **`auth-service`**: Handles user authentication, authorization, and secure access.
- **`donor-service`**: Manages donor profiles, donation creation, and donor history.
- **`ngo-service`**: Manages NGO profiles, capacity, and current demand.
- **`logistics-service`**: Manages volunteers, drivers, route tracking, and delivery updates.
- **`impact-service`**: Tracks and calculates the overall social and environmental impact (e.g., CO2 emissions prevented).
- **`notification-service`**: Sends real-time alerts, emails, or SMS updates to users regarding donation statuses.
- **`ai-orchestrator`**: A bridge service in Spring Boot that coordinates complex requests and forwards them to the Python AI Engine.

### 3.3. AI Prediction Service (`/fastapi-ai-service`)
A dedicated Python ML service providing intelligent decision-making capabilities.
- **Tech Stack**: Python 3.10+, FastAPI, Scikit-Learn/Pandas (for ML models).
- **Capabilities**:
  - **Priority Assessment**: Evaluates how urgently food must be redistributed.
  - **Urgency Scoring**: Calculates a score (0.0 to 1.0) based on perishability and expiry.
  - **NGO Recommendation**: Matches donations to the most suitable NGO based on demand, distance, and capacity.
  - **Risk Assessment**: Highlights potential food safety risks.
- **Endpoints**: Exposes REST endpoints (e.g., `POST /predict`) consumed by the `ai-orchestrator`.

---

## 4. Workflows & Data Flow

1. **User Registration & Login**: Handled via the React Frontend -> API Gateway -> Auth Service.
2. **Donation Creation**: A Donor creates a donation listing -> API Gateway -> Donor Service. 
3. **AI Triage**: The AI Orchestrator detects the new donation and triggers the FastAPI Service to calculate urgency and recommend the best NGO.
4. **Logistics Assignment**: Once an NGO accepts, the Logistics Service pings available volunteers to transport the food.
5. **Completion & Impact**: Upon delivery, the Impact Service calculates the metrics (meals provided, waste averted), and the Notification Service alerts the Donor.

---

## 5. Development & Setup Guide

### 5.1. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be accessible (typically on `localhost:5173`).

### 5.2. Running the Backend Services
Prerequisites: JDK 17+ and Maven.
Services must be started in a specific order:
1. Start `eureka-server`.
2. Start `api-gateway`.
3. Start the remaining business microservices (`auth-service`, `donor-service`, etc.).
*(Each service can be started by navigating to its directory and running `./mvnw spring-boot:run`)*

### 5.3. Running the AI Service
Prerequisites: Python 3.10+
```bash
cd fastapi-ai-service
python -m venv venv
# Activate virtual environment
venv\Scripts\activate
pip install -r requirements.txt
# (Optional) Train the model if not already present
python train.py
# Run the FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The AI service API documentation will be available at `http://localhost:8000/docs`.
