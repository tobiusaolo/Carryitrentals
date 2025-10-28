import enum

# Enums
class UserRole(str, enum.Enum):
    ADMIN = "admin"  # System administrator
    OWNER = "owner"  # Property owner
    TENANT = "tenant"  # Renter
    AGENT = "agent"  # Property agent

class PropertyType(str, enum.Enum):
    HOUSE = "house"  # Single family house
    APARTMENT = "apartment"  # Multi-unit building
    CONDO = "condo"  # Condominium
    TOWNHOUSE = "townhouse"  # Townhouse

class UnitStatus(str, enum.Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    MAINTENANCE = "maintenance"
    RENOVATION = "renovation"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    PARTIAL = "partial"

class PaymentType(str, enum.Enum):
    RENT = "rent"
    DEPOSIT = "deposit"
    UTILITY = "utility"
    MAINTENANCE = "maintenance"
    PENALTY = "penalty"
    QR_CODE = "qr_code"  # QR code payment

class MaintenanceStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class UnitType(str, enum.Enum):
    SINGLE = "single"  # Single room
    DOUBLE = "double"  # Double room
    STUDIO = "studio"  # Studio apartment
    SEMI_DETACHED = "semi_detached"  # Semi-detached unit
    ONE_BEDROOM = "one_bedroom"  # 1 bedroom apartment
    TWO_BEDROOM = "two_bedroom"  # 2 bedroom apartment
    THREE_BEDROOM = "three_bedroom"  # 3 bedroom apartment
    PENTHOUSE = "penthouse"  # Penthouse unit

class InspectionStatus(str, enum.Enum):
    PENDING = "pending"  # Booking pending approval
    CONFIRMED = "confirmed"  # Booking confirmed by owner
    COMPLETED = "completed"  # Inspection completed
    CANCELLED = "cancelled"  # Booking cancelled
    NO_SHOW = "no_show"  # Tenant didn't show up

class UtilityType(str, enum.Enum):
    WATER = "water"  # Water supply
    ELECTRICITY = "electricity"  # Electric power
    GAS = "gas"  # Natural gas/heating
    GARBAGE = "garbage"  # Garbage collection
    SEWER = "sewer"  # Sewer/septic
    INTERNET = "internet"  # Internet service
    CABLE = "cable"  # Cable TV

class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CHECK = "check"
    BANK_TRANSFER = "bank_transfer"
    ONLINE = "online"
    MTN_MOBILE_MONEY = "mtn_mobile_money"
    AIRTEL_MONEY = "airtel_money"
    QR_CODE = "qr_code"

class QRCodeStatus(str, enum.Enum):
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class Currency(str, enum.Enum):
    USD = "USD"  # US Dollar
    UGX = "UGX"  # Ugandan Shilling
    KES = "KES"  # Kenyan Shilling
    TZS = "TZS"  # Tanzanian Shilling
    RWF = "RWF"  # Rwandan Franc
    EUR = "EUR"  # Euro
    GBP = "GBP"  # British Pound
    CAD = "CAD"  # Canadian Dollar
    AUD = "AUD"  # Australian Dollar
    JPY = "JPY"  # Japanese Yen
    CNY = "CNY"  # Chinese Yuan
    INR = "INR"  # Indian Rupee
    ZAR = "ZAR"  # South African Rand
    NGN = "NGN"  # Nigerian Naira
    EGP = "EGP"  # Egyptian Pound
    MAD = "MAD"  # Moroccan Dirham
    GHS = "GHS"  # Ghanaian Cedi
    ETB = "ETB"  # Ethiopian Birr
    BWP = "BWP"  # Botswana Pula
