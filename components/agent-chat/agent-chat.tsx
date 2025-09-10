'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Send, User, Cloud, DollarSign, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Badge } from '@/components/ui/badge'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  awsData?: any
}

export function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Agent. I can help you with coding questions and AWS resource management. Try asking me to list your AWS resources!',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [awsResources, setAwsResources] = useState<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      if (input.toLowerCase().includes('aws') || input.toLowerCase().includes('resources') || input.toLowerCase().includes('cost')) {
        const awsResponse = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'aws' }),
        })
        const awsData = await awsResponse.json()
        
        setAwsResources(awsData.data)
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: formatAWSResponse(awsData.data),
          timestamp: new Date(),
          awsData: awsData.data,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        const data = await response.json()
        
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message || 'I encountered an error. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure your OpenAI API key is configured correctly in the environment variables. If the issue persists, try refreshing the page.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatAWSResponse = (data: any) => {
    if (!data) return 'No AWS data available.'
    
    if (data.error) {
      return `Note: Some AWS services may not be accessible. Please ensure your AWS credentials are configured in the environment variables.`
    }

    let response = '### AWS Resources Summary\n\n'
    
    if (data.ec2Instances?.length > 0) {
      response += `**EC2 Instances (${data.ec2Instances.length}):**\n`
      data.ec2Instances.forEach((instance: any) => {
        response += `- ${instance.id} (${instance.type}) - ${instance.state}\n`
      })
      response += '\n'
    } else {
      response += '**EC2 Instances:** None found\n\n'
    }
    
    if (data.s3Buckets?.length > 0) {
      response += `**S3 Buckets (${data.s3Buckets.length}):**\n`
      data.s3Buckets.forEach((bucket: any) => {
        response += `- ${bucket.name}\n`
      })
      response += '\n'
    } else {
      response += '**S3 Buckets:** None found\n\n'
    }
    
    if (data.lambdaFunctions?.length > 0) {
      response += `**Lambda Functions (${data.lambdaFunctions.length}):**\n`
      data.lambdaFunctions.forEach((func: any) => {
        response += `- ${func.name} (${func.runtime})\n`
      })
      response += '\n'
    } else {
      response += '**Lambda Functions:** None found\n\n'
    }
    
    if (data.costs?.length > 0) {
      response += '**Monthly Costs:**\n'
      data.costs.forEach((cost: any) => {
        response += `- Period: ${cost.period?.Start} to ${cost.period?.End}\n`
        response += `- Total: $${parseFloat(cost.total || 0).toFixed(2)} ${cost.currency || 'USD'}\n`
        if (cost.services?.length > 0) {
          response += '  Top Services:\n'
          cost.services.slice(0, 5).forEach((service: any) => {
            response += `    - ${service.service}: $${parseFloat(service.amount || 0).toFixed(2)}\n`
          })
        }
      })
    } else {
      response += '**Cost Data:** Not available (requires Cost Explorer API access)\n'
    }
    
    return response
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <h2 className="font-semibold">AI Agent Chat</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Cloud className="h-3 w-3 mr-1" />
            AWS
          </Badge>
          <Badge variant="outline">
            <DollarSign className="h-3 w-3 mr-1" />
            Cost Tracking
          </Badge>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about AWS resources or coding questions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}