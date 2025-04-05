# Daily Work Tracker with AI Insights

A full-screen web application to track your daily work sessions, set goals, and receive hourly AI field updates.

## Features

- **User Onboarding**: Enter your name to get started (no account required)
- **Goal-First Workflow**: Set your daily goal, then start tracking your work sessions
- **Timer Functionality**: Track your work sessions with Start, Pause, and Reset buttons
- **Goal Completion**: Timer stops automatically when you reach your daily goal
- **Progress Visualization**: See your progress with a line graph and bar charts for 6 days
- **AI Field Updates**: Receive the latest insights about artificial intelligence developments, updated hourly
- **Data Persistence**: All your data is saved in your browser's local storage

## Tech Stack

- React for the frontend UI
- Tailwind CSS for styling
- Vite for development and building
- LocalStorage for data persistence
- OpenAI API integration (optional)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser to the URL shown in the terminal

## Using the OpenAI API (Optional)

To use real AI insights instead of the demo content:

1. Create an OpenAI account and get an API key from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Copy the `.env.example` file to a new file named `.env`
3. Replace the placeholder in the `.env` file with your actual API key
4. For Netlify deployment, add the environment variable in the Netlify Dashboard

## Deploying to Netlify

### Option 1: Deploy from Git Repository

1. Push your code to a GitHub repository
2. Log in to Netlify and click "New site from Git"
3. Select GitHub and authorize Netlify
4. Choose your repository
5. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"
7. In Site settings > Build & deploy > Environment, add environment variable:
   - Key: `VITE_OPENAI_API_KEY`
   - Value: Your OpenAI API key

### Option 2: Deploy using Netlify CLI

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build your site: `npm run build`
3. Login to Netlify: `netlify login`
4. Initialize your site: `netlify init`
5. Deploy a draft version: `npm run netlify:deploy`
6. Deploy to production: `npm run netlify:deploy:prod`
7. Set the environment variable:
   ```
   netlify env:set VITE_OPENAI_API_KEY your_api_key_here
   ```

## How to Use

1. **Enter Your Name**: Start by entering your name on the welcome screen
2. **Set Your Daily Goal**: Choose a work time goal (4, 8, or 10 hours, or custom)
3. **Start Timer**: Begin tracking your work session
4. **Monitor Progress**: View your progress toward your daily goal
5. **Receive AI Updates**: Get hourly updates about AI developments
6. **Track Weekly Progress**: See how you're doing over a 6-day period

## License

MIT 