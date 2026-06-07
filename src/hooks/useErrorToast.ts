import { useToast } from 'heroui-native';
import { useEffect, useRef } from 'react';

type ErrorToastOptions = {
  title: string;
  message?: string | null;
};

export function useErrorToast({ message, title }: ErrorToastOptions) {
  const { toast } = useToast();
  const lastMessageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!message) {
      lastMessageRef.current = null;
      return;
    }

    if (lastMessageRef.current === message) {
      return;
    }

    lastMessageRef.current = message;
    toast.show({
      actionLabel: '知道了',
      description: message,
      label: title,
      onActionPress: ({ hide }) => hide(),
      placement: 'top',
      variant: 'danger',
    });
  }, [message, title, toast]);
}
