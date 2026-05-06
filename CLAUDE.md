# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start Vite dev server (HMR)
pnpm build        # Type-check then production build
pnpm preview      # Preview production build
pnpm lint         # ESLint with auto-fix and cache
pnpm format       # Prettier format src/
```

The project has no test suite. There is no vitest config or test files.

## Architecture

**pwdm-fe** is a Vue 3 password manager SPA. Backend (Java 21) is at `D:\Project\java\Java21\pwdm`, runs at `localhost:8080` with cookie-based auth.

### Directory roles

- `src/main.ts` — App entry: creates Vue app, installs Pinia → Router → Element Plus (zh-cn locale) → globally registers all Element Plus icons, then mounts.
- `src/router/index.ts` — All routes lazy-loaded. A `beforeEach` guard redirects unauthenticated users to `/login` (checks `useUserStore().user`). After-login redirect uses `returnUrl` query param.
- `src/stores/` — Pinia with `pinia-plugin-persistedstate`. Two stores:
  - `user` store — Holds `User` object; persisted to localStorage.
  - `vault` store — Manages master encryption key lifecycle. `isUnlocked`, `masterKey` (CryptoKey, memory-only), `kdfConfig`. Provides `setupVaultWithKeyFile`, `unlock`, `lock`, `saveRecord`, `readRecord`. The `isUnlocked` is exposed as a computed.
- `src/services/` — Thin wrappers around the Axios instance. Each file corresponds to a backend controller (`user.ts` → auth/user endpoints, `account.ts` → CRUD for password entries, `keystore.ts` → KDF config/verification).
- `src/utils/request.ts` — Axios instance with response interceptor: extracts `res.data` on success (`code === 0`), shows `ElMessage.error` on business failure, handles 401 by clearing user store and redirecting to `/login`, handles timeout/network errors.
- `src/crypto/` — Cryptographic primitives:
  - `helper.ts` — Base64 ↔ ArrayBuffer conversion, random byte generation.
  - `argon2Api.ts` — `Argon2Api` class: derives AES-GCM master key via Argon2id (PIN + key file content), encrypts/decrypts individual records.
- `src/composable/` — Reusable Vue composition components (e.g., `RandomPassword.vue` — a full-featured password generator dialog with strength analysis).
- `src/types/` — TypeScript interfaces for API DTOs/VOs and crypto types.

### Layout

The app shell is `views/Layout/index.vue` which composes `LayoutAside` (sidebar with collapsible menu) + `LayoutHeader` (breadcrumbs + user dropdown) + `LayoutMain` (router-view) + `LayoutFooter`. The aside collapse state is managed locally in the layout and passed down via props.

### Encryption model

Sensitive account fields (password, recovery codes, 3× security Q&A pairs) are individually encrypted with AES-GCM. Each field has its own IV stored alongside the ciphertext. The master AES key is derived via Argon2id from a user PIN concatenated with a 512-bit random key file (`.pmk`). The KDF config (salt, iterations, memory, parallelism) is stored server-side. The master key only exists in memory as a `CryptoKey` object and is cleared on lock.

Before any operation that reads/writes encrypted data, components call `checkAndRequestMasterKey()` which prompts the `DecryptKeyDialog` if the vault is locked — it awaits user PIN + `.pmk` file upload to derive and verify the master key.

### API conventions

All endpoints return `{ code: number, msg: string, data: T }`. The Axios interceptor unwraps `data` on `code === 0` and treats other codes as errors. GET requests pass params via `params`, all other methods use `data` body. The `request()` helper is typed: `request<T>(url, method, submitData?)` returns `Promise<Data<T>>`.
