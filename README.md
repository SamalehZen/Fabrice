<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Vlp4zTtr83jKB0l1XK2c7CQMC2FGjUkn

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy on Render

You can deploy this Vite SPA as a Render *Static Site* using the included `render.yaml` blueprint or by creating the service manually.

### One-click deployment with `render.yaml`
1. Push this repository (containing `render.yaml`) to GitHub.
2. On Render, click **New > Blueprint** and point to the repo.
3. When prompted, set the `VITE_GEMINI_API_KEY` environment variable to your Gemini key (Render marks it as `sync: false`, meaning you provide the value in the dashboard).
4. Render will run `npm install && npm run build`, publish the `dist` folder, and automatically provision a CDN-backed static site.

### Manual static site setup
1. On Render, choose **New > Static Site** and connect the repo.
2. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Add the environment variable **VITE_GEMINI_API_KEY** with your Gemini API key under the *Environment* section.
4. Click **Create Static Site**. Render will build and deploy the app, serving the compiled Vite assets without needing any custom server.

> ℹ️ The Gemini client is loaded in the browser, so the `VITE_GEMINI_API_KEY` must be defined at build time. Rotate the key periodically and apply Render's Secrets manager as needed.
