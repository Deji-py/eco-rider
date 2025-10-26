// Dialog.tsx
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';
import SheetModal from '@/components/ui/SheetModal';
import { useTheme } from '@/context/theme-provider';
import Typography from '@/components/ui/Typography';
import { Row } from '@/components/layout/Layout';
import { spacing } from '@/theme/spacing';
import { X } from 'lucide-react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';

interface DialogProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  detached?: boolean;
  style?: any;
  close?: () => void;
}

export const Dialog = React.forwardRef<any, DialogProps>(
  (
    { close, title, description, children, showCloseButton = true, detached = true, style },
    ref
  ) => {
    const { theme } = useTheme();

    return (
      <SheetModal ref={ref} detached={detached}>
        <BottomSheetView
          style={[{ paddingHorizontal: spacing['2xl'], paddingBottom: spacing.xl }, style]}>
          {/* Header */}
          <Row
            alignItems="center"
            justifyContent="space-between"
            style={{ marginBottom: spacing.md }}>
            <Typography
              type="h6"
              color={theme.color.foreground}
              style={{ flex: 1, fontFamily: 'Inter_600SemiBold' }}>
              {title}
            </Typography>
            {showCloseButton && (
              <Pressable onPress={close} hitSlop={10}>
                <X size={24} color={theme.color.mutedForeground} />
              </Pressable>
            )}
          </Row>

          {/* Description */}
          {description && (
            <Typography
              type="body"
              color={theme.color.mutedForeground}
              style={{ marginBottom: spacing.md }}>
              {description}
            </Typography>
          )}

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </BottomSheetView>
      </SheetModal>
    );
  }
);

Dialog.displayName = 'Dialog';
