import Swal from 'sweetalert2';

export const showSuccess = (title, message = '', timer = 3000) => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    timer,
    timerProgressBar: true,
    showConfirmButton: true,
    toast: true,
    position: 'top-end',
    showClass: {
      popup: 'animate__animated animate__fadeInDown'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp'
    }
  });
};

export const showError = (title, message = '') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#d32f2f',
    allowOutsideClick: false
  });
};

export const showWarning = (title, message = '', confirmText = 'Continue') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    confirmButtonColor: '#ff9800',
    cancelButtonColor: '#757575'
  });
};

export const showConfirm = (title, message = '', confirmText = 'Yes', cancelText = 'No') => {
  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    confirmButtonColor: '#3085d6',
    cancelButtonText: cancelText,
    cancelButtonColor: '#757575',
    reverseButtons: true
  });
};

export const showInfo = (title, message = '') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#1976d2'
  });
};

export const showLoading = (title = 'Loading...', message = 'Please wait') => {
  return Swal.fire({
    title,
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const closeAlert = () => {
  Swal.close();
};

