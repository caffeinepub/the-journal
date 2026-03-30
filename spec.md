# The Journal

## Current State
- Multi-author blog with blob-storage for image uploads
- `imageUpload.ts` creates its own `HttpAgent` using `new HttpAgent(...)` constructor
- `backend.ts` creates agents using `HttpAgent.createSync(...)` which properly enables IC v3 call protocol
- `backend.d.ts` is outdated — `UserProfile` is missing `about` and `profilePicUrl` optional fields
- WritePostPage and EditPostPage catch upload errors silently (no actual error message shown)
- Profile save uses `as any` cast with manual Candid format for optional fields

## Requested Changes (Diff)

### Add
- Show actual error messages on upload failures in WritePostPage and EditPostPage

### Modify
- `imageUpload.ts`: Change `new HttpAgent(...)` to `HttpAgent.createSync(...)` — this enables the IC v3 sync response protocol which is required for the `getCertificate` call to work (the certificate is in the v3 response body)
- `backend.d.ts`: Add `about?: string` and `profilePicUrl?: string` to `UserProfile` to match `backend.ts` definition
- `useQueries.ts`: Simplify `useSaveProfile` — pass the profile fields directly matching the `UserProfile` type from `backend.ts` (which already has `about?: Array<string>` and `profilePicUrl?: Array<string>`)

### Remove
- Nothing

## Implementation Plan
1. Fix `imageUpload.ts`: replace `new HttpAgent({ host: config.backend_host, identity })` with `HttpAgent.createSync({ host: config.backend_host, identity })`
2. Fix `backend.d.ts`: add `about?: string` and `profilePicUrl?: string` to UserProfile (to match the actual backend.ts type)
3. Fix `WritePostPage.tsx` and `EditPostPage.tsx`: in catch blocks show the actual error message instead of generic string
4. Fix `EditProfilePage.tsx`: ensure error handling shows full error detail
5. Validate and build
