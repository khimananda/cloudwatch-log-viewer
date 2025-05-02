import { 
  DescribeLogGroupsCommand, 
  GetLogEventsCommand,
  DescribeLogStreamsCommand,
  OutputLogEvent
} from "@aws-sdk/client-cloudwatch-logs";
import { cloudWatchLogsClient } from "../config/aws-config";

export interface LogGroup {
  logGroupName: string;
  creationTime?: number;
  arn?: string;
}

export const getLogGroups = async (logGroupNamePrefix?: string): Promise<LogGroup[]> => {
  try {
    let allLogGroups: LogGroup[] = [];
    let nextToken: string | undefined;

    do {
      const command = new DescribeLogGroupsCommand({
        limit: 50,
        logGroupNamePrefix,
        nextToken
      });
      
      const response = await cloudWatchLogsClient.send(command);
      
      const groups = (response.logGroups || []).map(group => ({
        logGroupName: group.logGroupName || '',
        creationTime: group.creationTime,
        arn: group.arn
      }));
      
      allLogGroups = [...allLogGroups, ...groups];
      nextToken = response.nextToken;
    } while (nextToken);

    // Sort log groups alphabetically
    return allLogGroups.sort((a, b) => a.logGroupName.localeCompare(b.logGroupName));
  } catch (error) {
    console.error("Error fetching log groups:", error);
    throw error;
  }
};

export const getRecentLogs = async (
  logGroupName: string,
  startTime: number = Date.now() - 10 * 60 * 1000 // last 10 minutes
): Promise<OutputLogEvent[]> => {
  try {
    // First, get the most recent log stream
    const streamsCommand = new DescribeLogStreamsCommand({
      logGroupName,
      orderBy: 'LastEventTime',
      descending: true,
      limit: 1
    });

    const streamsResponse = await cloudWatchLogsClient.send(streamsCommand);
    const logStreamName = streamsResponse.logStreams?.[0]?.logStreamName;

    if (!logStreamName) {
      return [];
    }

    // Then get the logs from that stream
    const command = new GetLogEventsCommand({
      logGroupName,
      logStreamName,
      startTime,
      endTime: Date.now(),
      limit: 100,
      startFromHead: false
    });

    const response = await cloudWatchLogsClient.send(command);
    return response.events || [];
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}; 