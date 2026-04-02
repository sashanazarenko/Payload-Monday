# Running the prototype

From this folder:

```bash
npm run dev
```

Vite will:

- Listen on **all interfaces** (`host: true`), so use whichever works in your browser:
  - **http://127.0.0.1:&lt;port&gt;/**
  - **http://localhost:&lt;port&gt;/**
  - The terminal also prints a **Network** URL if you need it.
- Use port **5173** by default; if something else is using it, the next free port is used automatically (watch the terminal for the exact URL).
- Try to **open your browser** automatically (`open: true`).

If the page still won’t load:

1. Check the terminal for the exact `Local:` URL (port may not be 5173).
2. Stop other dev servers: `lsof -i :5173` then `kill <pid>` (macOS/Linux).
3. Run with an explicit port: `npx vite --port 3000 --host`
