import { useEffect } from 'react';
import { OWNER_REFRESH_EVENT } from '../utils/ownerRefresh';

/** Re-run callback when the owner layout refresh button is pressed. */
export default function useOwnerSoftRefresh(onRefresh) {
  useEffect(() => {
    if (!onRefresh) return undefined;
    const handler = () => onRefresh();
    window.addEventListener(OWNER_REFRESH_EVENT, handler);
    return () => window.removeEventListener(OWNER_REFRESH_EVENT, handler);
  }, [onRefresh]);
}
