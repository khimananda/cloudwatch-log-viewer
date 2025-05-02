# CloudWatch Logs Dashboard

A modern React + TypeScript + Vite application for viewing AWS CloudWatch logs with a beautiful UI, advanced search, and log level highlighting.

## Features
- View and search AWS CloudWatch log groups and recent logs
- Integrated search within the log group selector
- Log level highlighting (INFO, WARN, ERROR, LOG)
- Modern, responsive UI with Material-UI
- Supports AWS SSO and temporary credentials

## Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd log-viewer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure AWS Credentials

#### Option A: AWS SSO (Recommended)
1. Configure SSO with the AWS CLI:
   ```bash
   aws configure sso
   ```
2. Set your SSO profile and region in a `.env` file:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_AWS_PROFILE=your-sso-profile-name
   ```

#### Option B: Temporary Credentials from AWS Access Portal
1. Get credentials from your AWS IAM Identity Center (AWS SSO) portal.
2. Add them to your `.env` file:
   ```env
   VITE_AWS_REGION=us-east-1
   VITE_AWS_ACCESS_KEY_ID=...
   VITE_AWS_SECRET_ACCESS_KEY=...
   VITE_AWS_SESSION_TOKEN=...
   ```
3. **Note:** These credentials expire after a few hours. Refresh as needed.

### 4. Start the development server
```bash
npm run dev
```

## Usage
- The dashboard will open in your browser.
- Use the log group selector to search and select a log group.
- View and search recent logs with real-time filtering and log level highlighting.
- Use the ECS/All Logs toggle to filter log groups by prefix.

## Security
- **Never commit your `.env` file or credentials to version control.**
- Add `.env` to your `.gitignore`.

## Customization
- UI is built with Material-UI and can be easily themed or extended.
- Log level detection and highlighting can be customized in `src/components/LogViewer.tsx`.

## License
MIT
