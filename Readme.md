# 📌 TaskNova – Task Management Platform

**TaskNova** is a full-stack task management system built with **Django** (backend) and **Angular** (frontend). It supports team collaboration with role-based task access, secure user authentication, and full admin control.

---

## 📁 Project Structure

TaskNova/
├── backend/ # Django backend
│ ├── account/ # User registration & login (JWT)
│ ├── task/ # Task model & views
| |__ frontend / # Angular serve build (production build output)
│ └── taskmanager/ # Main project (settings, URLs, WSGI)
| 
├── tasknova-ui/ # Angular frontend
│ ├── src/
│ │ ├── app/
│ │ │ ├── core/ # Shared logic
│ │ │ │ ├── guards/ # Route guards (auth/admin)
│ │ │ │ ├── services/ # Generic API + Auth services
│ │ │ │ └── interceptors/ # JWT interceptor
│ │ │ ├── layout/ # Header, Footer, Dashboard
│ │ │ └── features/
│ │ │ ├── auth/ # Login & Register
│ │ │ ├── department/ # Department views
│ │ │ ├── employee/ # Employee views
│ │ │ └── task/ # Task CRUD
└── README.md

---

## ⚙️ Backend (Django)

**Path:** `/backend`

### 🔧 Modules

- `account/`: User registration and JWT-based login
- `task/`: Task CRUD operations with status updates
- `taskmanager/`: Project configuration, URLs, settings

### 🚀 Setup Instructions

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

👤 Admin Credentials
Username: akash
Password: admin@123
Admin can manage all users, tasks, and departments.

👥 Normal User Capabilities
Register/login via API

View only their own tasks

Update only task status

⚙️ Serving Angular Build via Django
1. Build Angular for Production
bash
cd tasknova-ui
ng build --configuration production
This creates output in backend/frontend/.

🌐 Frontend (Angular)
Path: /tasknova-ui

🧱 Key Modules
core/

guards/: Auth & admin route guards

services/: Generic API methods + Auth service

interceptors/: JWT token injector

layout/: Header, Footer, Dashboard layout

features/

auth/: Login & Register pages

department/: Manage/view departments

employee/: Employee-related views

task/: Task create/edit/view

🚀 Setup Instructions
bash
cd tasknova-ui
npm install
ng serve
🔐 Authentication & Authorization
JWT-based login system

Routes protected using auth/admin guards

Token stored in local storage and auto-injected via interceptor

Django backend handles login, token issuance, and verification

✅ Features Overview
Role	Features
Admin	Full access: view all users & tasks, assign tasks, full CRUD
User	Register/login, view their tasks, update task status only

🔐 Admin Login:
Username: akash
Password: admin@123

👨‍💻 Author
Akash Khedekar
🔗 GitHub Profile
```
