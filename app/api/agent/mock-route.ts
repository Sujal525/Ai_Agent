import { NextRequest, NextResponse } from 'next/server'

// Mock responses for demo purposes when OpenAI quota is exceeded
const mockResponses: Record<string, string> = {
  'hello': 'Hello! I\'m your AI Assistant. I can help you with coding questions and AWS resource management. Try asking me about AWS resources or any coding topic!',
  'aws': 'I can help you manage AWS resources. Try asking me to "list EC2 instances" or "show AWS costs".',
  'help': 'I can assist with:\n• Coding questions and debugging\n• AWS resource listing (EC2, S3, Lambda)\n• Cost analysis and tracking\n• General programming advice\n\nWhat would you like help with?',
  'react': 'Here\'s a simple React component example:\n\n```jsx\nfunction TodoItem({ task, onComplete }) {\n  return (\n    <div className="todo-item">\n      <input type="checkbox" onChange={onComplete} />\n      <span>{task}</span>\n    </div>\n  );\n}\n```\n\nWould you like me to explain more about React components?',
  'python': 'Here\'s a Python example:\n\n```python\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# Usage\nprint(fibonacci(10))  # Output: 55\n```',
  'default': 'I understand your question. While I\'m currently in demo mode due to API limitations, I can still help with basic coding questions and show you AWS resource structures. What specific topic would you like to explore?'
}

function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return mockResponses.hello
  }
  if (lowerMessage.includes('aws') || lowerMessage.includes('resource')) {
    return mockResponses.aws
  }
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return mockResponses.help
  }
  if (lowerMessage.includes('react')) {
    return mockResponses.react
  }
  if (lowerMessage.includes('python')) {
    return mockResponses.python
  }
  
  return mockResponses.default
}

export async function POST(req: NextRequest) {
  try {
    const { messages, action } = await req.json()
    
    if (action === 'aws') {
      // Return mock AWS data for demo
      return NextResponse.json({
        data: {
          ec2Instances: [
            {
              id: 'i-demo123456',
              type: 't2.micro',
              state: 'running',
              publicIp: '54.123.45.67',
              privateIp: '172.31.32.123',
              launchTime: new Date().toISOString(),
            },
            {
              id: 'i-demo789012',
              type: 't3.medium',
              state: 'running',
              publicIp: '54.123.45.68',
              privateIp: '172.31.32.124',
              launchTime: new Date().toISOString(),
            }
          ],
          s3Buckets: [
            { name: 'my-app-bucket', creationDate: new Date().toISOString() },
            { name: 'backup-bucket-2024', creationDate: new Date().toISOString() },
            { name: 'static-assets', creationDate: new Date().toISOString() }
          ],
          lambdaFunctions: [
            {
              name: 'processPayments',
              runtime: 'nodejs18.x',
              lastModified: new Date().toISOString(),
              memorySize: 256,
              timeout: 30
            },
            {
              name: 'sendEmails',
              runtime: 'python3.11',
              lastModified: new Date().toISOString(),
              memorySize: 128,
              timeout: 15
            }
          ],
          costs: [{
            period: {
              Start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              End: new Date().toISOString().split('T')[0]
            },
            total: '127.45',
            currency: 'USD',
            services: [
              { service: 'EC2', amount: '45.23' },
              { service: 'S3', amount: '12.87' },
              { service: 'Lambda', amount: '8.34' },
              { service: 'RDS', amount: '61.01' }
            ]
          }]
        }
      })
    }
    
    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || ''
    const response = getMockResponse(lastMessage)
    
    return NextResponse.json({
      message: response,
      isMockResponse: true
    })
  } catch (error) {
    console.error('Mock API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}