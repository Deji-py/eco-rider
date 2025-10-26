import { useCallback, useRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

interface UseSheetProps {
  onOpen?: () => void;
  onClose?: () => void;
  onChange?: (index: number) => void;
}

const useSheet = ({ onOpen, onClose, onChange }: UseSheetProps = {}) => {
  const ref = useRef<BottomSheetModal>(null);

  const open = useCallback(() => {
    ref.current?.present();
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    ref.current?.dismiss();
    onClose?.();
  }, [onClose]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      console.log('handleSheetChanges', index);

      // -1 means sheet is closed
      if (index === -1) {
        onClose?.();
      } else if (index >= 0) {
        onOpen?.();
      }

      onChange?.(index);
    },
    [onOpen, onClose, onChange]
  );

  return {
    ref,
    open,
    close,
    handleSheetChanges,
    isPresented: () => ref.current?.present !== undefined,
  };
};

export default useSheet;
