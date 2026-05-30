# AI-Powered Cloud Development Platform

## Project Overview

This project is a full-stack AI-powered cloud development platform inspired by tools like Lovable, Replit AI, and modern AI-native IDE systems.

The platform allows users to generate, edit, preview, execute, and download complete software projects using natural language prompts.

Unlike traditional chatbot wrappers, this system dynamically provisions isolated development sandboxes using Kubernetes, streams AI-generated code in real time, provides a browser-based IDE, supports terminal access, synchronizes project files persistently, and manages infrastructure lifecycle automatically.

The system is built using a microservice-based architecture powered by the MERN stack, Kubernetes, Skaffold, WebSockets, Redis, RabbitMQ, and AI orchestration services.

---

# Core Objectives

The primary objective of this project was to build a scalable AI-native coding environment where users can:

* Generate projects using AI prompts
* Edit source code directly in the browser
* Run applications inside isolated environments
* Access a live terminal
* Preview generated applications instantly
* Persist project workspaces
* Download complete projects
* Maintain isolated user sandboxes dynamically

---

# Key Features

## AI Code Generation

* Natural language project generation
* Context-aware AI responses
* Streaming AI token responses
* File-aware project editing
* Autonomous file operations

## Browser-Based IDE

* Monaco Editor integration
* Syntax highlighting
* File explorer with folder tree
* Real-time file editing
* Save functionality

## Live Sandbox Environment

* Dedicated Kubernetes pod per user
* Runtime isolation
* Independent workspaces
* Live application preview

## Real-Time Terminal

* PTY-based shell access
* Interactive command execution
* Socket.IO streaming

## Authentication System

* Google OAuth integration
* JWT-based authentication
* Protected routes
* Persistent sessions

## Persistent File Synchronization

* Automatic file synchronization
* Workspace restoration
* MongoDB GridFS storage

## Project Export System

* ZIP archive generation
* Complete source code download

## Infrastructure Lifecycle Automation

* Redis expiration tracking
* Automatic sandbox cleanup
* Kubernetes resource deletion

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Monaco Editor
* Socket.IO Client
* React Markdown
* Lucide React

## Backend

* Node.js
* Express.js
* Socket.IO
* JWT Authentication
* Google OAuth
* PTY

## Infrastructure

* Kubernetes
* Docker
* Skaffold
* Redis
* RabbitMQ

## Database & Storage

* MongoDB
* GridFS

## AI Layer

* Mistral AI
* Agent-based orchestration system

---

# System Architecture

The project follows a distributed microservice architecture.

```txt
Frontend (React)
      ↓
Ingress / Proxy Layer
      ↓
Microservices
 ├── Auth Service
 ├── AI Orchestration Service
 ├── Sandbox Service
 ├── Notification Service
 └── Sandbox Agent
            ↓
      Kubernetes Cluster
            ↓
      User-Isolated Pods
            ↓
 MongoDB + Redis + RabbitMQ
```

---

# Frontend Architecture

The frontend acts as a browser-based cloud IDE interface.

## Major Components

### AI Chat Interface

Responsible for:

* Prompt input
* AI response rendering
* Markdown rendering
* Streaming response display
* Typing animations

### File Explorer

Responsible for:

* File tree rendering
* Folder navigation
* File selection
* Real-time updates

### Monaco File Editor

Responsible for:

* Editing source files
* Syntax highlighting
* Code saving
* Editor state management

### Preview Frame

Responsible for:

* Rendering live application preview
* Loading sandbox application URLs
* Displaying runtime output

### Terminal Component

Responsible for:

* Interactive terminal communication
* PTY socket handling
* Real-time shell rendering

### Authentication Context

Responsible for:

* User authentication state
* Token persistence
* Protected route management

---

# Backend Microservices

# 1. Authentication Service

Handles:

* Google OAuth flow
* JWT token generation
* User persistence
* Session management

## Responsibilities

* User creation
* User login
* Token validation
* Protected route authentication

---

# 2. AI Orchestration Service

This service is the intelligence layer of the platform.

## Responsibilities

* AI prompt handling
* Context gathering
* Tool invocation
* Response streaming
* File-aware AI reasoning

## Features

* Context-aware code generation
* Streaming AI responses
* Tool execution
* Autonomous project modification

---

# 3. Sandbox Service

Responsible for dynamic infrastructure provisioning.

## Responsibilities

* Kubernetes pod creation
* Service creation
* Sandbox lifecycle management
* Workspace initialization

## Features

* Dynamic isolated environments
* Pod readiness tracking
* Runtime provisioning
* Workspace volume mounting

---

# 4. Sandbox Agent

Runs inside every user sandbox.

## Responsibilities

* File operations
* Terminal execution
* Workspace inspection
* Code manipulation

## Features

* File listing
* File reading/writing
* PTY support
* Socket.IO communication

---

# 5. Notification Service

Handles asynchronous notifications.

## Responsibilities

* RabbitMQ queue consumption
* Email sending
* Event-driven communication

---

# Authentication Flow

```txt
User clicks "Continue with Google"
        ↓
Frontend sends request to:
/api/auth/google
        ↓
Ingress routes request
to Auth Service
        ↓
Auth Service initiates Google OAuth
        ↓
User authenticates with Google
        ↓
Google returns user details
        ↓
Auth Service validates user
        ↓
User added/updated in MongoDB
        ↓
JWT token generated
        ↓
Frontend receives token
        ↓
AuthContext updates auth state
        ↓
User redirected to dashboard
```

---

# AI Generation Flow

```txt
User enters prompt
        ↓
Frontend sends request
to AI Orchestration Service
        ↓
AI service gathers project context
        ↓
AI Agent receives:
- user prompt
- project files
- previous context
- tool definitions
        ↓
AI streams responses
through WebSockets
        ↓
Agent invokes file tools
inside sandbox
        ↓
Files created/updated
        ↓
Frontend refreshes editor
and preview automatically
```

---

# Sandbox Provisioning Flow

```txt
User opens workspace
        ↓
Frontend requests sandbox creation
        ↓
Sandbox Service initializes Kubernetes client
        ↓
Server creates:
- Pod
- Service
- Workspace volume
        ↓
Sandbox Agent container starts
        ↓
Init container prepares workspace
        ↓
Readiness checks begin
        ↓
Frontend receives pod status updates
        ↓
When ready:
- terminal enabled
- preview enabled
- AI enabled
```

---

# Terminal Communication Flow

```txt
User opens terminal
        ↓
Frontend establishes WebSocket
        ↓
Sandbox Agent creates PTY process
        ↓
Shell attached inside container
        ↓
Terminal input streamed
through Socket.IO
        ↓
PTY executes commands
        ↓
Output streamed back
to frontend in real time
```

---

# File Synchronization Flow

## Initial Design (AWS S3)

```txt
File changes detected
        ↓
Sync Agent uploads files to S3
        ↓
Workspace restoration downloads files
from S3 on startup
```

## Final Design (MongoDB GridFS)

```txt
File changes detected
        ↓
Watcher triggers sync event
        ↓
Files uploaded to MongoDB GridFS
        ↓
Workspace restoration queries files
from database
        ↓
Files restored locally
```

---

# Live Preview Flow

```txt
Application runs inside sandbox
        ↓
Kubernetes Service exposes runtime
        ↓
Ingress maps preview route
        ↓
Frontend iframe loads sandbox URL
        ↓
User sees live application preview
```

---

# Download Project Flow

```txt
User clicks Download
        ↓
Frontend requests export endpoint
        ↓
Backend scans workspace
        ↓
Files compressed into ZIP archive
        ↓
ZIP streamed to frontend
        ↓
Browser downloads project
```

---

# Sandbox Cleanup Flow

```txt
Sandbox created with Redis expiration key
        ↓
Redis key expires
        ↓
Expiration event detected
        ↓
Cleanup workflow triggered
        ↓
Kubernetes pod deleted
        ↓
Kubernetes service deleted
        ↓
Resources reclaimed automatically
```

---

# Kubernetes Usage

Kubernetes is the core infrastructure layer of the project.

## Kubernetes Responsibilities

* Pod orchestration
* Service routing
* Runtime isolation
* Sandbox lifecycle management
* Infrastructure scalability

## Kubernetes Components Used

* Pods
* Services
* Ingress
* Init Containers
* Volumes

---

# Skaffold Integration

Skaffold was used to streamline local Kubernetes development.

## Benefits

* Automatic rebuilds
* Multi-service orchestration
* Hot reload support
* Faster development workflow

---

# Real-Time Features

The platform heavily relies on WebSockets and Socket.IO.

## Real-Time Systems

* AI streaming responses
* Terminal communication
* File synchronization
* Sandbox status updates
* Activity logs

---

# Major Engineering Challenges Solved

## 1. Dynamic Kubernetes Provisioning

Creating isolated runtime environments per user dynamically.

## 2. Real-Time AI Streaming

Streaming AI-generated code while synchronizing file operations.

## 3. Persistent Workspace Synchronization

Maintaining project state across sandbox restarts.

## 4. Interactive PTY Terminal

Building browser-accessible real shell environments.

## 5. Infrastructure Lifecycle Automation

Automatically cleaning up expired sandbox resources.

---

# Project Evolution

## Initial Version

* Basic React frontend
* Simple Express backend
* Basic sandbox environment

## Intermediate Improvements

* AI orchestration service
* Kubernetes integration
* Real-time sockets
* Terminal support

## Advanced Features

* Authentication system
* Monaco Editor
* File synchronization
* Notification service
* Download system
* Redis lifecycle automation

---

# Why This Project Is Different

Most AI projects are:

* chatbot wrappers
* static code generators
* CRUD applications

This project goes significantly deeper by implementing:

* distributed microservices
* infrastructure orchestration
* isolated runtime execution
* AI agent tooling systems
* persistent cloud workspaces
* real-time terminal systems
* Kubernetes-based sandboxing

This makes the platform closer to a lightweight cloud IDE infrastructure system rather than a traditional MERN application.

---

# Resume Summary

Built a full-stack AI-powered cloud IDE platform inspired by modern AI-native development tools using MERN, Kubernetes, and microservice architecture. Implemented isolated Kubernetes sandbox provisioning, AI code generation orchestration, browser-based IDE editing with Monaco, PTY terminal streaming, real-time WebSocket communication, JWT and Google OAuth authentication, persistent workspace synchronization using MongoDB GridFS, Redis-based sandbox lifecycle automation, and downloadable project packaging.

---

# Future Improvements

## Planned Enhancements

* Multi-model AI support
* Collaborative editing
* Git integration
* CI/CD pipeline execution
* Workspace snapshots
* Team projects
* Deployment pipelines
* Resource quota management
* AI memory optimization

---

# Conclusion

This project demonstrates advanced full-stack engineering by combining:

* AI systems
* distributed microservices
* container orchestration
* real-time communication
* browser-based IDE tooling
* infrastructure automation

The platform successfully creates an AI-native cloud development environment capable of generating, executing, editing, synchronizing, and exporting complete software projects dynamically inside isolated Kubernetes sandboxes.
