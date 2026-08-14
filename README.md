# Mini Assessment SPA

React + Vite client for the Mini Assessment Headless WordPress plugin.

## Features

- Vietnamese and English routes: `/vi` and `/en`.
- Public Assessment browsing with search and pagination.
- Question and Answer display, role-aware create actions and notifications.
- JWT access-token authentication with silent, rotating refresh-token sessions.

## Run locally

```bash
npm install
npm run dev
```

The app expects WordPress at `http://localhost:8081/wp-json`. Create `.env.local` to override it:

```text
VITE_API_BASE_URL=https://your-wordpress.example/wp-json
```

## Security

The browser stores only the short-lived access token in session storage. Refresh tokens are issued by WordPress as HttpOnly cookies and are never accessible to JavaScript. Do not commit `.env.local` or WordPress secrets.

## Verify

```bash
npm run lint
npm run build
```
