# SecureVote (Frontend) 🗳️

The modern, responsive user interface for the SecureVote blockchain voting platform. Built with **Next.js 15**, **TypeScript**, and **Shadcn UI**.

> **Note:** This repository contains the **Frontend** code only. It requires a compatible FastAPI backend running locally to function completely.

<br />

### 🎥 Live Preview
[https://github.com/user-attachments/assets/49d3df52-5eb7-44a3-ba86-a3c9079cdf42](https://github.com/user-attachments/assets/338d7d69-94c7-479f-8ad3-1293e8fa7ddd)

<br />

## ✨ UI/UX Features

- **🎨 Premium Aesthetic:** "Linear-style" design with clean borders and high contrast.
- **🌙 Dark Mode:** Fully supported dark theme with smooth toggle animations.
- **⚡ Modal-Based Workflow:** 
  - **Auth:** Login and Register without leaving the page.
  - **Voting:** Cast votes and view results in a centered, glassmorphic dialog.
- **📱 Responsive:** Optimized for desktop and mobile layouts.
- **🔒 Secure Feedback:** Visual confirmation of transaction hashes and error handling.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives)
- **Icons:** Lucide React
- **State Management:** React Context API

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Install Dependencies
```bash
<<<<<<< HEAD
npm install
# or
yarn install
```

### 3. Environment Setup
By default, the application connects to a backend at `http://127.0.0.1:8000`. If your backend is running elsewhere, update `src/lib/mock-db.ts`:

```typescript
// src/lib/mock-db.ts
const API_URL = "http://YOUR_BACKEND_URL:PORT";
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔗 Backend Requirement

To log in, fetch elections, and cast votes, this frontend expects a FastAPI backend running locally.

Ensure your backend provides the following endpoints:
- `POST /token` (OAuth2 Login)
- `POST /api/auth/register`
- `GET /api/elections`
- `POST /api/votes`

## 📂 Project Structure

```
├── components.json          # Shadcn UI configuration
├── eslint.config.mjs        # ESLint configuration
├── next.config.ts           # Next.js configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── public/                  # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
└── src/
    ├── app/                 # Next.js App Router
    │   ├── admin/           # Admin Pages
    │   │   ├── create/      # Create Election Page
    │   │   │   └── page.tsx
    │   │   └── page.tsx     # Admin Dashboard
    │   ├── elections/       # Election Pages
    │   │   └── [id]/        # Dynamic Election Detail
    │   │       └── page.tsx
    │   ├── favicon.ico
    │   ├── globals.css      # Global Styles
    │   ├── layout.tsx       # Root Layout
    │   └── page.tsx         # Home/Dashboard Page
    ├── components/
    │   ├── modal/           # Modal Components
    │   │   ├── auth-modal.tsx      # Login/Register Modal
    │   │   └── election-modal.tsx  # Voting & Results Modal
    │   ├── navbar.tsx       # Navigation Bar
    │   ├── mode-toggle.tsx  # Dark Mode Toggle
    │   ├── theme-provider.tsx # Theme Context Provider
    │   └── ui/              # Shadcn UI Components
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── dialog.tsx
    │       ├── dropdown-menu.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── separator.tsx
    │       └── skeleton.tsx
    ├── context/
    │   └── auth-context.tsx # Authentication State Management
    └── lib/
        ├── apiClient.ts     # API Request Handler
        ├── mock-db.ts       # Backend API Configuration
        └── utils.ts         # Utility Functions
```

## 🤝 License

This project is open-source and available under the MIT License.
=======
cd Backend
# Create virtual env (optional but recommended)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
>>>>>>> 221855a (little changes in docs)
