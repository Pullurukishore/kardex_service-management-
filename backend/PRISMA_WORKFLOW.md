# Prisma Database Workflow Guide

## 🛠️ Development Commands

### Daily Development (Schema Changes)

```bash
# After editing schema.prisma, sync to local database
npx prisma db push

# Regenerate Prisma Client (usually auto-runs)
npx prisma generate

# Open visual database editor
npx prisma studio
```

### When Ready for Production Migrations

```bash
# Create a migration file (tracks changes for production)
npx prisma migrate dev --name describe_your_change

# Example names:
# npx prisma migrate dev --name add_user_phone
# npx prisma migrate dev --name remove_unused_tables
```

### Validation & Debugging

```bash
# Check if schema is valid
npx prisma validate

# Format schema file
npx prisma format

# View current database state
npx prisma db pull
```

---

## 🚀 Production Commands

### Deployment (CI/CD Pipeline)

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Apply pending migrations (SAFE - only applies new ones)
npx prisma migrate deploy
```

### Pre-Deployment Checklist

- [ ] Backup database before migration
- [ ] Test migration on staging first
- [ ] Review migration SQL files in `prisma/migrations/`

---

## ⚠️ DANGEROUS Commands (NEVER in Production)

| Command | Risk Level | What It Does |
|---------|------------|--------------|
| `prisma migrate reset` | ☠️ DEADLY | Drops ALL data, recreates DB |
| `prisma db push --force-reset` | ☠️ DEADLY | Same as above |
| `prisma migrate dev` | ⚠️ HIGH | May reset DB if drift detected |
| `prisma db push` | ⚠️ MEDIUM | Can drop columns without warning |

---

## 📋 Command Reference

| Environment | Command | Purpose |
|-------------|---------|---------|
| **Dev** | `npx prisma db push` | Quick schema sync (no migrations) |
| **Dev** | `npx prisma migrate dev --name xyz` | Create + apply migration |
| **Dev** | `npx prisma studio` | Visual DB editor |
| **Prod** | `npx prisma generate` | Build Prisma Client |
| **Prod** | `npx prisma migrate deploy` | Apply migrations safely |

---

## 🔒 Production Safety Rules

1. **ONLY** run `prisma migrate deploy` and `prisma generate` in production
2. **NEVER** run `prisma db push` or `prisma migrate dev` in production
3. **ALWAYS** backup before migrations: `pg_dump fsm_prod > backup.sql`
4. **TEST** migrations on staging environment first

---

## 🔄 Typical Workflows

### Adding a New Field

```bash
# 1. Edit schema.prisma
# 2. Sync to local DB
npx prisma db push

# 3. When ready, create migration for production
npx prisma migrate dev --name add_new_field
```

### Deploying to Production

```bash
# On production server / CI pipeline
npx prisma generate
npx prisma migrate deploy
```

### Recovering from Drift (Dev Only)

```bash
# If migrations get out of sync with DB
npx prisma db push  # Force sync current schema
```

---

## 📁 File Structure

```
prisma/
├── schema.prisma          # Your database schema
├── migrations/            # Migration history (git tracked)
│   ├── 20240125_init/
│   │   └── migration.sql
│   └── 20240126_add_field/
│       └── migration.sql
└── seed.ts               # Optional: seed data
```
