# PeasiProfile — AI-Powered Resume Builder

**Build a resume that tells your story and helps you take the next step in your career.**

PeasiProfile is an AI-powered resume-building and career preparation platform designed to help students, fresh graduates, and job seekers create professional resumes, improve their content, and prepare for opportunities.

It combines an interactive resume editor, customizable templates, AI-assisted career tools, and cloud-backed user accounts in one application.

## ✨ Features

### Resume Builder
- Interactive resume editor with a live preview.
- Multiple resume templates and customization options.
- Manage education, experience, projects, skills, certifications, and other sections.
- Customize fonts, colors, spacing, and layouts.
- Export resumes as PDF.
- Save and manage resume data.

### AI-Powered Career Tools
- AI-assisted resume writing and content improvement.
- ATS-oriented resume analysis.
- Job-description matching and resume improvement suggestions.
- AI-assisted cover letter generation.
- Career preparation and readiness tools.

*AI features depend on the configured server-side AI provider and environment variables.*

### Accounts and Cloud Services
- Email and password authentication.
- Google sign-in.
- Password recovery.
- Firebase Firestore integration for user and resume data.
- User-scoped database security rules.
- Server-side AI requests through OpenRouter.

### User Experience
- Responsive interface.
- Modern React-based architecture.
- Interactive UI components and animations.
- Client-side resume editing and local draft support where implemented.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI development |
| TypeScript | Type-safe application code |
| TanStack Start | Full-stack React framework and server functions |
| TanStack Router | File-based routing |
| Vite | Development and build tooling |
| Tailwind CSS v4 | Styling |
| Nitro | Server runtime and deployment output |
| Firebase Authentication | User authentication |
| Cloud Firestore | Cloud data persistence |
| OpenRouter | AI model API access |
| Zod | Schema validation where implemented |
| Motion | UI animations |

## 🏗️ Architecture

PeasiProfile uses a hybrid architecture:

- **Frontend:** React components, routes, and interactive resume tools.
- **Server-side layer:** TanStack Start server functions for supported server operations, including AI requests.
- **AI provider:** OpenRouter, accessed from server-side code.
- **Authentication and database:** Firebase Authentication and Firestore.
- **Local persistence:** Browser storage for supported local data and draft workflows.

The application does not require a separate Express server. Server-side functionality is provided through the TanStack Start and Nitro stack.

## 📂 Project Structure

```text
PeasiProfile/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── landing/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── ai-service.ts
│   │   ├── ai-server.ts
│   │   ├── firebase.ts
│   │   └── resume-service.ts
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── dashboard.tsx
│   │   ├── builder.tsx
│   │   └── resumes/
│   └── server.ts
├── public/
├── firestore.rules
├── storage.rules
├── env.example
├── FIREBASE_SETUP.md
├── package.json
└── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20 or a compatible newer version.
- npm.
- A Firebase project for cloud authentication and database features.
- An OpenRouter API key for AI-powered features.

### 1. Clone the repository

```bash
git clone https://github.com/shreeyash-thakur/PeasiProfile.git
cd PeasiProfile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `env.example` to `.env` and configure the required values.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

OPENROUTER_API_KEY=
SITE_URL=
```

Obtain the Firebase configuration from your Firebase Console and your AI API key from OpenRouter.

**Security:** Never commit `.env` files or expose `OPENROUTER_API_KEY` through a `VITE_`-prefixed variable. The OpenRouter key must remain server-side.

### 4. Configure Firebase

1. Create a project in the Firebase Console.
2. Register a web application.
3. Enable Email/Password and Google authentication.
4. Create a Cloud Firestore database.
5. Configure Firestore and Storage rules using the repository's rule files, after reviewing them for your deployment.
6. Configure authorized domains and any required provider settings.

Refer to `FIREBASE_SETUP.md` for additional setup instructions.

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### 6. Build for production

```bash
npm run build
npm run preview
```

The application uses Vite and Nitro for its production build. Select a hosting platform that supports the generated server output and configure its environment variables before deployment.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run build:dev` | Create a development-mode build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format project files with Prettier |

## 🔐 Security Notes

- Keep private API keys in server-side environment variables.
- Review Firestore and Storage security rules before production deployment.
- Ensure authenticated users can access only their own private data.
- Do not treat client-side route guards as a replacement for backend authorization.
- Review AI request validation, rate limiting, and error handling before exposing the application publicly.
- Avoid storing sensitive information in browser storage unless the implications are understood.

## 🗺️ Roadmap

Potential areas for future development include:

- More resume templates and customization options.
- Improved ATS analysis and job-specific recommendations.
- Better resume version management.
- Expanded AI-assisted interview and career preparation tools.
- Automated evaluation of resume quality.
- Performance, accessibility, and mobile experience improvements.

Roadmap items are plans, not claims that these features are already implemented.

## 🤝 Contributing

Contributions, suggestions, bug reports, and feature requests are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Open a pull request describing the changes.

## 📄 License

No open-source license is specified here. Check the repository's license status before redistributing or using the project commercially.

## 👨‍💻 Author

**Shreeyash Thakur**

GitHub: [@shreeyash-thakur](https://github.com/shreeyash-thakur)

Project: [PeasiProfile](https://github.com/shreeyash-thakur/PeasiProfile)

---

*PeasiProfile is being developed to make professional resume creation and career preparation more accessible to students and job seekers.*
