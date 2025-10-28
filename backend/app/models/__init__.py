# Import all models in the correct order to avoid circular dependency issues
# Import enums first
from .enums import *

# Base models first (no dependencies)
from .user import User

# Models that depend on User
from .property import Property
from .unit import Unit
from .unit_utility import UnitUtility
from .tenant import Tenant
from .payment import Payment
from .utility import Utility
from .maintenance import MaintenanceRequest
from .notification import Notification
from .inspection_booking import InspectionBooking
from .qr_payment import QRCodePayment
from .mobile_payment import MobilePayment
from .agent import Agent
from .rental_unit import RentalUnit
from .payment_method import PaymentMethod, PaymentMethodType
from .inspection_payment import InspectionPayment, PaymentStatus as InspectionPaymentStatus
from .message_template import MessageTemplate
from .communication_log import CommunicationLog

# Export all models and enums
__all__ = [
    # Enums
    "UserRole",
    "PropertyType",
    "UnitType",
    "UnitStatus",
    "PaymentStatus",
    "PaymentType",
    "MaintenanceStatus",
    "UtilityType",
    "InspectionStatus",
    "PaymentMethod",
    "PaymentMethodType",
    "InspectionPaymentStatus",
    "QRCodeStatus",
    "Currency",
    # Models
    "User",
    "Property", 
    "Unit",
    "UnitUtility",
    "Tenant",
    "Payment",
    "Utility",
    "MaintenanceRequest",
    "Notification",
    "InspectionBooking",
    "QRCodePayment",
    "MobilePayment",
    "Agent",
    "RentalUnit",
    "PaymentMethod",
    "InspectionPayment",
    "MessageTemplate",
    "CommunicationLog"
]