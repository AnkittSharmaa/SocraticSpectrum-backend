# Free test deployment

This project can be hosted with a free Render web service for the API, a free Vercel deployment for the React app, and MongoDB Atlas for the database.

## Before publishing

The backend repository currently tracks `backend/.env`. Never deploy or commit that file. If it has been pushed to GitHub, replace the MongoDB database user's password in Atlas before deploying, then use the new connection string only in Render's environment settings. Adding `.env` to `.gitignore` does not remove a file already tracked by Git. Keep the local file for development if needed, but remove it from version control before the next push.

Create a dedicated MongoDB database user for the hosted app with access only to the Socratic Spectrum database. Atlas only accepts database connections from addresses in its project IP access list. In Render, open the API service's **Connect** menu, copy its outbound IP ranges, and add those ranges to the Atlas IP access list. Avoid a permanent `0.0.0.0/0` entry.

## Deploy the API to Render

1. Push the backend repository to GitHub after removing `backend/.env` from version control and rotating its credential if it was pushed.
2. In Render, choose **New → Blueprint**, connect `SocraticSpectrum-backend`, and let Render use `render.yaml`.
3. Set `MONGO_URI` to the new Atlas connection string when Render prompts for it. URL-encode any special characters in the database password.
4. Once the frontend is deployed, set `FRONTEND_ORIGIN` to its exact `https://…vercel.app` origin (no trailing slash) in the Render service environment, then redeploy.
5. Wait for the service to become live and check `https://<render-service>.onrender.com/health`. It should return `status: "ok"` and `database: "connected"`.

The blueprint uses the `backend/` folder as the service root, `npm ci` to install dependencies, and `npm start` to run the API. Render supplies the `PORT` value automatically.

## Deploy the frontend to Vercel

1. In Vercel, choose **Add New → Project** and import `SocraticSpectrum-frontend` from GitHub.
2. Vercel should detect Create React App. Set the project root to the repository root, build command to `npm run build`, and output directory to `build` if Vercel does not fill them automatically.
3. Add the environment variable `REACT_APP_API_URL` with the Render API base URL, for example `https://<render-service>.onrender.com` (no trailing slash). Apply it to the Production environment and any Preview environment you plan to use.
4. Deploy. If you change an environment variable later, redeploy so the build picks it up.
5. Copy the Vercel deployment's exact origin into Render's `FRONTEND_ORIGIN`, save, and redeploy the API.

## Share with friends

Share the Vercel URL. The first API request after 15 minutes of inactivity may take around a minute because Render's free web services spin down while idle. Keep the Atlas database running and the backend environment variables configured; do not share database credentials.
