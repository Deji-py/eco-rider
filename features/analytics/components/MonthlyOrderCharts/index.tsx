import { Card } from '@/components/ui/Card';
import { BarChart } from 'react-native-gifted-charts';
import { View } from 'react-native';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/context/theme-provider';
import { Button } from '@/components/ui/Button';
import { History, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react-native';
import { sizes } from '@/theme/sizes';

export interface MonthlyOrder {
  month: string;
  year: number;
  count: number;
  label: string;
}

interface MonthlyOrdersChartProps {
  monthlyOrders?: MonthlyOrder[];
  isLoading?: boolean;
}

const MonthlyOrdersChart: React.FC<MonthlyOrdersChartProps> = ({ monthlyOrders, isLoading }) => {
  const { theme } = useTheme();

  // Transform data for chart
  const barData =
    monthlyOrders?.map((order) => ({
      value: order.count,
      label: order.label,
    })) || [];

  // Calculate trend
  const calculateTrend = () => {
    if (!monthlyOrders || monthlyOrders.length < 2) return { percentage: 0, isUp: false };

    const lastMonth = monthlyOrders[monthlyOrders.length - 1].count;
    const previousMonth = monthlyOrders[monthlyOrders.length - 2].count;

    if (previousMonth === 0) return { percentage: 0, isUp: lastMonth > 0 };

    const percentage = ((lastMonth - previousMonth) / previousMonth) * 100;
    return {
      percentage: Math.abs(percentage),
      isUp: percentage > 0,
    };
  };

  const trend = calculateTrend();
  const maxValue = Math.max(...barData.map((d) => d.value), 320);

  // Empty state
  if (!monthlyOrders || monthlyOrders.length === 0) {
    return (
      <Card variant="filled" style={{ borderWidth: 0.5, borderColor: theme.color.border }}>
        <Card.Header
          title="Monthly Orders"
          style={{
            borderBottomWidth: 0.5,
            paddingBottom: 8,
            borderBottomColor: theme.color.border,
          }}
          subtitle="No data available"
        />
        <Card.Content>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 60,
            }}>
            <BarChart3 size={48} color={theme.color.mutedForeground} opacity={0.3} />
            <Typography
              type="body"
              color={theme.color.mutedForeground}
              style={{ marginTop: 12, opacity: 0.6 }}>
              No monthly data yet
            </Typography>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card variant="filled" style={{ borderWidth: 0.5, borderColor: theme.color.border }}>
      <Card.Header
        title="Monthly Orders"
        style={{ borderBottomWidth: 0.5, paddingBottom: 8, borderBottomColor: theme.color.border }}
        subtitle={`${monthlyOrders[0].month} - ${monthlyOrders[monthlyOrders.length - 1].month} ${
          monthlyOrders[0].year
        }`}
        rightComponent={
          <Button
            size="sm"
            icon={<History size={sizes.xs} color={theme.color.mutedForeground} />}
            onPress={() => {}}
            borderRadius={9999}
            variant="ghost"
            label="View History"
          />
        }
      />
      <Card.Content style={{ overflow: 'hidden' }}>
        <View style={{ width: '100%' }}>
          <BarChart
            barBorderRadius={8}
            barWidth={44}
            noOfSections={4}
            maxValue={maxValue}
            showValuesAsTopLabel
            showGradient
            gradientColor="#FF3D00"
            frontColor="#FF8F2C"
            data={barData}
            hideYAxisText
            yAxisThickness={0}
            xAxisThickness={0}
            spacing={10}
            disablePress
          />
        </View>
      </Card.Content>
      <Card.Footer style={{ paddingTop: 5 }}>
        <View style={{ gap: 4 }}>
          <Typography type="h6" color={theme.color.foreground}>
            {trend.isUp ? 'Trending up' : 'Trending down'} by {trend.percentage.toFixed(1)}% this
            month{' '}
            {trend.isUp ? (
              <TrendingUp size={16} color="#0D7C2D" opacity={0.8} />
            ) : (
              <TrendingDown size={16} color="#FF3B30" opacity={0.8} />
            )}
          </Typography>
          <Typography type="small" style={{ opacity: 0.8 }} color={theme.color.mutedForeground}>
            Showing total orders for the last {monthlyOrders.length} months
          </Typography>
        </View>
      </Card.Footer>
    </Card>
  );
};

export default MonthlyOrdersChart;
