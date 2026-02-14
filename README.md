# JR-50-Invictus

## Backend Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Create environment file

Create `.env` in root and copy contents from `.env.example`.

Update DB password.

### 3. Create PostgreSQL database

Open terminal:

```bash
psql -U postgres
```

Run:

```sql
CREATE DATABASE pcb_inventory;
```

Exit:

```
\q
```

### 4. Run server
```bash
npm run dev
```

Server runs at:

http://localhost:5000 