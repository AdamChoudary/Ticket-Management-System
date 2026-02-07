# AI Support Hub - Complete Setup Guide

> Step-by-step instructions to get AI Support Hub running on your local machine in under 10 minutes.

**Last Updated**: 2026-02-07  
**Difficulty**: Beginner-friendly  
**Estimated Time**: 10 minutes

---

## 📋 Table of Contents

1. [Quick Start (TL;DR)](#quick-start-tldr)
2. [Prerequisites Installation](#prerequisites-installation)
3. [Project Setup](#project-setup)
4. [Running the Application](#running-the-application)
5. [Initial Configuration](#initial-configuration)
6. [Verification & Testing](#verification--testing)
7. [Platform-Specific Instructions](#platform-specific-instructions)
8. [Troubleshooting Setup Issues](#troubleshooting-setup-issues)
9. [Next Steps](#next-steps)

---

## Quick Start (TL;DR)

**For experienced developers who already have Docker:**

```bash
# 1. Clone repository
git clone <repository-url>
cd Ticket-Management-System

# 2. Copy environment file (defaults work fine!)
cp .env.example .env

# 3. Start everything
docker-compose up --build -d

# 4. Open browser
open http://localhost:3000

# ✅ Done! Skip to verification section.
```

**For everyone else, continue reading...**

---

## Prerequisites Installation

### What You'll Need

| Software | Minimum Version | Purpose | Required? |
|----------|----------------|---------|-----------|
| **Docker Desktop** | 24.0+ | Runs all services in containers | ✅ Yes |
| **Git** | 2.0+ | Clone the repository | ✅ Yes |
| **Web Browser** | Modern browser | Access the application | ✅ Yes |
| **Text Editor** | Any | Edit .env file (optional) | ⚠️ Optional |
| **Gemini API Key** | N/A | AI-powered analysis | ⚠️ Optional |

---

### Step 1: Install Docker Desktop

Docker will run all services (database, backend, frontend) in isolated containers.

#### macOS

**Option A: Download Installer**

1. Visit https://www.docker.com/products/docker-desktop
2. Click **"Download for Mac"**
   - Apple Silicon (M1/M2/M3): Choose "Apple Chip"
   - Intel Mac: Choose "Intel Chip"
3. Open the downloaded `.dmg` file
4. Drag **Docker.app** to Applications folder
5. Launch **Docker Desktop** from Applications
6. Follow the setup wizard (accept terms, choose settings)

**Option B: Using Homebrew**

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Launch Docker Desktop
open /Applications/Docker.app
```

**Verify Installation**:

```bash
docker --version
# Expected: Docker version 24.0.0 or higher

docker-compose --version
# Expected: Docker Compose version v2.0.0 or higher
```

#### Windows

**Requirements**: Windows 10 64-bit Pro/Enterprise/Education or Windows 11

1. Visit https://www.docker.com/products/docker-desktop
2. Click **"Download for Windows"**
3. Run **Docker Desktop Installer.exe**
4. Follow installation wizard:
   - ✅ Enable Hyper-V Windows Features
   - ✅ Enable WSL 2 Windows Features
5. Restart computer when prompted
6. Launch **Docker Desktop** from Start Menu

**Enable WSL 2** (if prompted):

```powershell
# Run in PowerShell as Administrator
wsl --install
wsl --set-default-version 2
```

**Verify Installation**:

```powershell
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)

```bash
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add your user to docker group (avoid using sudo)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
# Or run: newgrp docker

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

**Verify Installation**:

```bash
docker --version
docker compose version  # Note: 'compose' not 'docker-compose' on newer versions
```

---

### Step 2: Install Git

#### macOS

**Option A: Using Xcode Command Line Tools**

```bash
xcode-select --install
```

**Option B: Using Homebrew**

```bash
brew install git
```

#### Windows

1. Download from https://git-scm.com/download/win
2. Run the installer
3. Use default settings (or customize as needed)

#### Linux

```bash
# Ubuntu/Debian
sudo apt-get install git

# Fedora
sudo dnf install git

# Arch
sudo pacman -S git
```

**Verify Installation**:

```bash
git --version
# Expected: git version 2.x.x
```

---

### Step 3: Get Gemini API Key (Optional)

The application works without an API key (using heuristic analysis), but AI features require a Gemini key.

**Get Free API Key**:

1. Visit https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Click **"Create API key in new project"** (recommended)
5. Copy the key (starts with `AIza`, about 39 characters)
6. Save it somewhere safe (you'll need it later)

**Free Tier Limits**:
- ✅ 15 requests per minute
- ✅ 1,500 requests per day
- ✅ Free forever

**Note**: You can also add the key later via the Settings page in the app.

---

## Project Setup

### Step 1: Clone the Repository

Choose a location for the project (e.g., Desktop, Documents, or a dedicated projects folder).

```bash
# Navigate to your projects folder
cd ~/Developer  # macOS/Linux
# or
cd C:\Users\YourName\Projects  # Windows

# Clone the repository
git clone <repository-url>

# Navigate into the project
cd Ticket-Management-System

# Verify you're in the right place
ls -la
# You should see: backend/ frontend/ docker-compose.yml README.md etc.
```

**Folder structure should look like**:

```
Ticket-Management-System/
├── backend/
├── frontend/
├── docker-compose.yml
├── .env.example
├── README.md
└── ... (other files)
```

---

### Step 2: Configure Environment Variables

The project uses a `.env` file for configuration. Create it from the template:

```bash
# Copy template to .env
cp .env.example .env

# macOS: Open in TextEdit
open -a TextEdit .env

# Linux: Open in nano
nano .env

# Windows: Open in Notepad
notepad .env
```

**Default `.env` content** (works perfectly for local development):

```bash
# ===================================
# Database Configuration
# ===================================
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tickets
POSTGRES_PORT=5432

# ===================================
# Redis Configuration
# ===================================
REDIS_PORT=6379

# ===================================
# Backend API Configuration
# ===================================
BACKEND_PORT=8000
DEBUG=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ===================================
# Celery Worker Configuration
# ===================================
CELERY_WORKER_CONCURRENCY=4
CELERY_WORKER_PREFETCH_MULTIPLIER=1

# ===================================
# Frontend Configuration
# ===================================
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# ===================================
# AI Configuration (BYOK)
# ===================================
# Get your key from: https://makersuite.google.com/app/apikey
# Leave empty to use BYOK (Bring Your Own Key) via Settings page
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

**⚠️ Important Notes**:

1. **No changes needed for first run!** Defaults work out of the box.
2. **Optional**: Add your Gemini API key to `GEMINI_API_KEY=` (or add it later in Settings page)
3. **Never commit `.env` to Git** - it's already in `.gitignore`
4. For production, see `.env.production.example`

---

## Running the Application

### Step 1: Start Docker Desktop

**macOS/Windows**:
- Open **Docker Desktop** application
- Wait for it to fully start (whale icon in menu bar/system tray)
- Ensure it says "Docker Desktop is running"

**Linux**:
```bash
# Start Docker service
sudo systemctl start docker

# Verify it's running
sudo systemctl status docker
```

---

### Step 2: Build and Start All Services

From the project root directory:

```bash
# Build images and start services in detached mode
docker-compose up --build -d

# What this does:
# 1. Pulls PostgreSQL 16 image from Docker Hub
# 2. Builds backend Docker image (Python 3.11 + FastAPI)
# 3. Builds frontend Docker image (Node 18 + Next.js 14)
# 4. Creates Docker network for services to communicate
# 5. Creates persistent volume for PostgreSQL data
# 6. Starts all 3 containers in background
```

**Expected Output**:

```
[+] Building 45.2s (40/40) FINISHED
[+] Running 4/4
 ✔ Network ticket-management-system_default    Created
 ✔ Container ai-support-db                     Started
 ✔ Container ai-support-backend                Started
 ✔ Container ai-support-frontend               Started
```

**First-time build times**:
- Backend: 30-60 seconds (installing Python packages)
- Frontend: 60-120 seconds (installing npm packages)
- Subsequent builds: 5-10 seconds (uses cache)

---

### Step 3: Verify Services are Running

```bash
# Check container status
docker-compose ps

# Expected output (all should be "Up"):
NAME                      STATUS              PORTS
ai-support-db             Up 30 seconds       0.0.0.0:5432->5432/tcp
ai-support-backend        Up 25 seconds       0.0.0.0:8000->8000/tcp
ai-support-frontend       Up 20 seconds       0.0.0.0:3000->3000/tcp
```

**Status indicators**:
- ✅ **Up X seconds/minutes** = Running correctly
- ❌ **Restarting** = Container is crashing (check logs)
- ❌ **Exited (1)** = Container failed to start (check logs)

**If any service is not "Up"**:

```bash
# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# View live logs (Ctrl+C to exit)
docker-compose logs -f backend
```

---

### Step 4: Wait for Services to Initialize

Services need a few seconds to fully start:

**Database (PostgreSQL)**:
- Takes 5-10 seconds to initialize
- Creates `tickets` table automatically

**Backend (FastAPI)**:
- Waits for database to be ready
- Runs database migrations
- Starts on port 8000

**Frontend (Next.js)**:
- Compiles React components
- Starts on port 3000

**Total startup time**: 15-30 seconds

**How to know it's ready**:

```bash
# Method 1: Check logs for "ready" messages
docker-compose logs backend | grep "Uvicorn running"
# Should see: INFO:     Uvicorn running on http://0.0.0.0:8000

docker-compose logs frontend | grep "Ready"
# Should see: ▲ Next.js 14.x ready on http://localhost:3000

# Method 2: Health check
curl http://localhost:8000/health
# Should return: {"status":"healthy","database":"connected","timestamp":"..."}
```

---

## Initial Configuration

### Option 1: Configure API Key in Settings (Recommended)

1. **Open your browser**:
   ```
   http://localhost:3000
   ```

2. **Navigate to Settings**:
   - Click **"Settings"** in navigation bar
   - Or go directly to: http://localhost:3000/settings

3. **Enter your Gemini API Key**:
   - Paste your key (starts with `AIza`)
   - Click **"Test Key"** button
   - Wait for validation (2-3 seconds)
   - Should see: ✅ "API key is valid and working!"

4. **Save the key**:
   - Click **"Save Key"** button
   - See success message: "API Key saved securely in browser"
   - Notice "✓ Saved" badge in input field

5. **How it works**:
   - Key stored in browser's `localStorage`
   - Never sent to server for storage
   - Automatically included in API requests via `X-Gemini-Key` header
   - Can be removed anytime by clearing the field and clicking Save

---

### Option 2: Configure Server-Side API Key

**Use case**: When you want all users to share a server key (not recommended for production)

1. **Stop services**:
   ```bash
   docker-compose down
   ```

2. **Edit `.env` file**:
   ```bash
   # Open .env
   nano .env  # or your preferred editor
   
   # Find this section:
   GEMINI_API_KEY=
   
   # Add your key:
   GEMINI_API_KEY=AIzaSy...your-key-here
   ```

3. **Restart services**:
   ```bash
   docker-compose up -d
   ```

4. **Verify**:
   ```bash
   # Check backend logs
   docker-compose logs backend | grep "Gemini"
   # Should see: Gemini client initialized
   ```

---

## Verification & Testing

### Step 1: Access the Landing Page

1. **Open browser**: http://localhost:3000

2. **You should see**:
   - Beautiful landing page with hero section
   - "AI Support Hub" title
   - Features section
   - "How It Works" section
   - Call-to-action button

3. **If you see a blank page**:
   ```bash
   # Check frontend logs
   docker-compose logs frontend
   
   # Look for errors like:
   # - Module not found
   # - Compilation error
   # - Port already in use
   ```

---

### Step 2: Check API Documentation

1. **Open Swagger UI**: http://localhost:8000/docs

2. **You should see**:
   - Interactive API documentation
   - List of all endpoints
   - "Try it out" buttons for testing

3. **Test the health endpoint**:
   - Click **GET /health**
   - Click **"Try it out"**
   - Click **"Execute"**
   - Should see response:
     ```json
     {
       "status": "healthy",
       "database": "connected",
       "timestamp": "2026-02-07T10:30:00Z"
     }
     ```

---

### Step 3: Submit Your First Ticket

1. **Navigate to Submit page**:
   ```
   http://localhost:3000/submit
   ```

2. **Enter a test ticket**:
   ```
   I can't log into my account. When I try to reset my password,
   I don't receive the reset email. This is urgent because I need
   to access my account for an important meeting today.
   ```

3. **Click "Submit Ticket"**:
   - Button changes to "Submitting..." with spinner
   - On success: Green toast message appears
   - Automatically redirected to dashboard

4. **What just happened**:
   ```
   Frontend → POST /api/tickets → Backend
                                     ↓
                              Insert to database (status=pending)
                                     ↓
                              Queue background task
                                     ↓
                              Return ticket ID to frontend
   
   Background worker:
   - Picks up ticket
   - Changes status to "processing"
   - Calls Gemini API (or uses heuristic fallback)
   - Updates ticket with analysis
   - Changes status to "completed"
   ```

---

### Step 4: Monitor the Dashboard

1. **You should already be on**: http://localhost:3000/dashboard

2. **Watch the real-time progression**:
   
   **Timeline**:
   ```
   0s:  Ticket appears - Status: PENDING 🟡
   2s:  Status changes to: PROCESSING 🔵
   5s:  AI analyzing...
   10s: Status changes to: COMPLETED ✅
   ```

3. **Click on the completed ticket** to expand:
   
   **You should see**:
   - **Category**: Technical
   - **Urgency**: High
   - **Sentiment**: 2.0 / 10.0 (frustrated customer)
   - **Draft Response**: Professional multi-paragraph response

4. **Verify auto-refresh**:
   - Dashboard polls API every 3 seconds
   - No manual refresh needed
   - New tickets appear automatically

---

### Step 5: Test Database Management

1. **On the dashboard, scroll down** to Database Management section

2. **Check statistics**:
   ```
   Total Tickets: 1
   ├── Pending: 0
   ├── Processing: 0
   └── Completed: 1
   
   Database Size: 0.05 MB
   Active Connections: 3
   ```

3. **Test Export CSV**:
   - Click **"Export CSV"** button
   - File downloads: `tickets-export-2026-02-07.csv`
   - Open in Excel/Numbers to verify

4. **Test Export JSON**:
   - Click **"Export JSON"** button
   - File downloads: `tickets-export-2026-02-07.json`
   - Open in text editor to verify

---

### Step 6: Verify Database Connection

**Optional - for developers who want to inspect the database directly**

```bash
# Connect to PostgreSQL container
docker-compose exec db psql -U postgres -d tickets

# You're now in psql shell
# Prompt will show: tickets=#

# List tables
\dt

# Output:
#           List of relations
#  Schema |  Name   | Type  |  Owner
# --------+---------+-------+----------
#  public | tickets | table | postgres

# View all tickets
SELECT id, status, category, urgency FROM tickets;

# Count tickets
SELECT COUNT(*) FROM tickets;

# Exit psql
\q
```

---

## Platform-Specific Instructions

### macOS Specific

**Port Already in Use Error**:

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port in .env
FRONTEND_PORT=3001
```

**Docker Desktop Memory Issues**:

1. Open Docker Desktop
2. Settings → Resources
3. Increase Memory to 4GB (default is 2GB)
4. Click "Apply & Restart"

---

### Windows Specific

**WSL 2 Issues**:

```powershell
# Update WSL
wsl --update

# Set version 2 as default
wsl --set-default-version 2

# Check which version is running
wsl -l -v
```

**Line Ending Issues** (git checkout changes line endings):

```bash
# Configure git to not change line endings
git config --global core.autocrlf false

# Re-clone repository
cd ..
rm -rf Ticket-Management-System
git clone <repo-url>
```

**Docker Compose Command**:

Windows may use `docker compose` (space) instead of `docker-compose` (hyphen):

```powershell
# Try this if docker-compose doesn't work
docker compose up --build -d
docker compose ps
docker compose logs
```

---

### Linux Specific

**Permission Denied Error**:

```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker

# Now try without sudo
docker ps
```

**Port Already in Use**:

```bash
# Check what's using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

**Firewall Issues**:

```bash
# Allow Docker traffic (Ubuntu/Debian)
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
```

---

## Troubleshooting Setup Issues

### Issue 1: Docker Compose Command Not Found

**Error**: `docker-compose: command not found`

**Solution**:

```bash
# Check Docker Compose version
docker compose version  # Note: no hyphen

# If using older Docker, install docker-compose plugin
sudo apt-get install docker-compose-plugin

# Or use 'docker compose' instead of 'docker-compose'
alias docker-compose='docker compose'
```

---

### Issue 2: Port Already in Use

**Error**: `Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use`

**Solution**:

```bash
# Find what's using the port
# macOS/Linux:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000

# Option A: Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Option B: Change port in .env
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:8000/api  # Keep this same
```

---

### Issue 3: Services Keep Restarting

**Error**: `docker-compose ps` shows "Restarting" status

**Diagnosis**:

```bash
# View logs
docker-compose logs backend
docker-compose logs frontend

# Common causes:
# 1. Port conflict
# 2. Missing environment variable
# 3. Database connection failed
```

**Solutions**:

```bash
# Stop all services
docker-compose down

# Remove volumes (clears database)
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build -d
```

---

### Issue 4: Frontend Shows Blank Page

**Symptoms**: http://localhost:3000 shows white page

**Diagnosis**:

```bash
# Check frontend logs
docker-compose logs frontend

# Look for:
# - "Compiled successfully" (good)
# - "Module not found" (bad - missing dependency)
# - "Error: ..." (bad - compilation error)
```

**Solutions**:

```bash
# Rebuild frontend only
docker-compose up --build -d frontend

# Or rebuild from scratch
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

---

### Issue 5: Backend API Not Responding

**Symptoms**: http://localhost:8000/docs returns error

**Diagnosis**:

```bash
# Check if backend is running
docker-compose ps backend
# Should show: Up X seconds

# Check logs
docker-compose logs backend

# Test health endpoint
curl http://localhost:8000/health
```

**Solutions**:

```bash
# Restart backend
docker-compose restart backend

# Check database connection
docker-compose exec backend python -c "from app.database import engine; print('DB OK')"

# Rebuild backend
docker-compose up --build -d backend
```

---

### Issue 6: Database Connection Failed

**Error**: `could not connect to server: Connection refused`

**Solutions**:

```bash
# Check if database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Nuclear option: recreate database
docker-compose down -v  # WARNING: deletes all data!
docker-compose up -d db
```

---

### Issue 7: API Key Not Working

**Symptoms**: Tickets stuck in "processing" or show heuristic analysis

**Diagnosis**:

```bash
# Check backend logs for Gemini errors
docker-compose logs backend | grep -i gemini

# Common errors:
# - "API key invalid"
# - "Quota exceeded"
# - "Module not found: google.generativeai"
```

**Solutions**:

```bash
# Install google-generativeai library
docker-compose exec backend pip install google-generativeai

# Restart backend
docker-compose restart backend

# Verify key in Settings page
# Open http://localhost:3000/settings
# Click "Test Key"
```

---

## Next Steps

### ✅ Setup Complete! What's Next?

**Immediate Actions**:

1. **Explore the Application**:
   - Submit different types of tickets (billing, technical, feature requests)
   - Watch AI analysis in real-time
   - Export data as CSV/JSON
   - Test filters and search

2. **Read the Documentation**:
   - [README.md](./README.md) - Complete project documentation
   - [SECURITY.md](./SECURITY.md) - Security best practices
   - [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
   - [CONTRIBUTING.md](./CONTRIBUTING.md) - How to contribute

3. **Customize the Application**:
   - Modify landing page text
   - Change color scheme
   - Add new ticket categories
   - Customize AI prompts

**Development Setup** (if you want to code):

```bash
# Backend development
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install -e .
uvicorn app.main:app --reload

# Frontend development
cd frontend
npm install
npm run dev
```

**Learn More**:

- FastAPI docs: https://fastapi.tiangolo.com
- Next.js docs: https://nextjs.org/docs
- Docker docs: https://docs.docker.com
- Gemini AI: https://ai.google.dev

---

## Quick Command Reference

### Essential Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Rebuild after code changes
docker-compose up --build -d

# Remove everything (including database!)
docker-compose down -v

# Check service status
docker-compose ps

# Enter a container shell
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec db psql -U postgres -d tickets
```

### Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias dc='docker-compose'
alias dcu='docker-compose up -d'
alias dcd='docker-compose down'
alias dcl='docker-compose logs -f'
alias dcp='docker-compose ps'
alias dcr='docker-compose restart'
```

---

## Support & Help

**If you're stuck**:

1. Check logs: `docker-compose logs -f`
2. Review **Troubleshooting** section above
3. Read [README.md](./README.md) for detailed documentation
4. Check [SECURITY.md](./SECURITY.md) if it's a security issue
5. Open an issue on GitHub

**Common Questions**:

- **Q**: Do I need to install Python or Node.js?
  - **A**: No! Docker handles everything.

- **Q**: Can I run without Docker?
  - **A**: Yes, but it's much harder. See README "Development" section.

- **Q**: Where is my data stored?
  - **A**: In Docker volume `postgres_data`. Persists between restarts.

- **Q**: How do I update to latest code?
  - **A**: `git pull && docker-compose up --build -d`

---

## Congratulations! 🎉

You've successfully set up AI Support Hub!

Your application is now running at:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

**Enjoy building with AI Support Hub!** 🚀
