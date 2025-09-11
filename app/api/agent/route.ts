import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2'
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import { LambdaClient, ListFunctionsCommand } from '@aws-sdk/client-lambda'
import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, action } = await req.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Configuration Required',
          message: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.',
          type: 'configuration_error'
        },
        { status: 500 }
      )
    }

    if (action === 'aws') {
      const awsData = await getAWSResources()
      return NextResponse.json({ data: awsData })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant integrated into a coding platform. 
          You can help with coding questions, AWS resource management, and general assistance. 
          When asked about AWS resources, you can fetch and display current AWS resources and costs.
          Be helpful, concise, and technical in your responses.`
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    return NextResponse.json({
      message: completion.choices[0].message.content,
    })
  } catch (error: any) {
    console.error('Agent API Error:', error)
    
    // Check if it's an OpenAI quota/billing error
    const errorString = JSON.stringify(error)
    if (errorString.includes('insufficient_quota') || error.code === 'insufficient_quota') {
      return NextResponse.json(
        { 
          error: 'OpenAI API Billing Required',
          message: 'Your OpenAI API key has exceeded its quota. Please add billing details to your OpenAI account at https://platform.openai.com/account/billing to continue using the AI features.',
          type: 'insufficient_quota'
        },
        { status: 402 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'API Error',
        message: error.message || 'Failed to process request',
        type: 'api_error'
      },
      { status: 500 }
    )
  }
}

async function getAWSResources() {
  const region = process.env.AWS_REGION || 'us-east-1'
  
  const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }

  const results: any = {
    ec2Instances: [],
    s3Buckets: [],
    lambdaFunctions: [],
    costs: null,
    error: null
  }

  try {
    const ec2Client = new EC2Client({ region, credentials })
    const ec2Response = await ec2Client.send(new DescribeInstancesCommand({}))
    
    results.ec2Instances = ec2Response.Reservations?.flatMap(reservation =>
      reservation.Instances?.map(instance => ({
        id: instance.InstanceId,
        type: instance.InstanceType,
        state: instance.State?.Name,
        publicIp: instance.PublicIpAddress,
        privateIp: instance.PrivateIpAddress,
        launchTime: instance.LaunchTime,
        tags: instance.Tags,
      })) || []
    ) || []
  } catch (error) {
    console.error('EC2 fetch error:', error)
    results.error = 'Failed to fetch EC2 instances'
  }

  try {
    const s3Client = new S3Client({ region, credentials })
    const s3Response = await s3Client.send(new ListBucketsCommand({}))
    
    results.s3Buckets = s3Response.Buckets?.map(bucket => ({
      name: bucket.Name,
      creationDate: bucket.CreationDate,
    })) || []
  } catch (error) {
    console.error('S3 fetch error:', error)
    results.error = results.error || 'Failed to fetch S3 buckets'
  }

  try {
    const lambdaClient = new LambdaClient({ region, credentials })
    const lambdaResponse = await lambdaClient.send(new ListFunctionsCommand({}))
    
    results.lambdaFunctions = lambdaResponse.Functions?.map(func => ({
      name: func.FunctionName,
      runtime: func.Runtime,
      lastModified: func.LastModified,
      codeSize: func.CodeSize,
      memorySize: func.MemorySize,
      timeout: func.Timeout,
    })) || []
  } catch (error) {
    console.error('Lambda fetch error:', error)
    results.error = results.error || 'Failed to fetch Lambda functions'
  }

  try {
    const costClient = new CostExplorerClient({ region: 'us-east-1', credentials })
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const costResponse = await costClient.send(new GetCostAndUsageCommand({
      TimePeriod: {
        Start: startDate.toISOString().split('T')[0],
        End: endDate.toISOString().split('T')[0],
      },
      Granularity: 'MONTHLY',
      Metrics: ['UnblendedCost'],
      GroupBy: [{
        Type: 'DIMENSION',
        Key: 'SERVICE',
      }],
    }))

    results.costs = costResponse.ResultsByTime?.map(result => ({
      period: result.TimePeriod,
      total: result.Total?.UnblendedCost?.Amount,
      currency: result.Total?.UnblendedCost?.Unit,
      services: result.Groups?.map(group => ({
        service: group.Keys?.[0],
        amount: group.Metrics?.UnblendedCost?.Amount,
      })),
    }))
  } catch (error) {
    console.error('Cost Explorer fetch error:', error)
    results.error = results.error || 'Failed to fetch cost data'
  }

  return results
}