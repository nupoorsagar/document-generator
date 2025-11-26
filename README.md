# document-generator
# AI-Powered Business Document Generator

A full-stack web application that leverages AI to generate, refine, and export professional business documents in Microsoft Word (.docx) and PowerPoint (.pptx) formats.

## 🚀 Features

- **User Authentication**: Secure JWT-based registration and login system
- **AI Document Generation**: Generate complete documents using Google Gemini API
- **Smart Outline Creation**: AI-powered outline generation from simple topics
- **Interactive Refinement**: Iteratively improve content with natural language instructions
- **Multi-Format Support**: Export to Word (.docx) or PowerPoint (.pptx)
- **Project Management**: Save, organize, and manage multiple document projects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9 or higher** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16 or higher** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 12 or higher** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space

## 📦 Installation

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd document-generator

# Or download and extract the ZIP file
```

### Step 2: Database Setup

#### On Linux/macOS:

```bash
# Install PostgreSQL (if not already installed)
# Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS:
brew install postgresql
brew services start postgresql

# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE documentgen_db;
CREATE USER docgen_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE documentgen_db TO docgen_user;
\q
```

#### On Windows:

1. Download PostgreSQL installer from [official website](https://www.postgresql.org/download/windows/)
2. Run installer and follow setup wizard
3. Remember the password you set for the postgres user
4. Open **pgAdmin 4** or **SQL Shell (psql)**
5. Execute the following SQL commands:

```sql
CREATE DATABASE documentgen_db;
CREATE USER docgen_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE documentgen_db TO docgen_user;
```

### Step 3: Backend Installation

```bash
# Navigate to backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

### Step 4: Backend Configuration

Create a `.env` file in the `backend` directory:

```bash
# On Linux/macOS:
touch .env

# On Windows (in Command Prompt):
type nul > .env

# On Windows (in PowerShell):
New-Item .env -ItemType File
```

Edit the `.env` file with your configuration (see [Environment Variables](#environment-variables) section below).

### Step 5: Initialize Database Tables

```bash
# Make sure you're in the backend directory with virtual environment activated
cd app
python -c "from database import engine; from models import Base; Base.metadata.create_all(bind=engine)"
cd ..

# You should see no errors if successful
```

### Step 6: Frontend Installation

```bash
# Open a new terminal window
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# This may take a few minutes
```

## 🔐 Environment Variables

### Backend Environment Variables (.env)

Create a `.env` file in the `backend` directory with the following variables:

```bash
# Database Configuration
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL=postgresql://docgen_user:your_secure_password@localhost:5432/documentgen_db

# JWT Authentication Configuration
# Generate a secure secret key using: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-super-secret-jwt-key-min-32-characters-long-change-in-production

# JWT Algorithm (keep as HS256)
ALGORITHM=HS256

# Token expiration time in minutes
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-google-gemini-api-key-here
```

#### Detailed Variable Descriptions:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/dbname` | ✅ Yes |
| `SECRET_KEY` | Secret key for JWT token encryption (min 32 chars) | `k7Hn8mP2qR5tY9wX4cV6bN1zA3sD7fG0jH4lK8mP9qT2yU5xC7b` | ✅ Yes |
| `ALGORITHM` | JWT hashing algorithm | `HS256` | ✅ Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token validity duration | `30` | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI generation | `AIzaSyD...` | ✅ Yes |

#### How to Get Your Gemini API Key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key
5. Paste it in your `.env` file

#### Generate a Secure SECRET_KEY:

```bash
# Run this Python command to generate a secure key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Copy the output and use it as your SECRET_KEY
```

### Frontend Environment Variables (Optional)

If your backend runs on a different host/port, create a `.env` file in the `frontend` directory:

```bash
REACT_APP_API_URL=http://localhost:8000
```

## 🚀 Running the Application

### Starting the Backend

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Start the FastAPI server
python -m app.main

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

The backend API will be available at:
- **Main API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc

### Starting the Frontend

Open a **new terminal window** (keep the backend running):

```bash
# Navigate to frontend directory
cd frontend

# Start the React development server
npm start

# The browser should automatically open to http://localhost:3000
# If not, manually visit http://localhost:3000
```

The application will open in your default browser automatically.

### Verifying Installation

1. **Backend Health Check**: Visit http://localhost:8000/docs - you should see the API documentation
2. **Frontend**: Visit http://localhost:3000 - you should see the login page
3. **Test Registration**: Create a new account to verify database connectivity

## 📖 Usage Guide

### 1. Create an Account

1. Open http://localhost:3000
2. Click **"Register"**
3. Enter your email, username, and password
4. Click **"Register"** button
5. You'll be automatically logged in

### 2. Create a New Project

1. Click **"New Project"** button
2. Enter a **project title** (e.g., "Q4 Marketing Strategy")
3. Select **document type**: Word or PowerPoint
4. **Generate an outline** (two options):
   - **Option A**: Enter a topic and click "Generate Outline" (AI-powered)
   - **Option B**: Manually type or paste your outline
5. Click **"Create Project"**

### 3. Generate Document Content

1. Open your project from the dashboard
2. (Optional) Add additional instructions in the text area
3. Click **"Generate Content"**
4. Wait while AI generates content for each section
5. View the generated sections in the sidebar

### 4. Refine Content

1. Select a section from the sidebar
2. Review the generated content
3. In the "Refine This Section" area, enter instructions such as:
   - "Make it more formal"
   - "Add statistics and data"
   - "Shorten to 2 paragraphs"
   - "Include examples"
4. Click **"Refine Section"**
5. Review the updated content

### 5. Export Document

1. Once satisfied with your content
2. Click **"Export"** button in the top navigation
3. Your document will download automatically
4. Open with Microsoft Word or PowerPoint

## 📚 API Documentation

### Authentication Endpoints

#### Register New User
```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

#### Login
```http
POST /token
Content-Type: application/x-www-form-urlencoded

username=your_username&password=your_password
```

#### Get Current User
```http
GET /users/me
Authorization: Bearer <your_token>
```

### Project Endpoints

#### Create Project
```http
POST /projects
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "title": "Project Title",
  "document_type": "docx",
  "outline": "1. Introduction\n2. Main Content\n3. Conclusion"
}
```

#### List All Projects
```http
GET /projects
Authorization: Bearer <your_token>
```

#### Get Single Project
```http
GET /projects/{project_id}
Authorization: Bearer <your_token>
```

#### Update Project
```http
PUT /projects/{project_id}
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "outline": "Updated outline"
}
```

#### Delete Project
```http
DELETE /projects/{project_id}
Authorization: Bearer <your_token>
```

### AI Generation Endpoints

#### Generate Outline
```http
POST /generate-outline?topic=Marketing%20Strategy&document_type=docx
Authorization: Bearer <your_token>
```

#### Generate Content
```http
POST /generate-content/{project_id}
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "outline": "Your outline here",
  "document_type": "docx",
  "additional_instructions": "Make it professional"
}
```

#### Refine Section
```http
POST /refine-section/{section_id}
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "section_id": 1,
  "current_content": "Current section content",
  "refinement_instructions": "Make it more concise"
}
```

#### Export Document
```http
GET /export/{project_id}
Authorization: Bearer <your_token>
```

## 🔍 Troubleshooting

### Common Issues and Solutions

#### 1. Backend won't start - "Database connection error"

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list  # macOS

# Start PostgreSQL if not running
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS

# Verify database exists
psql -U docgen_user -d documentgen_db -h localhost

# If connection refused, check DATABASE_URL in .env file
```

#### 2. Backend won't start - "ModuleNotFoundError"

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

#### 3. Frontend shows "Network Error"

**Error**: API calls failing with network error

**Solution**:
```bash
# 1. Verify backend is running on port 8000
curl http://localhost:8000/docs

# 2. Check CORS settings in backend/app/main.py
# Ensure allow_origins includes "http://localhost:3000"

# 3. Check API_BASE_URL in frontend/src/services/api.ts
```

#### 4. Frontend won't start - "Port 3000 already in use"

**Error**: `Something is already running on port 3000`

**Solution**:
```bash
# Option 1: Kill the process using port 3000
# Linux/macOS:
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Option 2: Use a different port
PORT=3001 npm start
```

#### 5. "Invalid API Key" error

**Error**: AI generation fails with invalid API key

**Solution**:
```bash
# 1. Verify your Gemini API key is correct
# Visit https://makersuite.google.com/app/apikey

# 2. Check .env file has correct format (no quotes)
GEMINI_API_KEY=AIzaSyD...

# 3. Restart backend after updating .env
```

#### 6. Database migration issues

**Error**: Tables don't exist or schema errors

**Solution**:
```bash
# Recreate database tables
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

cd app
python -c "from database import engine; from models import Base; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"
cd ..
```

#### 7. npm install errors

**Error**: Package installation failures

**Solution**:
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Getting Help

If you encounter issues not covered here:

1. Check the backend logs in the terminal where you ran `python -m app.main`
2. Check the browser console (F12) for frontend errors
3. Visit the API documentation at http://localhost:8000/docs for endpoint testing
4. Ensure all environment variables are correctly set

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Browser                        │
│                    (localhost:3000)                     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     ↓
┌─────────────────────────────────────────────────────────┐
│              FastAPI Backend Server                     │
│                 (localhost:8000)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Authentication Layer (JWT)                      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                            │  │
│  │  - Project Management                            │  │
│  │  - Content Generation                            │  │
│  │  - Document Assembly                             │  │
│  └──────────────────────────────────────────────────┘  │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
             ↓                       ↓
┌────────────────────────┐  ┌───────────────────────┐
│  PostgreSQL Database   │  │   Google Gemini API   │
│    (localhost:5432)    │  │   (AI Content Gen)    │
│                        │  │                       │
│  - Users               │  │  - Outline Gen        │
│  - Projects            │  │  - Content Gen        │
│  - Sections            │  │  - Refinement         │
└────────────────────────┘  └───────────────────────┘
```

## 🔒 Security Considerations

### Production Deployment Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` to a cryptographically secure random string
- [ ] Use environment-specific configuration files
- [ ] Enable HTTPS/SSL certificates
- [ ] Update CORS `allow_origins` to your production domain
- [ ] Use strong database passwords
- [ ] Implement rate limiting on API endpoints
- [ ] Set up proper firewall rules
- [ ] Enable database backups
- [ ] Use environment variables (never commit .env files)
- [ ] Implement logging and monitoring
- [ ] Add input validation and sanitization
- [ ] Set up automated security updates

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📞 Support

For questions or issues:
- Check the [Troubleshooting](#troubleshooting) section
- Review API documentation at http://localhost:8000/docs
- Open an issue on the project repository

---

**Happy Document Generating! 🎉**
