# Rental Management System Backend

A comprehensive FastAPI-based backend for rental property management system with full CRUD operations, authentication, file uploads, notifications, and analytics.

## Features

### Core Features
- **User Management**: Multi-role authentication (Admin, Owner, Tenant, Manager)
- **Property Management**: Add, edit, delete properties with multiple units
- **Unit Management**: Manage rental units with images, specifications, and amenities
- **Tenant Management**: Handle tenant information and lease agreements
- **Lease Management**: Create, renew, and manage lease agreements
- **Payment Tracking**: Track rent payments, deposits, utilities, and maintenance costs
- **Maintenance Requests**: Submit and track maintenance requests with images
- **Utility Management**: Manage property utilities and costs
- **File Uploads**: Upload unit images, documents, and maintenance photos
- **Notifications**: Email and SMS reminders for payments, lease expiry, maintenance updates
- **Analytics**: Comprehensive property analytics, financial reports, and insights

### Technical Features
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **PostgreSQL**: Robust relational database
- **JWT Authentication**: Secure token-based authentication
- **Pydantic**: Data validation using Python type annotations
- **File Upload**: Secure file handling with image optimization
- **Email/SMS**: SendGrid and Twilio integration for notifications
- **Redis**: Caching and background task management
- **CORS**: Cross-origin resource sharing support

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # Database configuration
│   ├── auth.py                 # Authentication and authorization
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── property.py
│   │   ├── unit.py
│   │   ├── lease.py
│   │   ├── payment.py
│   │   ├── utility.py
│   │   ├── maintenance.py
│   │   └── notification.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── property.py
│   │   ├── unit.py
│   │   ├── lease.py
│   │   ├── payment.py
│   │   ├── utility.py
│   │   ├── maintenance.py
│   │   └── analytics.py
│   ├── crud/                   # CRUD operations
│   │   ├── user.py
│   │   ├── property.py
│   │   ├── unit.py
│   │   ├── lease.py
│   │   ├── payment.py
│   │   ├── utility.py
│   │   └── maintenance.py
│   ├── routers/                # API routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── property.py
│   │   ├── unit.py
│   │   ├── lease.py
│   │   ├── payment.py
│   │   ├── maintenance.py
│   │   ├── utility.py
│   │   └── analytics.py
│   └── services/               # Business logic services
│       ├── __init__.py
│       ├── file_upload.py
│       ├── notification.py
│       └── analytics.py
├── uploads/                    # File upload directory
│   ├── unit_images/
│   ├── documents/
│   └── maintenance_images/
├── requirements.txt            # Python dependencies
├── env.example                # Environment variables template
├── start.sh                   # Startup script
└── README.md                  # This file
```

## Installation

### Prerequisites
- Python 3.8+
- PostgreSQL
- Redis (optional, for caching)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**
   - Create PostgreSQL database
   - Update DATABASE_URL in .env file

6. **Run the application**
   ```bash
   # Using the startup script
   ./start.sh
   
   # Or manually
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Documentation

Once the application is running, you can access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **API Base URL**: http://localhost:8000/api/v1

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/rental_management

# Authentication
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Redis
REDIS_URL=redis://localhost:6379/0

# File Upload
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif
ALLOWED_DOCUMENT_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# App Settings
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user info
- `PUT /api/v1/auth/me` - Update current user

### Properties
- `POST /api/v1/properties/` - Create property
- `GET /api/v1/properties/` - Get properties
- `GET /api/v1/properties/{id}` - Get property by ID
- `PUT /api/v1/properties/{id}` - Update property
- `DELETE /api/v1/properties/{id}` - Delete property

### Units
- `POST /api/v1/units/` - Create unit
- `GET /api/v1/units/` - Get units
- `GET /api/v1/units/{id}` - Get unit by ID
- `PUT /api/v1/units/{id}` - Update unit
- `DELETE /api/v1/units/{id}` - Delete unit
- `POST /api/v1/units/{id}/upload-images` - Upload unit images

### Leases
- `POST /api/v1/leases/` - Create lease
- `GET /api/v1/leases/` - Get leases
- `GET /api/v1/leases/{id}` - Get lease by ID
- `PUT /api/v1/leases/{id}` - Update lease
- `POST /api/v1/leases/{id}/renew` - Renew lease
- `DELETE /api/v1/leases/{id}` - Delete lease

### Payments
- `POST /api/v1/payments/` - Create payment
- `GET /api/v1/payments/` - Get payments
- `GET /api/v1/payments/{id}` - Get payment by ID
- `PUT /api/v1/payments/{id}` - Update payment
- `POST /api/v1/payments/{id}/mark-paid` - Mark payment as paid
- `DELETE /api/v1/payments/{id}` - Delete payment

### Maintenance
- `POST /api/v1/maintenance/` - Create maintenance request
- `GET /api/v1/maintenance/` - Get maintenance requests
- `GET /api/v1/maintenance/{id}` - Get maintenance request by ID
- `PUT /api/v1/maintenance/{id}` - Update maintenance request
- `POST /api/v1/maintenance/{id}/assign` - Assign maintenance request
- `POST /api/v1/maintenance/{id}/complete` - Complete maintenance request

### Utilities
- `POST /api/v1/utilities/` - Create utility
- `GET /api/v1/utilities/` - Get utilities
- `GET /api/v1/utilities/{id}` - Get utility by ID
- `PUT /api/v1/utilities/{id}` - Update utility
- `DELETE /api/v1/utilities/{id}` - Delete utility

### Analytics
- `GET /api/v1/analytics/property/{id}` - Property analytics
- `GET /api/v1/analytics/payments` - Payment analytics
- `GET /api/v1/analytics/maintenance` - Maintenance analytics
- `GET /api/v1/analytics/tenants` - Tenant analytics
- `GET /api/v1/analytics/financial` - Financial summary
- `GET /api/v1/analytics/dashboard` - Dashboard data

## User Roles

### Admin
- Full access to all features
- Can manage all properties, units, tenants, and payments
- Access to all analytics and reports

### Owner
- Can manage their own properties
- Can create and manage units, tenants, leases
- Access to property-specific analytics
- Can send notifications to tenants

### Tenant
- Can view their lease information
- Can submit maintenance requests
- Can view their payment history
- Can upload maintenance request images

### Manager
- Similar to owner but may have limited access
- Can manage properties assigned to them

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- File upload validation
- CORS protection
- Input validation with Pydantic

## Testing

```bash
# Run tests (when implemented)
pytest

# Run with coverage
pytest --cov=app
```

## Deployment

### Production Considerations
1. Set `DEBUG=False` in environment
2. Use a production WSGI server like Gunicorn
3. Configure proper CORS origins
4. Set up SSL/TLS certificates
5. Use environment-specific database
6. Configure proper logging
7. Set up monitoring and health checks

### Docker Deployment (Optional)
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.














