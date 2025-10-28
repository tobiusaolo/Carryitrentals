# 🏠 Rental Management System API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints (except auth) require Bearer token authentication:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### `POST /auth/register`
**Purpose**: Register a new user (owner or tenant)

**Input Data**:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "123-456-7890",
  "role": "owner"  // or "tenant"
}
```

**Output Data**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "123-456-7890",
  "role": "owner",
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### `POST /auth/login`
**Purpose**: Login and get access token

**Input Data**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Output Data**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### `POST /auth/refresh`
**Purpose**: Refresh access token

**Input Data**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Output Data**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### `GET /auth/me`
**Purpose**: Get current user information

**Output Data**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "123-456-7890",
  "role": "owner",
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

---

## 🏢 Property Management Endpoints

### `POST /properties`
**Purpose**: Create a new property (Owner only)

**Input Data**:
```json
{
  "name": "Sunset Villa",
  "address": "123 Sunset Boulevard",
  "city": "Los Angeles",
  "state": "CA",
  "zip_code": "90210",
  "country": "USA",
  "property_type": "house",  // house, apartment, condo, townhouse
  "description": "Beautiful single-family house",
  "total_units": 1
}
```

**Output Data**:
```json
{
  "id": 1,
  "name": "Sunset Villa",
  "address": "123 Sunset Boulevard",
  "city": "Los Angeles",
  "state": "CA",
  "zip_code": "90210",
  "country": "USA",
  "property_type": "house",
  "description": "Beautiful single-family house",
  "total_units": 1,
  "owner_id": 1,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### `GET /properties`
**Purpose**: Get properties (filtered by user role)

**Query Parameters**:
- `skip`: int = 0 (pagination offset)
- `limit`: int = 100 (pagination limit)

**Output Data**:
```json
[
  {
    "id": 1,
    "name": "Sunset Villa",
    "address": "123 Sunset Boulevard",
    "city": "Los Angeles",
    "state": "CA",
    "zip_code": "90210",
    "country": "USA",
    "property_type": "house",
    "description": "Beautiful single-family house",
    "total_units": 1,
    "owner_id": 1,
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

### `GET /properties/{property_id}`
**Purpose**: Get specific property details

**Output Data**: Same as property object above

### `PUT /properties/{property_id}`
**Purpose**: Update property (Owner only)

**Input Data**: Same as PropertyCreate (all fields optional)

### `DELETE /properties/{property_id}`
**Purpose**: Delete property (Owner only)

**Output Data**:
```json
{
  "message": "Property deleted successfully"
}
```

---

## 🏠 Unit Management Endpoints

### `POST /units`
**Purpose**: Create a new rental unit (Owner only)

**Input Data**:
```json
{
  "property_id": 1,
  "unit_number": "101",
  "unit_type": "single",  // single, double, studio, semi_detached, one_bedroom, two_bedroom, three_bedroom, penthouse
  "floor": 1,
  "bedrooms": 1,
  "bathrooms": 1,
  "square_feet": 500.00,
  "monthly_rent": 1200.00,
  "deposit_amount": 1200.00,
  "status": "available",  // available, occupied, maintenance, renovation
  "description": "Single room unit",
  "amenities": "WiFi, Air Conditioning",
  "images": "image1.jpg,image2.jpg"
}
```

**Output Data**:
```json
{
  "id": 1,
  "unit_number": "101",
  "unit_type": "single",
  "property_id": 1,
  "floor": 1,
  "bedrooms": 1,
  "bathrooms": 1,
  "square_feet": 500.00,
  "monthly_rent": 1200.00,
  "deposit_amount": 1200.00,
  "status": "available",
  "description": "Single room unit",
  "amenities": "WiFi, Air Conditioning",
  "images": "image1.jpg,image2.jpg",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### `GET /units`
**Purpose**: Get units (filtered by property or status)

**Query Parameters**:
- `property_id`: int (optional)
- `status`: str (optional) - available, occupied, maintenance, renovation
- `skip`: int = 0
- `limit`: int = 100

**Output Data**: Array of unit objects

### `GET /units/{unit_id}`
**Purpose**: Get specific unit details

**Output Data**: Single unit object

### `PUT /units/{unit_id}`
**Purpose**: Update unit (Owner only)

### `DELETE /units/{unit_id}`
**Purpose**: Delete unit (Owner only)

---

## 📋 Lease Management Endpoints

### `POST /leases`
**Purpose**: Create a new lease agreement (Owner only)

**Input Data**:
```json
{
  "unit_id": 1,
  "tenant_id": 2,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "monthly_rent": 1200.00,
  "deposit_amount": 1200.00,
  "status": "pending",  // pending, active, expired, terminated
  "lease_document": "lease_agreement.pdf",
  "terms_and_conditions": "Standard lease terms apply"
}
```

**Output Data**:
```json
{
  "id": 1,
  "unit_id": 1,
  "tenant_id": 2,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "monthly_rent": 1200.00,
  "deposit_amount": 1200.00,
  "status": "active",
  "lease_document": "lease_agreement.pdf",
  "terms_and_conditions": "Standard lease terms apply",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### `GET /leases`
**Purpose**: Get leases (filtered by tenant, unit, or status)

**Query Parameters**:
- `tenant_id`: int (optional)
- `unit_id`: int (optional)
- `status`: str (optional)
- `skip`: int = 0
- `limit`: int = 100

### `GET /leases/{lease_id}`
**Purpose**: Get specific lease details

### `PUT /leases/{lease_id}`
**Purpose**: Update lease (Owner only)

### `DELETE /leases/{lease_id}`
**Purpose**: Delete lease (Owner only)

---

## 💰 Payment Management Endpoints

### `POST /payments`
**Purpose**: Create a new payment record (Owner only)

**Input Data**:
```json
{
  "unit_id": 1,
  "payer_id": 2,
  "lease_id": 1,
  "amount": 1200.00,
  "payment_type": "rent",  // rent, deposit, utility, maintenance, penalty
  "payment_method": "bank_transfer",
  "payment_date": "2024-01-01",
  "status": "paid",  // pending, paid, overdue, partial
  "notes": "Monthly rent payment"
}
```

**Output Data**:
```json
{
  "id": 1,
  "unit_id": 1,
  "payer_id": 2,
  "lease_id": 1,
  "amount": 1200.00,
  "payment_type": "rent",
  "payment_method": "bank_transfer",
  "payment_date": "2024-01-01",
  "status": "paid",
  "notes": "Monthly rent payment",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### `GET /payments`
**Purpose**: Get payments (filtered by unit, tenant, or status)

**Query Parameters**:
- `unit_id`: int (optional)
- `tenant_id`: int (optional)
- `status`: str (optional)
- `skip`: int = 0
- `limit`: int = 100

### `GET /payments/{payment_id}`
**Purpose**: Get specific payment details

### `PUT /payments/{payment_id}`
**Purpose**: Update payment (Owner only)

### `DELETE /payments/{payment_id}`
**Purpose**: Delete payment (Owner only)

---

## 🔧 Maintenance Request Endpoints

### `POST /maintenance`
**Purpose**: Create a maintenance request (Owner/Tenant)

**Input Data**:
```json
{
  "property_id": 1,
  "requester_id": 2,
  "unit_id": 1,
  "title": "Broken faucet",
  "description": "Kitchen faucet is leaking",
  "priority": "medium",  // low, medium, high, urgent
  "status": "pending",  // pending, in_progress, completed, cancelled
  "estimated_cost": 150.00,
  "assigned_to": "John Smith",
  "scheduled_date": "2024-01-15T10:00:00",
  "images": "faucet1.jpg,faucet2.jpg"
}
```

**Output Data**:
```json
{
  "id": 1,
  "property_id": 1,
  "requester_id": 2,
  "unit_id": 1,
  "title": "Broken faucet",
  "description": "Kitchen faucet is leaking",
  "priority": "medium",
  "status": "pending",
  "estimated_cost": 150.00,
  "actual_cost": null,
  "assigned_to": "John Smith",
  "scheduled_date": "2024-01-15T10:00:00",
  "completed_date": null,
  "images": "faucet1.jpg,faucet2.jpg",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### `GET /maintenance`
**Purpose**: Get maintenance requests (filtered by property, unit, or status)

**Query Parameters**:
- `property_id`: int (optional)
- `unit_id`: int (optional)
- `status`: str (optional)
- `skip`: int = 0
- `limit`: int = 100

### `GET /maintenance/{maintenance_id}`
**Purpose**: Get specific maintenance request details

### `PUT /maintenance/{maintenance_id}`
**Purpose**: Update maintenance request (Owner only)

### `DELETE /maintenance/{maintenance_id}`
**Purpose**: Delete maintenance request (Owner only)

---

## ⚡ Utility Management Endpoints

### `POST /utilities`
**Purpose**: Create property-level utility (Owner only)

**Input Data**:
```json
{
  "property_id": 1,
  "utility_type": "water",  // water, electricity, gas, garbage, sewer, internet, cable
  "provider_name": "City Water Authority",
  "account_number": "WTR-001",
  "monthly_cost": 50.00,
  "is_included_in_rent": true,
  "description": "Water supply for all units"
}
```

### `GET /utilities`
**Purpose**: Get utilities (filtered by property or type)

**Query Parameters**:
- `property_id`: int (optional)
- `utility_type`: str (optional)
- `skip`: int = 0
- `limit`: int = 100

### `GET /utilities/{utility_id}`
**Purpose**: Get specific utility details

### `PUT /utilities/{utility_id}`
**Purpose**: Update utility (Owner only)

### `DELETE /utilities/{utility_id}`
**Purpose**: Delete utility (Owner only)

---

## 🏠 Unit-Specific Utility Endpoints

### `POST /unit-utilities`
**Purpose**: Create unit-specific utility (Owner only)

**Input Data**:
```json
{
  "unit_id": 1,
  "utility_type": "electricity",
  "provider_name": "Power Company",
  "account_number": "ELEC-101",
  "monthly_cost": 80.00,
  "is_included_in_rent": false,
  "description": "Electricity service for unit 101"
}
```

**Output Data**:
```json
{
  "id": 1,
  "unit_id": 1,
  "utility_type": "electricity",
  "provider_name": "Power Company",
  "account_number": "ELEC-101",
  "monthly_cost": 80.00,
  "is_included_in_rent": false,
  "description": "Electricity service for unit 101",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### `GET /unit-utilities`
**Purpose**: Get unit-specific utilities

**Query Parameters**:
- `unit_id`: int (optional)
- `utility_type`: str (optional)
- `skip`: int = 0
- `limit`: int = 100

### `GET /unit-utilities/{utility_id}`
**Purpose**: Get specific unit utility details

### `PUT /unit-utilities/{utility_id}`
**Purpose**: Update unit utility (Owner only)

### `DELETE /unit-utilities/{utility_id}`
**Purpose**: Delete unit utility (Owner only)

---

## 📊 Analytics Endpoints

### `GET /analytics/property/{property_id}`
**Purpose**: Get property analytics (Owner only)

**Output Data**:
```json
{
  "property_id": 1,
  "total_units": 4,
  "occupied_units": 3,
  "available_units": 1,
  "occupancy_rate": 75.0,
  "total_monthly_rent": 6700.00,
  "average_rent": 1675.00,
  "maintenance_requests": 5,
  "pending_maintenance": 2
}
```

### `GET /analytics/payments`
**Purpose**: Get payment analytics (Owner only)

**Query Parameters**:
- `property_id`: int (optional)
- `start_date`: date (optional)
- `end_date`: date (optional)

**Output Data**:
```json
{
  "total_payments": 15000.00,
  "pending_payments": 2400.00,
  "overdue_payments": 1200.00,
  "payment_collection_rate": 85.5,
  "average_payment_time": 2.5
}
```

### `GET /analytics/maintenance`
**Purpose**: Get maintenance analytics (Owner only)

**Query Parameters**:
- `property_id`: int (optional)
- `start_date`: date (optional)
- `end_date`: date (optional)

**Output Data**:
```json
{
  "total_requests": 25,
  "pending_requests": 5,
  "completed_requests": 18,
  "average_completion_time": 3.2,
  "total_cost": 2500.00,
  "average_cost": 100.00
}
```

### `GET /analytics/occupancy`
**Purpose**: Get occupancy analytics (Owner only)

**Query Parameters**:
- `property_id`: int (optional)

**Output Data**:
```json
{
  "properties_count": 3,
  "total_units": 12,
  "occupied_units": 9,
  "available_units": 3,
  "occupancy_rate": 75.0,
  "total_monthly_rent": 20100.00
}
```

### `GET /analytics/dashboard`
**Purpose**: Get rental dashboard data (Owner/Tenant)

**Output Data** (Owner):
```json
{
  "properties": [...],
  "recent_payments": [...],
  "overdue_payments": [...],
  "recent_maintenance": [...],
  "expiring_leases": [...]
}
```

**Output Data** (Tenant):
```json
{
  "active_leases": [...],
  "recent_payments": [...],
  "maintenance_requests": [...]
}
```

---

## 🔧 File Upload Endpoints

### `POST /units/{unit_id}/upload-images`
**Purpose**: Upload unit images (Owner only)

**Input Data**: Multipart form data with image files

**Output Data**:
```json
{
  "message": "Images uploaded successfully",
  "uploaded_files": ["image1.jpg", "image2.jpg"]
}
```

### `POST /maintenance/{maintenance_id}/upload-images`
**Purpose**: Upload maintenance images (Owner/Tenant)

**Input Data**: Multipart form data with image files

---

## 📝 Common Response Formats

### Success Response
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### Error Response
```json
{
  "detail": "Error message description"
}
```

### Validation Error Response
```json
{
  "detail": [
    {
      "loc": ["field_name"],
      "msg": "error message",
      "type": "error_type"
    }
  ]
}
```

---

## 🔐 Authentication & Authorization

### User Roles
- **owner**: Can manage properties, units, leases, payments, utilities
- **tenant**: Can view their leases, payments, maintenance requests

### Access Control
- Owners can only access their own properties
- Tenants can only access their own data
- All endpoints require valid JWT token
- Some endpoints require specific roles

---

## 📊 Data Types & Enums

### Property Types
- `house` - Single family house
- `apartment` - Multi-unit building
- `condo` - Condominium
- `townhouse` - Townhouse

### Unit Types
- `single` - Single room
- `double` - Double room
- `studio` - Studio apartment
- `semi_detached` - Semi-detached unit
- `one_bedroom` - 1 bedroom apartment
- `two_bedroom` - 2 bedroom apartment
- `three_bedroom` - 3 bedroom apartment
- `penthouse` - Penthouse unit

### Unit Status
- `available` - Available for rent
- `occupied` - Currently occupied
- `maintenance` - Under maintenance
- `renovation` - Under renovation

### Utility Types
- `water` - Water supply
- `electricity` - Electric power
- `gas` - Natural gas/heating
- `garbage` - Garbage collection
- `sewer` - Sewer/septic
- `internet` - Internet service
- `cable` - Cable TV

### Payment Types
- `rent` - Monthly rent
- `deposit` - Security deposit
- `utility` - Utility payment
- `maintenance` - Maintenance fee
- `penalty` - Late fee penalty

### Payment Status
- `pending` - Payment pending
- `paid` - Payment completed
- `overdue` - Payment overdue
- `partial` - Partial payment

### Maintenance Status
- `pending` - Request pending
- `in_progress` - Work in progress
- `completed` - Work completed
- `cancelled` - Request cancelled

### Lease Status
- `pending` - Lease pending
- `active` - Active lease
- `expired` - Lease expired
- `terminated` - Lease terminated










