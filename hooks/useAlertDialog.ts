import { Alert } from 'react-native';
import { haptics } from '@/utils/haptics';

export interface AlertDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

/**
 * Custom hook for standardized alert dialogs across the app
 * Provides consistent UX for confirmations, deletions, etc.
 */
export function useAlertDialog() {
  const showConfirm = (
    options: AlertDialogOptions,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    haptics.medium();

    Alert.alert(
      options.title,
      options.message,
      [
        {
          text: options.cancelText || 'Cancel',
          style: 'cancel',
          onPress: () => {
            haptics.light();
            onCancel?.();
          },
        },
        {
          text: options.confirmText || 'Confirm',
          style: options.destructive ? 'destructive' : 'default',
          onPress: () => {
            haptics.success();
            onConfirm();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDelete = (
    itemName: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showConfirm(
      {
        title: 'Delete Item',
        message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        destructive: true,
      },
      onConfirm,
      onCancel
    );
  };

  const confirmClear = (
    itemType: string,
    count: number,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showConfirm(
      {
        title: `Clear ${itemType}`,
        message: `Are you sure you want to clear ${count} ${itemType.toLowerCase()}? This action cannot be undone.`,
        confirmText: 'Clear All',
        cancelText: 'Cancel',
        destructive: true,
      },
      onConfirm,
      onCancel
    );
  };

  const showSuccess = (message: string, onOk?: () => void) => {
    haptics.success();
    Alert.alert('Success', message, [
      {
        text: 'OK',
        onPress: () => {
          haptics.light();
          onOk?.();
        },
      },
    ]);
  };

  const showError = (message: string, onOk?: () => void) => {
    haptics.error();
    Alert.alert('Error', message, [
      {
        text: 'OK',
        onPress: () => {
          haptics.light();
          onOk?.();
        },
      },
    ]);
  };

  return {
    showConfirm,
    confirmDelete,
    confirmClear,
    showSuccess,
    showError,
  };
}
