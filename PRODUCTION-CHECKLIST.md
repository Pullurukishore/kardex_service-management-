# Production Deployment Checklist

## 🚀 Quick Production Setup

### Backend

```bash
cd backend

# 1. Set environment variables in .env
NODE_ENV=production
ENABLE_CONSOLE_LOGS=false
LOG_LEVEL=info

# 2. Build and start
npm run build
npm run start
```

### Frontend

```bash
cd frontend

# 1. Create .env.production.local
NODE_ENV=production
NEXT_PUBLIC_ENABLE_LOGS=false
NEXT_PUBLIC_API_URL=https://your-api-url.com

# 2. Build and start
npm run build
npm run start
```

## ✅ Verification Steps

### 1. Check Console Output

**Backend**:
- ✅ Should see minimal startup logs
- ✅ No debug/info console.log statements
- ✅ Only errors and warnings visible

**Frontend**:
- ✅ Build should complete without console statements
- ✅ Browser console should be clean
- ✅ No development logs visible

### 2. Check Log Files (Backend)

```bash
# Check if log files are being created
ls backend/logs/

# Should see:
# - error.log (errors only)
# - combined.log (all logs)

# View recent logs
tail -f backend/logs/combined.log
```

### 3. Test in Browser

1. Open browser DevTools (F12)
2. Navigate through the application
3. Console should be clean (no debug logs)
4. Only errors/warnings should appear

## 🔧 Environment Variables Reference

### Backend (.env)

| Variable | Production Value | Description |
|----------|-----------------|-------------|
| `NODE_ENV` | `production` | Enables production mode |
| `ENABLE_CONSOLE_LOGS` | `false` | Disables console logs |
| `LOG_LEVEL` | `info` | Winston log level |

### Frontend (.env.production.local)

| Variable | Production Value | Description |
|----------|-----------------|-------------|
| `NODE_ENV` | `production` | Enables production mode |
| `NEXT_PUBLIC_ENABLE_LOGS` | `false` | Removes console from build |
| `NEXT_PUBLIC_API_URL` | Your API URL | Backend endpoint |

## 🐛 Troubleshooting

### Logs still showing?

**Backend**:
```bash
# Check environment
echo $NODE_ENV  # Should be 'production'
echo $ENABLE_CONSOLE_LOGS  # Should be 'false' or empty

# Restart server
npm run start
```

**Frontend**:
```bash
# Clear build cache
rm -rf .next

# Rebuild
npm run build

# Check build output for "Removing console logs"
```

### Need logs temporarily?

**Backend**:
```bash
ENABLE_CONSOLE_LOGS=true npm run start
```

**Frontend**:
```bash
NEXT_PUBLIC_ENABLE_LOGS=true npm run build
```

## 📊 What Gets Logged?

### Production Logging Behavior

| Statement | Backend | Frontend |
|-----------|---------|----------|
| `console.log()` | ❌ Silent | ❌ Removed |
| `console.info()` | ❌ Silent | ❌ Removed |
| `console.debug()` | ❌ Silent | ❌ Removed |
| `console.warn()` | ⚠️ Winston | ⚠️ Kept |
| `console.error()` | ❌ Winston | ❌ Kept |

### Winston Log Files (Backend)

- **error.log**: Only errors (auto-rotated, max 5MB)
- **combined.log**: All logs (auto-rotated, max 5MB)
- **Max files**: 5 per type (oldest deleted automatically)

## 🎯 Quick Commands

```bash
# Setup logging configuration
./setup-production-logging.ps1

# Build both frontend and backend
npm run build --workspaces

# Start production servers
cd backend && npm run start &
cd frontend && npm run start

# View backend logs
tail -f backend/logs/combined.log

# Check for console statements in code (optional cleanup)
grep -r "console\." frontend/src/ | wc -l
grep -r "console\." backend/src/ | wc -l
```

## 📖 Full Documentation

See [LOGGING-GUIDE.md](./LOGGING-GUIDE.md) for complete documentation.

---

**Remember**: Console logs are automatically disabled in production. No code changes needed! 🎉
