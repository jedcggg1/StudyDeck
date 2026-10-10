---
name: studydeck-core
description: Protect StudyDeck's MVP workflows, local-first data model, spaced-repetition behavior, authentication boundaries, and persistence when implementing features or fixing bugs.
---

# StudyDeck Core Product Rules

Use this skill before changing data flows, Deck/Card features, study sessions, storage, import/export, authentication, or synchronization.

## MVP priority

The main product workflow is:

```text
create Deck → add Flashcard → study → rate recall → schedule next review
```

Keep this workflow reliable before adding secondary features such as cloud sync, notifications, sharing, AI generation, or social features.

## Required rules

1. Preserve the local-first behavior. Dexie/IndexedDB must remain usable without Supabase, a server, or an internet connection.
2. Keep `Deck`, `Flashcard`, `ReviewLog`, and `AppSettings` types consistent across database, pages, import/export, and state updates.
3. When deleting a Deck, also delete its Cards and Review Logs. When deleting a Card, also delete its Review Logs.
4. Do not change SM-2 scheduling rules casually. Any algorithm change must include or update focused tests in `src/services/sm2.test.ts`.
5. Validate imported JSON completely before writing anything to IndexedDB. A failed import must not partially overwrite existing data.
6. Keep React state and IndexedDB synchronized after create, update, delete, review, import, reset, and clear operations.
7. Supabase authentication is optional until environment variables are present. Keep the Offline Mode fallback working when keys are absent or the network fails.
8. Never put a Supabase `service_role` key in frontend code or a `VITE_` environment variable. Browser code may use only the publishable/anon key.
9. Treat cloud synchronization as a separate feature. Do not claim that local data is synced to Supabase until upload, download, conflict handling, and failure recovery are implemented and tested.
10. Prefer existing services and components. Add a dependency only when the existing code cannot reasonably support the required behavior.

## Do not

- Do not reset, wipe, migrate, or overwrite user data without an explicit confirmation and a recoverable path.
- Do not make Login mandatory for Offline Mode.
- Do not silently discard local data when a sync or import fails.
- Do not mix Deck/Card UI work with unrelated changes to the study algorithm.
- Do not mark a feature complete without checking the empty state, error state, refresh persistence, and mobile flow.

## Feature workflow

1. State the affected MVP flow and inspect the related types, database table, service, and page.
2. Write a short implementation plan and identify data migration or compatibility risks.
3. Make the smallest safe change; update IndexedDB and React state together.
4. Add or update tests for persistence-sensitive or SM-2-sensitive behavior.
5. Verify `npm run build` and `npm test -- --run` before reporting completion.
