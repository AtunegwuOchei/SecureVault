import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseClipboardOptions {
  successDuration?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { successDuration = 2000, onSuccess, onError } = options;
  const [hasCopied, setHasCopied] = useState(false);
  const [value, setValue] = useState<string>('');
  const { toast } = useToast();

  const onCopy = useCallback(
    async (text: string, showToast: boolean = true) => {
      try {
        await navigator.clipboard.writeText(text);
        setValue(text);
        setHasCopied(true);
        
        if (showToast) {
          toast({
            title: 'Copied',
            description: 'Text copied to clipboard',
            duration: 2000,
          });
        }
        
        onSuccess?.();

        setTimeout(() => {
          setHasCopied(false);
        }, successDuration);
      } catch (error) {
        console.error('Failed to copy text: ', error);
        setHasCopied(false);
        
        if (showToast) {
          toast({
            title: 'Copy failed',
            description: 'Failed to copy text to clipboard',
            variant: 'destructive',
            duration: 2000,
          });
        }
        
        onError?.(error as Error);
      }
    },
    [successDuration, onSuccess, onError, toast]
  );

  const reset = useCallback(() => {
    setValue('');
    setHasCopied(false);
  }, []);

  return { value, onCopy, hasCopied, reset };
}
