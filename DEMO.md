# AI Agent Demo Instructions

## Local Demo

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Access the Application
Open your browser and navigate to: http://localhost:3000

### 3. Login
- Click on the login dialog
- Enter any email (e.g., demo@example.com)
- Enter any password
- Click "Login"

### 4. Explore the AI Agent

#### Chat Interface
Once logged in, you'll see the AI Agent chat on the left side of the screen.

#### Sample Interactions

**Basic Conversation:**
- Type: "Hello, what can you do?"
- The agent will explain its capabilities

**AWS Resource Queries:**
- Type: "Show me my AWS resources"
- Type: "List my EC2 instances"
- Type: "What are my AWS costs?"
- Type: "Show S3 buckets"

**Coding Assistance:**
- Type: "Help me write a React component for a todo list"
- Type: "How do I connect to a PostgreSQL database in Node.js?"
- Type: "Explain async/await in JavaScript"

### 5. Features to Demonstrate

1. **Real-time Chat**: Messages appear instantly with timestamps
2. **AWS Integration**: If AWS credentials are configured, real resources will be displayed
3. **Code Generation**: The original Vibe platform's code generation still works
4. **Responsive Design**: Resize the window to see mobile/desktop layouts
5. **Panel Resizing**: Drag panel borders to resize different sections

## Production Demo (Vercel)

### Deployment Steps

1. **Push to GitHub:**
```bash
# If using the provided script
./setup-github.sh  # On Mac/Linux
# OR
setup-github.bat   # On Windows

# Or manually
git remote add origin https://github.com/YOUR_USERNAME/vibe-ai-agent.git
git push -u origin master
```

2. **Deploy to Vercel:**
- Go to https://vercel.com/new
- Import your GitHub repository
- Configure environment variables:
  - `OPENAI_API_KEY` (required)
  - `AWS_ACCESS_KEY_ID` (optional)
  - `AWS_SECRET_ACCESS_KEY` (optional)
  - `AWS_REGION` (optional)
- Click "Deploy"

3. **Access Your Demo:**
- Vercel will provide a URL like: https://vibe-ai-agent.vercel.app
- Share this URL for demos

## Demo Script

### Introduction (30 seconds)
"This is an AI Agent integrated into a SaaS coding platform. It combines OpenAI's GPT-4 with AWS service integration to provide intelligent assistance for developers."

### Authentication (30 seconds)
1. Show the login screen
2. Enter demo credentials
3. Explain that in production, this would connect to a real auth system

### AI Chat Demo (2 minutes)
1. Start with a greeting to show conversational ability
2. Ask a coding question to demonstrate knowledge
3. Request AWS resources to show integration
4. Show cost tracking feature

### AWS Integration (1 minute)
1. Explain that with proper AWS credentials, it shows real resources
2. Demonstrate the formatted output for EC2, S3, Lambda
3. Show cost breakdown if available

### Code Generation (1 minute)
1. Use the original Vibe chat (right panel)
2. Ask it to create a simple React component
3. Show the file explorer with generated files
4. Preview the result

### Responsive Design (30 seconds)
1. Resize the window to show mobile layout
2. Show tab navigation on mobile
3. Return to desktop view

## Key Talking Points

1. **Seamless Integration**: AI Agent works alongside existing coding tools
2. **AWS Visibility**: Real-time resource monitoring and cost tracking
3. **Context Awareness**: The agent maintains conversation context
4. **Security First**: Credentials stored securely, read-only AWS access
5. **Extensible**: Easy to add new AWS services or AI capabilities
6. **Well Documented**: Comprehensive context engineering documentation

## Troubleshooting Demo Issues

### OpenAI API Not Working
- Check API key is valid
- Verify you have credits/billing set up
- Use fallback responses if needed

### AWS Data Not Showing
- Explain that AWS credentials are optional
- Show the mock data structure
- Emphasize security (read-only access)

### Build/Deploy Issues
- Check Node version (18+ required)
- Clear cache and rebuild
- Verify environment variables in Vercel

## Demo Environment Variables

For a full-featured demo, set these in Vercel:

```
OPENAI_API_KEY=sk-...your-key...
AWS_ACCESS_KEY_ID=AKIA...your-key...
AWS_SECRET_ACCESS_KEY=...your-secret...
AWS_REGION=us-east-1
```

## Support

If issues arise during the demo:
1. Check browser console for errors
2. Verify network connectivity
3. Fall back to local development server
4. Use the documented screenshots as backup