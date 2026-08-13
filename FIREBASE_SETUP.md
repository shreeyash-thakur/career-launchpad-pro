# Firebase setup

This adds email/password + Google login, signup, a Firestore backend, and
Firebase Storage to CareerGPT.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com → **Add project**.
2. Once created, click the **web icon (`</>`)** to register a web app.
3. Copy the config values shown into a new `.env` file at the project root
   (copy `.env.example` → `.env` and fill it in).

## 2. Enable sign-in methods

Firebase Console → **Build → Authentication → Sign-in method** → enable:

- **Email/Password**
- **Google**

## 3. Create Firestore

Firebase Console → **Build → Firestore Database → Create database** (start in
production mode). Then go to the **Rules** tab and paste in the contents of
`firestore.rules` from this repo.

## 4. Enable Storage

Firebase Console → **Build → Storage → Get started**. Then in the **Rules**
tab, paste in the contents of `storage.rules` from this repo.

## 5. Install & run

```bash
npm install
npm run dev
```

Visit `/signup` to create an account, or `/login` to sign in. The navbar
automatically shows a Log in / Sign up free CTA when signed out, and an
avatar menu with Log out when signed in.

## What was added

| File | Purpose |
| --- | --- |
| `src/lib/firebase.ts` | Firebase app/auth/firestore/storage init (SSR-safe) |
| `src/lib/storage.ts` | Upload helpers for Firebase Storage |
| `src/lib/auth-errors.ts` | Friendly error messages for auth failures |
| `src/contexts/AuthContext.tsx` | `useAuth()` — signUp, logIn, logInWithGoogle, logOut, resetPassword |
| `src/components/auth/*` | Login/Signup/Forgot-password forms + shared themed shell + `<ProtectedRoute>` guard |
| `src/routes/login.tsx`, `signup.tsx`, `forgot-password.tsx` | New pages |
| `src/routes/__root.tsx` | Wrapped in `<AuthProvider>`, mounted toast notifications |
| `src/components/landing/navbar.tsx` | Auth-aware nav CTAs |

## Gating a route behind login

Any route's `component` can be wrapped:

```tsx
import { ProtectedRoute } from "@/components/auth/protected-route";

function BuilderPage() {
  return (
    <ProtectedRoute>
      <BuilderContent />
    </ProtectedRoute>
  );
}
```

This wasn't applied to `/builder` or `/onboarding` — per the existing FAQ copy
("No account needed to try it... only needed to save, sync and export"),
those stay open. Wrap them if you'd rather require login upfront.

## Saving user data (next step)

`users/{uid}` profile docs are created automatically on signup/Google
sign-in. To persist resumes per-account, add a Firestore collection (e.g.
`resumes/{resumeId}` with a `uid` field) and scope security rules to
`request.auth.uid`, following the same pattern as `firestore.rules`.
