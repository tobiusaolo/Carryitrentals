import { showConfirm } from '../../utils/sweetAlert';

/** Promise-based confirm — replaces window.confirm in admin flows. */
export async function adminConfirm(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
  const result = await showConfirm(title, message, confirmText, cancelText);
  return Boolean(result.isConfirmed);
}

export default adminConfirm;
