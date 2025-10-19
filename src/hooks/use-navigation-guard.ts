import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

export function useNavigationGuard(isDirty: boolean, message?: string) {
  const blocker = useBlocker(isDirty);
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message || 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);
  
  return blocker;
}
