import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLast10MinutesMetrics, MetricDataPoint } from '../services/cloudwatch-service';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricData, setMetricData] = useState<MetricDataPoint[]>([]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLast10MinutesMetrics(
        'CPUUtilization', // Example metric
        'AWS/EC2', // Example namespace
        [{ Name: 'InstanceId', Value: 'i-1234567890abcdef0' }] // Example dimension
      );
      setMetricData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">CloudWatch Metrics Dashboard</Typography>
          <Button
            variant="contained"
            onClick={fetchMetrics}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            Error: {error}
          </Typography>
        )}

        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metricData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                formatter={(value: number) => [value.toFixed(2), 'Value']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard; 