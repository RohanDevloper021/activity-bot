# 🚀 Full Deployment Guide: GitHub ➔ Render ➔ Cron-Job.org (24/7 Free)

This guide walks you through every single step to host your Discord Bot 24/7 for **100% free** using **GitHub**, **Render (Free Web Service)**, and **cron-job.org** (to prevent Render from sleeping).

---

## 📑 Overview of the Setup

```
[ Your Computer / AI Studio ]
              │
       (git push)
              ▼
    [ GitHub Repository ]
              │
       (auto-deploy)
              ▼
   [ Render Web Service ] ◄────── (HTTP Ping every 10 min) ────── [ cron-job.org ]
        (Node.js + Express)                                      (Keeps bot awake 24/7)
              ▲
              │ (Discord Gateway WebSocket)
              ▼
       [ Discord Servers ]
```

---

## 🛠️ Step 1: Discord Developer Portal Setup

Before deploying, ensure your Discord Bot is created and has the required intents:

1. Open the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** (e.g. `Activity Engine` or your bot name).
3. Go to the **Bot** tab on the left menu:
   - Click **Add Bot** (if not already created).
   - Scroll down to **Privileged Gateway Intents** and enable ALL THREE:
     - ✅ **Presence Intent**
     - ✅ **Server Members Intent**
     - ✅ **Message Content Intent** *(CRITICAL: Required to read chat messages for XP)*
   - Click **Save Changes**.
4. Get your **Bot Token**:
   - Under the Bot tab, click **Reset Token**.
   - Copy this token immediately and keep it safe! (This is `DISCORD_TOKEN`).
5. Get your **Application ID (Client ID)**:
   - Go to the **General Information** or **OAuth2** tab.
   - Copy the **Application ID** (This is `DISCORD_CLIENT_ID`).
6. **Invite Bot to your Discord Server**:
   - Go to **OAuth2 ➔ URL Generator**.
   - Scopes: check `bot` and `applications.commands`.
   - Bot Permissions: check `Administrator` or:
     - `Manage Roles` *(CRITICAL for level roles & VC roles)*
     - `Send Messages`
     - `Embed Links`
     - `Read Message History`
     - `View Channels`
   - Copy the generated URL at the bottom, paste it into your browser, and add the bot to your server.
7. **Important Role Hierarchy Tip**:
   - In Discord: Server Settings ➔ **Roles**.
   - Make sure your bot's role is dragged **higher** in the list than the roles it gives out (e.g. level roles, `@In Voice`).

---

## 🐙 Step 2: Push Your Code to GitHub

If you don't already have your code on GitHub:

1. Go to [GitHub.com](https://github.com) and click **New Repository**.
   - Repository name: `discord-activity-bot` (or any name)
   - Set it to **Private** (or Public)
   - Do **NOT** initialize with README or .gitignore (this project already has them).
   - Click **Create repository**.

2. Open your terminal in this project folder and run:

```bash
# 1. Initialize git (if not already a git repo)
git init

# 2. Add all files
git add .

# 3. Commit your files
git commit -m "Initial commit: Discord XP bot with Render & Cron-job support"

# 4. Set main branch
git branch -M main

# 5. Connect to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 6. Push to GitHub
git push -u origin main
```

*(Note: Never commit your `.env` file containing your secret token. The `.gitignore` file already excludes `.env`.)*

---

## ☁️ Step 3: Deploy on Render (Free Web Service)

Render allows you to host web services for free. Because our bot runs an Express server on port 3000 alongside the Discord client, Render will host both seamlessly!

### Option A: Manual Web Service Setup (Recommended & Simplest)

1. Go to [dashboard.render.com](https://dashboard.render.com) and Sign In (use "Sign in with GitHub").
2. Click the blue **New +** button in the top right, then select **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Select your GitHub repository (`discord-activity-bot`).
5. Configure the service:
   - **Name**: `activity-engine-bot` (or your chosen name)
   - **Region**: Choose the closest region to you (e.g. Frankfurt, Oregon, Ohio, Singapore)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
   - **Instance Type**: Select **Free** ($0/month).

6. Scroll down to **Environment Variables** and click **Add Environment Variable**:

   | Key | Value | Explanation |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode |
   | `PORT` | `3000` | Port for Express web dashboard & health check |
   | `DISCORD_TOKEN` | `your_bot_token_here` | The token from Discord Developer Portal |
   | `DISCORD_CLIENT_ID` | `your_client_id_here` | The Application ID from Discord |
   | `DISCORD_GUILD_ID` | `your_server_id` *(optional)* | Instant slash command registration |
   | `DATABASE_URL` | *(optional)* | PostgreSQL URL if using external DB; if left blank, built-in persistent storage is used |

7. Click **Create Web Service** at the bottom.
8. Render will start building and deploying your bot. Within 1–2 minutes, you will see in the logs:
   ```
   🌐 Activity Engine Web & API Server running on port 3000
   🤖 Logged in as Activity Engine#1234
   ✅ Registered slash commands
   ```
9. Copy your Render service URL from the top of the page:
   ```
   https://activity-engine-bot.onrender.com
   ```
   *(Test it in your browser: open `https://activity-engine-bot.onrender.com/health` — it should return `{"status":"healthy","bot":{"connected":true}}`)*

---

## ⏰ Step 4: Setup cron-job.org to Keep the Bot Awake 24/7

### Why is this needed?
On Render's Free tier, Web Services automatically go to sleep after **15 minutes** of no incoming HTTP traffic. When the service sleeps, the Discord bot goes offline!
By scheduling a free ping from **cron-job.org** every **5 to 10 minutes**, Render receives HTTP requests constantly and **NEVER goes to sleep**. Your bot stays online 24/7!

### Step-by-Step cron-job.org Instructions:

1. Go to [cron-job.org](https://cron-job.org) and click **Sign Up** (it is 100% free).
2. Verify your email and log in to the cron-job.org dashboard.
3. Click on the **Cronjobs** tab in the sidebar or top bar.
4. Click the blue **Create Cronjob** button in the top right corner.
5. Fill in the fields:
   - **Title**: `Keep Discord Bot Online (Render)`
   - **URL**:
     ```text
     https://YOUR-APP-NAME.onrender.com/health
     ```
     *(Or use `/ping`, e.g. `https://activity-engine-bot.onrender.com/ping`)*
   - **Execution Schedule**:
     - Select **Every 5 minutes** or **Every 10 minutes** (Recommended: **Every 5 minutes** or **Every 8 minutes**).
   - **Request Method**: `GET`
   - **Notifications / Failure alerts**: Check "Disable" or set to email on failure if desired.
6. Click **Create** at the bottom.
7. Click **Run now** (play icon) next to your newly created cronjob to test it:
   - Status should show **200 OK**.
   - Your Render web service is now pinged every 5-10 minutes around the clock!

---

## ✅ Step 5: Verification Checklist

| Check | How to Verify |
|---|---|
| **Bot Online in Discord** | Look at the member list in your server; your bot should have a green dot (Online). |
| **Slash Commands Active** | Type `/` in a channel; verify commands like `/rank`, `/leaderboard`, `/profile`, `/setup` appear. |
| **Web Dashboard Live** | Visit `https://YOUR-APP-NAME.onrender.com` in your browser to view the live dashboard and Rank Card Studio. |
| **Health Check Working** | Visit `https://YOUR-APP-NAME.onrender.com/health` in your browser. |
| **Cron Job Firing** | Check cron-job.org "History" tab; you should see green 200 OK pings every 5 minutes. |
| **24/7 Continuity** | Leave Discord closed for 1 hour; when you return, the bot is still online and active! |

---

## ❓ Common Troubleshooting & Fixes

### 1. Bot shows "Offline" in Discord even though Render says "Deployed"
- Check Render **Logs** tab. Look for errors.
- Ensure `DISCORD_TOKEN` in Render Environment Variables has no quotes or extra spaces.
- Make sure you enabled the **3 Privileged Gateway Intents** (Message Content, Presence, Server Members) in the Discord Developer Portal under the **Bot** tab. Without Message Content Intent, Discord rejects bot logins.

### 2. Slash Commands (`/rank`, `/leaderboard`) do not show up
- Discord global slash commands take 10 to 60 minutes to propagate across all Discord servers.
- **Fast fix**: Add `DISCORD_GUILD_ID=your_discord_server_id` to Render environment variables. This forces Discord to register commands immediately to your server within 1 second.
- To find your Server ID: In Discord, go to User Settings ➔ Advanced ➔ Enable "Developer Mode", then right-click your server icon and click "Copy Server ID".

### 3. Role assignment fails on Level-Up
- Discord enforces strict role hierarchy: the bot's own role MUST be positioned physically higher in Server Settings ➔ Roles than the level roles it is trying to assign.
- Bot must have `Manage Roles` permission.

---

🎉 **Congratulations!** Your Discord bot is now deployed to GitHub, hosted on Render, and kept awake 24/7 with cron-job.org!
