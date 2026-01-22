# Jordan Family Adventure Tracker

## Project Overview
A family travel journal app for tracking adventures across South America. Users can post notes, photos, and view an itinerary by date.

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS (via CDN)
- **Backend**: Firebase Firestore (database) + Firebase Storage (photos)
- **Build**: Vite with vite-plugin-pwa
- **Hosting**: Vercel (auto-deploys on push to GitHub)

## Deployment
- Push to `main` branch triggers automatic Vercel deployment
- Firebase is only used for Firestore/Storage, NOT for hosting
- The `firebase.json` exists but is not used for deployment

## Offline Support
- **Firestore persistence**: Enabled via `persistentLocalCache` - caches all read data locally
- **PWA service worker**: Caches app shell, fonts, Tailwind CDN, and Firebase Storage images
- **Limitation**: Offline support is READ-ONLY. Users cannot create notes while offline.
- **Usage**: Users must browse content while online to cache it for offline viewing

## Future Offline Enhancement (Not Implemented)
If offline note creation is needed later:
- The `idb` library is already installed but unused
- Would need to create an IndexedDB queue for pending notes/photos
- See `utils/offlineQueue.ts` pattern in conversation history

## PWA Icons
Current icons (`public/icon-192.png`, `public/icon-512.png`) are simple indigo squares. Replace with proper branded icons when available.

## Key Files
- `firebase-config.ts` - Firebase initialization with offline persistence
- `vite.config.ts` - Vite + PWA plugin configuration with caching rules
- `context/NotesContext.tsx` - Notes state management with Firestore real-time sync
- `components/NoteForm.tsx` - Note submission with photo uploads
- `utils/imageUpload.ts` - Image compression and Firebase Storage upload
