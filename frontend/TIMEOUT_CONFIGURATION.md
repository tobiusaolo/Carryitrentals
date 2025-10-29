# ⏱️ API Timeout Configuration

## Overview

API timeouts have been increased to prevent false error popups during slow operations like image uploads, complex data processing, and operations on slow network connections.

---

## ⚙️ Global Timeout Settings

### authService.js (Base Configuration)

**Previous:** 30 seconds (30,000ms)  
**New:** 2 minutes (120,000ms)

**Impact:** All API calls now have 2 minutes to complete before timing out.

**File:** `frontend/src/services/authService.js`
```javascript
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes
});
```

---

## 📝 Specific Operation Timeouts

### Unit Operations (`unitAPI.js`)

| Operation | Timeout | Reason |
|-----------|---------|--------|
| `createUnit` | 2 min (120s) | Complex unit data processing |
| `createRentalUnit` | 2 min (120s) | Complex rental data + initial setup |
| `uploadUnitImages` | 3 min (180s) | Multiple large image uploads |
| `uploadRentalUnitImages` | 3 min (180s) | Multiple large image uploads (5+ images) |

### Agent Operations (`agentAPI.js`)

| Operation | Timeout | Reason |
|-----------|---------|--------|
| `createAgent` | 2 min (120s) | Agent data + profile images + NIN images |
| `updateAgent` | 2 min (120s) | Updated images and documents |

### Property Operations (`propertyAPI.js`)

| Operation | Timeout | Reason |
|-----------|---------|--------|
| `createProperty` | 2 min (120s) | Complex property data |
| `updateProperty` | 2 min (120s) | Property updates with images |

### Tenant Operations (`tenantAPI.js`)

| Operation | Timeout | Reason |
|-----------|---------|--------|
| `createTenant` | 2 min (120s) | Tenant data + agreements |
| `uploadNationalIdImages` | 3 min (180s) | National ID front/back images |

---

## ✅ Benefits

### Before (30s timeout):
- ❌ Timeout errors on slow networks
- ❌ False "failed" messages when data was actually saved
- ❌ Poor UX on image uploads
- ❌ Users confused by timeout vs actual errors

### After (120s/180s timeout):
- ✅ Sufficient time for large uploads
- ✅ Accurate error messages (only real failures)
- ✅ Better UX on slow connections
- ✅ Users see loading states instead of errors
- ✅ Operations complete successfully

---

## 🎯 Operation Time Estimates

Based on typical operations:

| Operation | Typical Time | Max Time (with timeout) |
|-----------|--------------|-------------------------|
| Create Unit | 2-5 seconds | 120 seconds |
| Upload 5 Images | 10-30 seconds | 180 seconds |
| Create Agent | 3-8 seconds | 120 seconds |
| Create Tenant | 2-5 seconds | 120 seconds |
| Upload NIN Images | 5-15 seconds | 180 seconds |

---

## 🚀 Recommended Timeouts by Operation Type

### Quick Operations (5-10s typical)
- **Timeout:** 60s (1 minute)
- **Examples:** Simple data retrieval, updates without files

### Standard Operations (10-30s typical)
- **Timeout:** 120s (2 minutes)
- **Examples:** Creating records, updating complex data

### File Upload Operations (20-60s typical)
- **Timeout:** 180s (3 minutes)
- **Examples:** Multiple image uploads, document uploads

### Heavy Operations (60s+ typical)
- **Timeout:** 300s (5 minutes)
- **Examples:** PDF generation, bulk operations, reports

---

## 🔧 How to Adjust Timeouts

### For a specific API call:

```javascript
// In any API file
authService.post('/endpoint', data, { 
  timeout: 180000 // 3 minutes
});
```

### For all API calls (global):

Edit `frontend/src/services/authService.js`:
```javascript
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Adjust this value
});
```

---

## 📊 Testing Recommendations

After timeout changes:
1. ✅ Test unit creation with 10+ images
2. ✅ Test agent creation with profile + NIN images
3. ✅ Test on slow network (throttle to 3G)
4. ✅ Test on fast network (ensure no unnecessary delays)
5. ✅ Verify loading states show during operations
6. ✅ Confirm SweetAlert notifications appear correctly

---

## 🎨 UI/UX Improvements

Combined with timeout increases:

1. **Loading States**
   - Show progress bars during uploads
   - Display "Uploading images..." messages
   - Disable form during submission

2. **SweetAlert Notifications**
   - "Please wait" loading alerts
   - Success notifications after completion
   - Clear error messages on actual failures

3. **Progress Indicators**
   - Circular progress on submit buttons
   - Linear progress bars for long operations
   - Image upload progress (if available)

---

**Last Updated:** October 29, 2025  
**Status:** ✅ All timeouts optimized for production use


