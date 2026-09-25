# Socratic Spectrum

An interactive philosophical reflection built with React, Express, and MongoDB. The assessment compares responses with a set of philosopher profiles and presents the closest affinities as a conversation starter.

## Run locally

1. Install dependencies in `backend/` with `npm install`.
2. Create `backend/.env` with `MONGO_URI=mongodb://127.0.0.1:27017/socratic-spectrum` (or your MongoDB connection string).
3. Seed the 30 built-in questions and 25 philosopher profiles with `npm run seed` from `backend/`. Both seeders upsert the curated records without deleting other database records.
4. Start the API with `npm run dev` from `backend/` (port 5000 by default).
5. In `SocraticSpectrum-frontend/`, run `npm install` and `npm start` (port 3000).

The frontend includes a local copy of the assessment so the reflection and scoring remain usable if the API is offline. When available, the API provides the stored questions and philosopher profiles and saves submitted results.

## API

- `GET /health` — API and database connection status
- `GET /questions` — the ordered question set
- `GET /philosophers` — philosopher profiles and scoring vectors
- `POST /submit` — accepts one answer per stored question; each answer must be an integer from 1 to 5

Each seeded philosopher profile has 30 scoring weights, one for each built-in question. The additional question dimensions are a heuristic extension of the original profiles, intended for reflection rather than diagnosis. Each closest-match result includes a suggested starting text and a link to find a copy.

Set `PORT` to change the API port and `FRONTEND_ORIGIN` to restrict browser requests to a specific frontend origin.
