import { GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { cloudWatchClient } from "../config/aws-config";

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
}

export const getLast10MinutesMetrics = async (
  metricName: string,
  namespace: string,
  dimensions: { Name: string; Value: string }[]
): Promise<MetricDataPoint[]> => {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - 10 * 60 * 1000); // 10 minutes ago

  const command = new GetMetricDataCommand({
    StartTime: startTime,
    EndTime: endTime,
    MetricDataQueries: [
      {
        Id: "metric1",
        MetricStat: {
          Metric: {
            Namespace: namespace,
            MetricName: metricName,
            Dimensions: dimensions,
          },
          Period: 60, // 1 minute intervals
          Stat: "Average",
        },
      },
    ],
  });

  try {
    const response = await cloudWatchClient.send(command);
    const metricData = response.MetricDataResults?.[0];

    if (!metricData?.Timestamps || !metricData.Values || metricData.Timestamps.length !== metricData.Values.length) {
      return [];
    }

    const values = metricData.Values;
    return metricData.Timestamps.map((timestamp, index) => ({
      timestamp: timestamp,
      value: values[index],
    }));
  } catch (error) {
    console.error("Error fetching CloudWatch metrics:", error);
    throw error;
  }
}; 