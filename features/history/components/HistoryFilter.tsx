import { Row } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import SheetModal from '@/components/ui/SheetModal';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import useSheet from '@/hooks/useSheet';
import { sizes } from '@/theme/sizes';
import { spacing } from '@/theme/spacing';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { ChevronDown, X } from 'lucide-react-native';
import { View, ScrollView, Pressable } from 'react-native';
import { RadioGroup, RadioOption } from '@/components/ui/Radio';

type OrderStatus = 'all' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
type SortBy = 'recent' | 'oldest' | 'amount-high' | 'amount-low';

interface HistoryFilterProps {
  selectedStatus: OrderStatus;
  selectedSort: SortBy;
  onStatusChange: (status: OrderStatus) => void;
  onSortChange: (sort: SortBy) => void;
  totalCount?: number;
}

const HistoryFilter = ({
  selectedStatus,
  selectedSort,
  onStatusChange,
  onSortChange,
  totalCount = 0,
}: HistoryFilterProps) => {
  const { theme } = useTheme();
  const { ref: sheetRef, open, close } = useSheet();

  const statusOptions: RadioOption<OrderStatus>[] = [
    { label: 'All Orders', value: 'all' },
    { label: 'Assigned', value: 'assigned' },
    { label: 'In Progress', value: 'picked_up' },
    { label: 'Completed', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const sortOptions: RadioOption<SortBy>[] = [
    { label: 'Most Recent', value: 'recent' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Highest Amount', value: 'amount-high' },
    { label: 'Lowest Amount', value: 'amount-low' },
  ];

  const handleReset = () => {
    onStatusChange('all');
    onSortChange('recent');
  };

  const handleApply = () => {
    close();
  };

  const getStatusLabel = () => {
    const option = statusOptions.find((opt) => opt.value === selectedStatus);
    return option?.label || 'All Orders';
  };

  return (
    <>
      <Card
        variant="filled"
        style={{ marginVertical: spacing.sm, borderWidth: 0.5, borderColor: theme.color.border }}>
        <Row gap="md" alignItems="center" justifyContent="space-between">
          <View>
            <Typography type="body" color={theme.color.mutedForeground} style={{ opacity: 0.8 }}>
              Order History
            </Typography>
            {totalCount > 0 && (
              <Typography
                type="xtraSmall"
                color={theme.color.mutedForeground}
                style={{ marginTop: 2 }}>
                {totalCount} {totalCount === 1 ? 'order' : 'orders'}
              </Typography>
            )}
          </View>

          <Button
            icon={<ChevronDown opacity={0.8} color={theme.color.mutedForeground} size={sizes.xs} />}
            onPress={open}
            label="Filter"
            variant="outlined"
            size="sm"
          />
        </Row>

        {/* Active Filters Display */}
        {(selectedStatus !== 'all' || selectedSort !== 'recent') && (
          <Row gap="xs" style={{ marginTop: spacing.sm, flexWrap: 'wrap' }}>
            {selectedStatus !== 'all' && (
              <View
                style={{
                  backgroundColor: `${theme.color.primary}15`,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: theme.radius.sm,
                }}>
                <Typography type="xtraSmall" style={{ color: theme.color.primary }}>
                  {getStatusLabel()}
                </Typography>
              </View>
            )}
            {selectedSort !== 'recent' && (
              <View
                style={{
                  backgroundColor: `${theme.color.secondary}15`,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: theme.radius.sm,
                }}>
                <Typography type="xtraSmall" style={{ color: theme.color.secondary }}>
                  {sortOptions.find((opt) => opt.value === selectedSort)?.label}
                </Typography>
              </View>
            )}
          </Row>
        )}
      </Card>

      <SheetModal ref={sheetRef}>
        <BottomSheetView style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xl }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Row
              alignItems="center"
              justifyContent="space-between"
              style={{ marginBottom: spacing.lg }}>
              <Typography type="h6" fontWeight="600" color={theme.color.foreground}>
                Filter Orders
              </Typography>
              <Pressable onPress={close}>
                <X size={24} color={theme.color.mutedForeground} />
              </Pressable>
            </Row>

            {/* Status Filter Section */}
            <View style={{ marginBottom: spacing.lg }}>
              <Typography
                type="small"
                fontWeight="600"
                color={theme.color.mutedForeground}
                style={{ marginBottom: spacing.md, opacity: 0.7 }}>
                Order Status
              </Typography>
              <RadioGroup
                value={selectedStatus}
                onValueChange={onStatusChange}
                options={statusOptions}
                size="md"
                direction="vertical"
                gap={spacing.xs}
              />
            </View>

            {/* Sort By Section */}
            <View style={{ marginBottom: spacing.lg }}>
              <Typography
                type="small"
                fontWeight="600"
                color={theme.color.mutedForeground}
                style={{ marginBottom: spacing.md, opacity: 0.7 }}>
                Sort By
              </Typography>
              <RadioGroup
                value={selectedSort}
                onValueChange={onSortChange}
                options={sortOptions}
                size="md"
                direction="vertical"
                gap={spacing.xs}
              />
            </View>

            {/* Action Buttons */}
            <Row gap="md" spacingBottom="xl" style={{ marginTop: spacing.lg }}>
              <Button label="Reset" variant="outlined" onPress={handleReset} style={{ flex: 1 }} />
              <Button label="Apply" onPress={handleApply} style={{ flex: 1 }} />
            </Row>
          </ScrollView>
        </BottomSheetView>
      </SheetModal>
    </>
  );
};

export default HistoryFilter;
