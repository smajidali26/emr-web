# EMR Web Application - Implementation Summary

## Overview
A modern Next.js 14 web application with TypeScript, implementing Azure AD B2C authentication for the EMR system.

## Key Features Implemented

### 1. Project Configuration
- **Next.js 14** with App Router architecture
- **TypeScript** with strict type checking
- **Tailwind CSS** for styling with custom design tokens
- **ESLint** for code quality
- Security headers configured in next.config.js

### 2. Authentication (Azure AD B2C)
- MSAL browser integration for Azure AD B2C
- Complete authentication flow:
  - Login page with Microsoft sign-in
  - OAuth callback handler
  - Token management (access, refresh, ID tokens)
  - Silent token acquisition
- User role management from token claims
- Protected route wrapper component

### 3. API Integration
- Type-safe HTTP client with automatic token injection
- TanStack Query for server state management
- Query client with caching and error handling
- Configurable request timeout and retry logic
- Support for GET, POST, PUT, PATCH, DELETE methods

### 4. State Management
- **Zustand** stores for client state:
  - Auth store: User authentication state
  - UI store: Sidebar, theme, loading states
- Persistent storage with localStorage
- DevTools integration for debugging

### 5. UI Components (shadcn/ui)
- Base components:
  - Button (multiple variants)
  - Input
  - Card (with header, content, footer)
  - Label
  - Spinner (loading indicator)
- Feature components:
  - Protected route wrapper
  - Sidebar navigation
  - Header with search
  - Error boundary

### 6. Application Structure
- **Route Groups:**
  - (auth): Login and callback pages
  - (dashboard): Protected dashboard pages
- **Layouts:**
  - Root layout with providers
  - Dashboard layout with sidebar and header
- **Pages:**
  - Home page (redirects to login/dashboard)
  - Login page
  - Callback page
  - Dashboard home
  - Error pages (404, unauthorized)
  - Global loading state

### 7. Utilities
- **Formatting:** Date, time, currency, phone numbers, file sizes
- **Validation:** Email, phone, URL, passwords, file types
- **Constants:** API endpoints, date formats, storage keys
- **Helpers:** Debounce, throttle, class name merging

### 8. Type Safety
- Comprehensive TypeScript types:
  - Authentication types (User, Roles, Tokens)
  - API types (Request, Response, Error)
  - Common types (Entity, Navigation, Toast)
- Centralized type exports

### 9. Error Handling
- Error boundary component for React errors
- Next.js error pages
- API error handling with typed responses
- User-friendly error messages

### 10. Custom Hooks
- **useAuth:** Authentication state and operations
- **useApi:** Type-safe API queries and mutations

## File Structure

```
D:\code-source\EMR\source\emr-web/
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
├── .gitignore
├── .env.local.example
├── README.md
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── unauthorized/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── label.tsx
│   │   │   ├── spinner.tsx
│   │   │   └── index.ts
│   │   └── features/
│   │       ├── protected-route.tsx
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       ├── error-boundary.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-api.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── api-client.ts
│   │   │   ├── query-client.ts
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   ├── msal-config.ts
│   │   │   ├── msal-instance.ts
│   │   │   ├── auth-service.ts
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── format.ts
│   │       ├── validation.ts
│   │       ├── constants.ts
│   │       ├── debounce.ts
│   │       └── index.ts
│   ├── stores/
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   └── index.ts
│   └── types/
│       ├── auth.types.ts
│       ├── api.types.ts
│       ├── common.types.ts
│       └── index.ts
└── public/
```

## Next Steps

1. **Install Dependencies:**
   ```bash
   cd D:\code-source\EMR\source\emr-web
   npm install
   ```

2. **Configure Environment:**
   - Copy `.env.local.example` to `.env.local`
   - Update Azure AD B2C configuration values

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Test Authentication:**
   - Navigate to http://localhost:3000
   - Should redirect to login page
   - Sign in with Azure AD B2C
   - Verify dashboard access

## Security Considerations

- All routes under `/dashboard` are protected
- Authentication tokens stored in localStorage
- HTTPS required in production
- Security headers configured
- Input validation on all forms
- XSS protection enabled
- Rate limiting with automatic retry (see below)

## Rate Limiting (SECURITY FIX: Task #2658)

### Server-Side Rate Limits

The EMR API enforces the following rate limits:

| Policy | Limit | Window | Applied To |
|--------|-------|--------|------------|
| Global | 100 requests | 1 minute | All endpoints (per IP) |
| Auth | 10 requests | 5 minutes | Login, register, CSRF token |
| Patient Search | 30 requests | 1 minute | Patient search & listing |

When a rate limit is exceeded, the server returns:
- HTTP 429 (Too Many Requests)
- JSON response: `{"code": "RATE_LIMITED", "message": "Too many requests...", "retryAfter": <seconds>}`
- `Retry-After` header with seconds until the limit resets

### Client-Side Rate Limit Handling

The client automatically handles 429 responses with:

#### API Client (`api-client.ts`)

1. **Automatic Retry**: Up to 3 retries with exponential backoff
2. **Retry-After Respect**: Uses server-provided `Retry-After` header when available
3. **Jitter**: Adds 20% random jitter to prevent thundering herd
4. **Maximum Delay**: Caps retry delay at 30 seconds
5. **Skip Option**: Use `skipRateLimitRetry: true` in request config to disable

```typescript
// Example: Disable automatic retry for a specific request
const response = await apiClient.get('/api/v1/patients', {
  skipRateLimitRetry: true
});
```

#### TanStack Query (`query-client.ts`)

1. **Query Retry**: 429 errors retry up to 2 additional times after api-client exhausts retries
2. **Mutation Retry**: 429 errors retry once for mutations
3. **Backoff Delay**: Uses same exponential backoff with jitter strategy
4. **Error Propagation**: RATE_LIMITED errors include `details.retryAfterSeconds`

### Handling Rate Limits in Components

```typescript
// Rate limit errors have this structure:
interface RateLimitError extends ApiError {
  code: 'RATE_LIMITED';
  statusCode: 429;
  details: {
    retryAfterSeconds?: number;
    endpoint: string;
    method: string;
  };
}

// Example: Show user-friendly message
const { error } = usePatients();
if (error?.code === 'RATE_LIMITED') {
  const retryIn = error.details?.retryAfterSeconds || 60;
  toast.error(`Too many requests. Please wait ${retryIn} seconds.`);
}
```

### Best Practices

1. **Batch Operations**: Group related API calls to reduce request count
2. **Debounce Search**: Use debounced input for search fields (already implemented)
3. **Cache Results**: TanStack Query caches results to avoid duplicate requests
4. **Monitor Console**: Rate limit hits are logged with `console.warn` for debugging

## Dependencies

### Core
- next: 14.2.18
- react: 18.3.1
- typescript: 5.3.3

### Authentication
- @azure/msal-browser: 3.7.1
- @azure/msal-react: 2.0.10

### Data Fetching
- @tanstack/react-query: 5.17.19
- @tanstack/react-query-devtools: 5.17.19

### State Management
- zustand: 4.4.7

### UI
- tailwindcss: 3.4.1
- @radix-ui/* (various components)
- lucide-react: 0.309.0
- class-variance-authority: 0.7.0

### Utilities
- date-fns: 3.0.6
- clsx: 2.1.0
- tailwind-merge: 2.2.0

## Implementation Notes

- All components are fully typed with TypeScript
- Uses Next.js 14 App Router (not Pages Router)
- Server components used where possible
- Client components marked with 'use client' directive
- Error boundaries wrap critical sections
- Loading states implemented for better UX
- Responsive design with Tailwind CSS
- Accessibility features included (aria labels, keyboard navigation)

## Feature #52 Compliance

This implementation fulfills Feature #52: User Authentication (Azure AD B2C) requirements:
- Azure AD B2C integration with MSAL
- Login/logout functionality
- Token management
- Protected routes
- Role-based access control
- User profile management
- Secure authentication flow
