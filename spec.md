# The Journal

## Current State
The app has a `ProfileSetupDialog` that opens after login when the user has no name set. The `WritePostPage` already gates writing behind authentication (shows a sign-in prompt if `!identity`). There is no first-visit welcome popup.

## Requested Changes (Diff)

### Add
- A `WelcomePopup` component that shows **once** on first site visit (tracked via localStorage key `journal_welcomed`)
- The popup has rephrased inspirational text (rephrase: "The best place to craft your creativity — sign up or enter your pen name to begin")
- An input field for the user's pen name (stored to localStorage as `journal_pending_penname`)
- A "Sign Up / Sign In" button that triggers `login()` from `useInternetIdentity`
- A "Maybe Later" dismiss option
- After login, if a pending pen name exists in localStorage, pre-populate it in `ProfileSetupDialog` and clear localStorage

### Modify
- `ProfileSetupDialog`: on mount, check localStorage for `journal_pending_penname` and pre-fill the name input with it, then clear it
- `App.tsx`: render `<WelcomePopup />` in the root layout
- Writing is already gated behind auth in `WritePostPage` — no change needed there

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/components/WelcomePopup.tsx` — shows once per visitor, has rephrased tagline, pen name input, sign-in CTA, and dismiss
2. Update `ProfileSetupDialog.tsx` to read `journal_pending_penname` from localStorage and pre-fill name
3. Update `App.tsx` to include `<WelcomePopup />`
