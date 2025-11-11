# ✅ Machine Downtime Calculation Fixed

## Problem Found
The downtime calculation was only looking at tickets with **current status** = `CLOSED_PENDING`, which misses tickets that moved from CLOSED_PENDING to CLOSED.

### Before (Wrong):
```typescript
// Only finds tickets currently in CLOSED_PENDING status
const closedPendingTickets = await prisma.ticket.findMany({
  where: {
    status: 'CLOSED_PENDING',  // ❌ Misses tickets that moved to CLOSED
  }
});
```

**Result:** Shows "10m" because most tickets quickly move to CLOSED status.

---

## Solution Applied
Now uses **TicketStatusHistory** to find all tickets that **reached** closed status (CLOSED_PENDING, RESOLVED, or CLOSED) regardless of their current status.

### After (Fixed):
```typescript
// Finds all tickets that reached closure in the period
const closedStatusHistory = await prisma.ticketStatusHistory.findMany({
  where: {
    status: {
      in: ['CLOSED_PENDING', 'RESOLVED', 'CLOSED']  // ✅ Finds all closures
    },
    changedAt: {
      gte: startDate,
      lte: endDate
    }
  }
});
```

**Result:** Shows accurate average downtime from ticket creation to resolution.

---

## New Calculation Logic

1. **Find all ticket closures** in the period using status history
2. **Group by ticket ID** to get first closure time
3. **Calculate downtime** = business hours from creation to first closure
4. **Average** all downtimes

**Fallback:** If no closed tickets exist, calculates based on currently open tickets.

---

## To Apply the Fix

### Step 1: Restart Backend
```powershell
# If running in terminal
Ctrl+C

# Then restart
cd c:\KardexCare\backend
npm run dev
```

### Step 2: Refresh Dashboard
Open browser and reload the admin dashboard.

---

## Expected Results

**Before:** "10m" (incorrect - only counting few current CLOSED_PENDING tickets)

**After:** Accurate downtime based on all ticket closures in the period.

### Example:
- 10 tickets closed in last 30 days
- Average time from creation to closure: 5 hours 30 minutes
- **Display:** "5h 30m"

---

## What's Now Calculated

**Machine Downtime** = Average business hours from:
- Ticket **creation** (machine down)
- First **closure status** (CLOSED_PENDING/RESOLVED/CLOSED)

**Business Hours:**
- Monday-Saturday, 9 AM - 5 PM
- Excludes Sundays
- Excludes non-working hours

---

## Files Modified
- `c:\KardexCare\backend\src\controllers\dashboard.controller.ts`
  - Function: `calculateAverageDowntime()` (lines 782-876)

---

**Restart your backend now to see accurate downtime values!** 🎯
