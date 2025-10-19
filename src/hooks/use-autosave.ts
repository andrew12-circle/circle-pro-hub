import { useEffect, useRef, useState } from 'react';
import { useToast } from './use-toast';

interface AutosaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutosave<T>({
  data,
  onSave,
  debounceMs = 1000,
  enabled = true
}: AutosaveOptions<T>) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<number>();
  const prevDataRef = useRef<T>(data);
  
  useEffect(() => {
    if (!enabled || JSON.stringify(data) === JSON.stringify(prevDataRef.current)) {
      return;
    }
    
    prevDataRef.current = data;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(data);
        setLastSaved(new Date());
      } catch (error) {
        toast({
          title: 'Save failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
      } finally {
        setIsSaving(false);
      }
    }, debounceMs);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, debounceMs, onSave, toast]);
  
  return { isSaving, lastSaved };
}
