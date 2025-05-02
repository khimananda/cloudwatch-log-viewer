import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";
import { CloudWatchClient } from "@aws-sdk/client-cloudwatch";

const getCredentials = () => {
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const sessionToken = import.meta.env.VITE_AWS_SESSION_TOKEN;

  if (!accessKeyId || !secretAccessKey || !sessionToken) {
    throw new Error("AWS credentials not properly configured. Please check your .env file.");
  }

  return {
    accessKeyId,
    secretAccessKey,
    sessionToken
  };
};

export const cloudWatchLogsClient = new CloudWatchLogsClient({
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  credentials: getCredentials(),
});

export const cloudWatchClient = new CloudWatchClient({
  region: import.meta.env.VITE_AWS_REGION || "us-east-1",
  credentials: getCredentials(),
}); 