# Twilio SMS Configuration Guide

## Your Twilio Credentials

Add these to your `.env` file in the backend directory:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+your_phone_number_here
```

## Create .env File

If you don't have a `.env` file, create one:

```bash
cd backend
cat > .env << 'EOF'
# Twilio Configuration (SMS)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+your_phone_number_here

# Email Configuration (optional for now)
SENDGRID_API_KEY=
FROM_EMAIL=noreply@carryit.com

# Database
DATABASE_URL=sqlite:///./rental_management.db

# JWT
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
EOF
```

## Testing SMS

The system will automatically send SMS to tenants using their phone numbers from the database.

### Test Number
For testing, you can use: **+256750371313**

### Add Test Tenant with SMS Number

```sql
-- Update a tenant's phone number for testing
UPDATE tenants 
SET phone = '+256750371313' 
WHERE id = 1;
```

Or via Python:
```python
import sqlite3
conn = sqlite3.connect('rental_management.db')
cursor = conn.cursor()
cursor.execute("UPDATE tenants SET phone = '+256750371313' WHERE id = 1")
conn.commit()
conn.close()
```

## How SMS is Sent

### Automatic Rent Reminders:
- Runs daily at 10:00 AM
- Checks tenants with payment due in 3 days
- Sends SMS to tenant's phone number
- Message: "Rent reminder: ${amount} due on {due_date}. Please pay on time to avoid late fees."

### Bulk SMS:
- Owner selects recipients
- System gets each tenant's phone number from database
- Sends personalized SMS to each
- Tracks delivery status

### Lease Expiry Reminders:
- Runs daily at 8:00 AM
- Checks leases expiring in 30/60/90 days
- Sends SMS: "Lease expires on {date}. Please contact us about renewal or move-out."

## Twilio Trial Account Limitations

Since you're using a Twilio trial account:

1. **Verified Numbers Only**: You can only send to verified numbers
   - Your test number (+256750371313) must be verified in Twilio console

2. **Trial Message Prefix**: All messages will have "Sent from your Twilio trial account - " prefix

3. **From Number**: Always uses +your_phone_number_here (your Twilio number)

4. **To Add Verified Numbers**:
   - Go to Twilio Console
   - Phone Numbers → Verified Caller IDs
   - Add +256750371313

## Testing the System

### Option 1: Wait for Scheduled Time
- Set a tenant's `next_payment_due` to 3 days from now
- Wait until 10:00 AM
- SMS will be sent automatically

### Option 2: Manual Test (Recommended)
Use the test script below.

## Quick Test Script

Create `backend/test_sms.py`:

```python
import os
import sys
sys.path.insert(0, os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from twilio.rest import Client

# Your credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
from_number = os.getenv('TWILIO_PHONE_NUMBER')

print(f"Twilio Account SID: {account_sid}")
print(f"From Number: {from_number}")

# Test SMS
client = Client(account_sid, auth_token)

message = client.messages.create(
    from_=from_number,
    body='Test message from CarryIT Property Management System. Your rent is due soon!',
    to='+256750371313'
)

print(f"✅ SMS sent successfully!")
print(f"Message SID: {message.sid}")
print(f"Status: {message.status}")
```

Run test:
```bash
cd backend
python test_sms.py
```

## Setting Tenant Phone Numbers

Update tenant phone numbers to valid format:

```sql
-- Set test tenant phone
UPDATE tenants SET phone = '+256750371313' WHERE id = 1;

-- Verify
SELECT id, first_name, last_name, phone, next_payment_due FROM tenants WHERE id = 1;
```

## Current System Behavior

### When Rent Reminder Runs:
1. Gets all active tenants
2. Checks if `next_payment_due` = today + 3 days
3. For each matching tenant:
   - Gets their phone number from `tenants.phone`
   - Sends personalized SMS
   - Logs the activity

### SMS Message Format:
```
Rent reminder: $1200 due on 2025-10-25. Please pay on time to avoid late fees.
```

### For Bulk SMS:
Owner can send to:
- All tenants
- Specific property tenants
- Tenants with specific payment status
- Custom tenant list

Each recipient gets the message at their registered phone number.

## Troubleshooting

### If SMS not sending:
1. Check Twilio credentials in .env
2. Verify phone number format (+256...)
3. Verify number in Twilio console (trial account)
4. Check Twilio account balance
5. Check backend logs for errors

### Check Tenant Phone Numbers:
```sql
SELECT id, first_name, last_name, phone 
FROM tenants 
WHERE is_active = 1;
```

Update if needed:
```sql
UPDATE tenants SET phone = '+256750371313' WHERE id = 1;
```

## Production Recommendations

When moving to production:

1. **Upgrade Twilio Account** - Remove trial limitations
2. **Get Dedicated Phone Number** - For your country/region  
3. **Verify All Tenant Numbers** - Ensure correct format
4. **Set Up Sender ID** - Custom sender name
5. **Monitor Usage** - Track SMS costs
6. **Handle Opt-outs** - Respect tenant preferences

## Environment Variables Summary

Make sure your `.env` file has:

```bash
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+your_phone_number_here
```

Then restart the backend server!








