# EMR Web Application

Modern Electronic Medical Records (EMR) web application built with Next.js 14, TypeScript, and Azure AD B2C authentication.

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Authentication:** Azure AD B2C (MSAL)
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React

## Project Structure

```
emr-web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Authentication routes
│   │   │   ├── login/              # Login page
│   │   │   └── callback/           # OAuth callback
│   │   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── error.tsx               # Error page
│   │   ├── loading.tsx             # Loading page
│   │   └── providers.tsx           # App providers
│   ├── components/
│   │   ├── ui/                     # Base UI components
│   │   └── features/               # Feature components
│   ├── hooks/                      # Custom React hooks
│   ├── lib/
│   │   ├── api/                    # API client
│   │   ├── auth/                   # MSAL authentication
│   │   └── utils/                  # Utility functions
│   ├── stores/                     # Zustand stores
│   └── types/                      # TypeScript types
└── public/                         # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Azure AD B2C tenant configured
- Access to the EMR backend API

### Installation

1. Navigate to the project directory:
```bash
cd D:\code-source\EMR\source\emr-web
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Copy `.env.local.example` to `.env.local` and update with your Azure AD B2C settings.

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Features

- Azure AD B2C authentication with MSAL
- Protected routes with role-based access control
- Responsive dashboard layout
- Type-safe API client
- State management with Zustand
- Data fetching with TanStack Query
- Modern UI with Tailwind CSS and shadcn/ui

## License

Proprietary - All rights reserved
