# Production Logging Configuration Guide

This guide explains how to control console logging in production environments for both frontend and backend.

## Overview

The application now has **automatic console log suppression** in production environments. All console.log statements will be automatically removed/disabled when running in production mode, significantly reducing noise in production logs.

## Backend Configuration

### How It Works

1. **Console Wrapper**: The backend uses a console wrapper (`src/utils/console-wrapper.ts`) that automatically disables console logs in production
2. **Winston Logger**: Structured logging is handled by Winston (`src/utils/logger.ts`) which writes to log files
3. **Automatic Activation**: The console wrapper is imported early in `src/server.ts` and automatically activates in production

### Environment Variables

Add these to your `.env` file:

```bash
# Set NODE_ENV to production
NODE_ENV=production

# Optional: Enable console logs in production (default: false)
ENABLE_CONSOLE_LOGS=false

# Set log level for Winston logger (error, warn, info, debug)
LOG_LEVEL=info
```

### Behavior in Production

When `NODE_ENV=production`:
- ✅ **console.log()** → Silent (no output)
- ✅ **console.info()** → Silent (no output)
- ✅ **console.debug()** → Silent (no output)
- ⚠️ **console.warn()** → Logged to Winston (logs/combined.log)
- ❌ **console.error()** → Logged to Winston (logs/error.log)

### Log Files

Winston creates log files in the `backend/logs/` directory:
- `error.log` - Only errors
- `combined.log` - All logs (info, warn, error)
- Files are automatically rotated (max 5MB per file, 5 files max)

### Override for Debugging

If you need to temporarily enable console logs in production:

```bash
ENABLE_CONSOLE_LOGS=true
```

## Frontend Configuration

### How It Works

1. **Webpack Terser Plugin**: Next.js build process automatically removes console statements
2. **Environment Control**: Can be controlled via `NEXT_PUBLIC_ENABLE_LOGS` environment variable
3. **Build-time Removal**: Console statements are stripped during the production build

### Environment Variables

Create/update `.env.production` or `.env.production.local`:

```bash
# Set to production mode
NODE_ENV=production

# Optional: Keep console logs in production build (default: false)
NEXT_PUBLIC_ENABLE_LOGS=false
```

### Behavior in Production Build

When building for production (`npm run build`):
- ✅ **console.log()** → Removed from bundle
- ✅ **console.info()** → Removed from bundle
- ✅ **console.debug()** → Removed from bundle
- ⚠️ **console.warn()** → Kept in bundle
- ❌ **console.error()** → Kept in bundle

### Configuration in next.config.js

The Terser plugin is configured to drop console statements:

```javascript
webpack: (config, { isServer, dev }) => {
  if (!dev) {
    config.optimization.minimizer.push(
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: process.env.NEXT_PUBLIC_ENABLE_LOGS !== 'true',
          },
        },
      })
    );
  }
  return config;
}
```

### Override for Debugging

If you need console logs in production build:

```bash
NEXT_PUBLIC_ENABLE_LOGS=true
npm run build
```

## Deployment Instructions

### For Production Deployment

1. **Backend**:
   ```bash
   cd backend
   
   # Set environment variables
   export NODE_ENV=production
   export ENABLE_CONSOLE_LOGS=false
   export LOG_LEVEL=info
   
   # Start server
   npm run start
   ```

2. **Frontend**:
   ```bash
   cd frontend
   
   # Build for production (console logs will be removed)
   npm run build
   
   # Start production server
   npm run start
   ```

### For Development

Development mode keeps all console logs enabled:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Verifying Log Suppression

### Backend Verification

1. Start backend in production mode:
   ```bash
   NODE_ENV=production npm run start
   ```

2. Check terminal output - should see minimal logs
3. Check `logs/combined.log` for structured logs

### Frontend Verification

1. Build for production:
   ```bash
   npm run build
   ```

2. Check build output - should see "Removing console logs"
3. Inspect production bundle - console statements should be absent

## Best Practices

### What to Log

❌ **Don't log**:
- User credentials or sensitive data
- Large objects or arrays
- Inside loops or frequently called functions
- Debug information in production

✅ **Do log**:
- Application startup/shutdown
- Critical errors with context
- Important state changes
- API request failures

### Using Winston Logger (Backend)

Instead of console.log, use the Winston logger:

```typescript
import { logger } from '@/utils/logger';

// Info level
logger.info('User logged in', { userId: user.id });

// Warning level
logger.warn('API rate limit approaching', { remaining: 10 });

// Error level
logger.error('Database connection failed', { error: err.message });
```

### Migration Strategy (Optional)

If you want to migrate existing console statements to use the logger utility:

**Frontend** (`src/lib/logger.ts`):
```typescript
import { logger } from '@/lib/logger';

// Replace console.log with logger.log
logger.log('Component mounted');
logger.info('Data fetched successfully');
logger.warn('Deprecated API used');
logger.error('Failed to load data');
```

**Backend** (already using Winston):
```typescript
import { logger } from '@/utils/logger';

logger.info('Server started');
logger.error('Database error', error);
```

## Troubleshooting

### Backend logs still showing in production

1. Check `NODE_ENV` is set to `production`
2. Verify `ENABLE_CONSOLE_LOGS` is not set to `true`
3. Restart the server after changing environment variables

### Frontend console logs still in production build

1. Check build output for Terser plugin execution
2. Verify `NEXT_PUBLIC_ENABLE_LOGS` is not set to `true`
3. Clear `.next` folder and rebuild:
   ```bash
   rm -rf .next
   npm run build
   ```

### Need to see logs temporarily

Set environment variable before starting:

```bash
# Backend
ENABLE_CONSOLE_LOGS=true npm run start

# Frontend
NEXT_PUBLIC_ENABLE_LOGS=true npm run build && npm run start
```

## Summary

✅ **Automatic**: Console logs are automatically suppressed in production
✅ **No Code Changes**: Existing code continues to work
✅ **Controllable**: Can be enabled via environment variables if needed
✅ **Production-Ready**: Reduces log noise and improves performance
✅ **Errors Preserved**: Important errors and warnings are still logged

Your production deployments will now have clean, minimal console output! 🎉
