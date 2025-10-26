import { Button, ButtonVariant } from '@/components/ui/Button';
import { Dialog } from '../ui/Dialog';
import React from 'react';
import { View } from 'react-native';
import { Row } from '../layout/Layout';
import { useTheme } from '@/context/theme-provider';

interface ConfirmationDialogProps extends Omit<React.ComponentProps<typeof Dialog>, 'children'> {
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
  children?: React.ReactNode;
  close?: () => void;
}

export const ConfirmationDialog = React.forwardRef<any, ConfirmationDialogProps>(
  (
    {
      close,
      title,
      description,
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      confirmVariant = 'primary',
      onConfirm,
      onCancel,
      isLoading = false,
      isDangerous = false,
      showCloseButton = true,
      detached = true,
      children,
      style,
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [loading, setLoading] = React.useState(false);

    const handleConfirm = async () => {
      setLoading(true);
      try {
        await onConfirm();
        close?.();
      } finally {
        setLoading(false);
      }
    };

    const handleCancel = () => {
      onCancel?.();
      close?.();
    };

    return (
      <Dialog
        ref={ref}
        close={close}
        title={title}
        description={description}
        showCloseButton={showCloseButton}
        detached={detached}
        style={style}>
        {children && <View>{children}</View>}

        {/* Action Buttons */}
        <Row gap="md">
          <Button
            label={cancelText}
            variant="outlined"
            onPress={handleCancel}
            disabled={loading || isLoading}
            style={{ flex: 1 }}
          />
          <Button
            label={confirmText}
            variant={isDangerous ? 'secondary' : confirmVariant}
            onPress={handleConfirm}
            loading={loading || isLoading}
            style={{
              flex: 1,
              backgroundColor: isDangerous ? theme.color.error : theme.color.success,
            }}
          />
        </Row>
      </Dialog>
    );
  }
);

ConfirmationDialog.displayName = 'ConfirmationDialog';
