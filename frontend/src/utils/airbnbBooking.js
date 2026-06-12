import { nightsBetween, calculateStayTotal } from '../constants/airbnb';

export function validateAirbnbBooking(form, listing) {
  const errors = [];
  if (!form.guest_name?.trim()) errors.push('Full name is required');
  if (!form.guest_email?.trim()) errors.push('Email is required');
  if (!form.guest_phone?.trim()) errors.push('Phone number is required');
  if (!form.check_in) errors.push('Check-in date is required');
  if (!form.check_out) errors.push('Check-out date is required');
  if (form.check_in && form.check_out) {
    const nights = nightsBetween(form.check_in, form.check_out);
    if (nights < 1) errors.push('Check-out must be after check-in');
  }
  const guests = parseInt(form.number_of_guests, 10);
  if (!guests || guests < 1) errors.push('At least 1 guest is required');
  if (listing?.max_guests && guests > listing.max_guests) {
    errors.push(`Maximum ${listing.max_guests} guests for this stay`);
  }
  return errors;
}

export function buildAirbnbBookingPayload(form, airbnbId) {
  return {
    airbnb_id: airbnbId,
    guest_name: form.guest_name.trim(),
    guest_email: form.guest_email.trim(),
    guest_phone: form.guest_phone.trim(),
    guest_country: form.guest_country || 'Uganda',
    check_in: form.check_in,
    check_out: form.check_out,
    number_of_guests: parseInt(form.number_of_guests, 10),
    special_requests: form.special_requests?.trim() || undefined,
    payment_timing: 'pay_later',
    payment_method: 'request_only',
    payment_method_type: 'mobile_money',
  };
}

export function getStayQuote(listing, checkIn, checkOut) {
  return calculateStayTotal(listing?.price_per_night, checkIn, checkOut);
}

export function canReserveListing(airbnb) {
  if (!airbnb) return false;
  if (airbnb.is_available && airbnb.is_available !== 'available') return false;
  if (airbnb.is_booked) return false;
  return true;
}
