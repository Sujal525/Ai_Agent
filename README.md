# AI Agent with AWS Integration - Vibe Coding Platform

A powerful SaaS starter kit featuring an AI Agent powered by OpenAI that can interact with AWS services, providing real-time resource management and cost tracking capabilities.

## Features

- **AI-Powered Chat Interface**: Intelligent assistant using OpenAI GPT-4
- **AWS Resource Management**: List and monitor EC2, S3, Lambda resources
- **Cost Tracking**: Real-time AWS cost analysis and reporting
- **Authentication System**: Secure user login and session management
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Code Generation**: AI-assisted code generation and debugging

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key
- AWS credentials (optional, for AWS features)
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd vibe-ai-agent
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key (optional)
AWS_SECRET_ACCESS_KEY=your_aws_secret_key (optional)
AWS_REGION=us-east-1 (optional)
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Login
- Use any email and password to login (demo mode)
- The system will create a session for you

### AI Agent Chat
Once logged in, you can:
- Ask coding questions
- Request AWS resource listings
- Get cost analysis reports
- Generate code snippets

### Example Queries
- "List all my AWS EC2 instances"
- "Show me my AWS costs for the last month"
- "Help me write a React component"
- "What S3 buckets do I have?"

## AWS Setup (Optional)

To enable AWS features, you need:

1. **Create IAM User** with programmatic access
2. **Attach Policies**:
   - `AmazonEC2ReadOnlyAccess`
   - `AmazonS3ReadOnlyAccess`
   - `AWSLambda_ReadOnlyAccess`
   - `AWSBillingReadOnlyAccess`

3. **Add credentials** to `.env.local`

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/vibe-ai-agent)

### Manual Deployment

1. Push your code to GitHub

2. Import project in Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. Set environment variables in Vercel Dashboard:
   - `OPENAI_API_KEY`
   - `AWS_ACCESS_KEY_ID` (optional)
   - `AWS_SECRET_ACCESS_KEY` (optional)
   - `AWS_REGION` (optional)

## Architecture

```
├── app/
│   ├── api/
│   │   ├── agent/          # AI Agent API endpoint
│   │   └── chat/           # Original chat API
│   ├── client-page.tsx     # Main client component
│   └── page.tsx            # Root page
├── components/
│   ├── agent-chat/         # AI Agent chat UI
│   ├── login/              # Authentication UI
│   └── ...                 # Other UI components
├── lib/
│   ├── auth-context.tsx    # Authentication context
│   └── ...                 # Utilities
└── CONTEXT_ENGINEERING.md  # Detailed documentation
```

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Code Quality
```bash
pnpm lint
```

## Security Considerations

- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement rate limiting in production
- Regular security audits recommended
- Use minimal AWS IAM permissions

## License

MIT License - See LICENSE file for details

---

Built with ❤️ using Next.js, OpenAI, and AWS SDK
