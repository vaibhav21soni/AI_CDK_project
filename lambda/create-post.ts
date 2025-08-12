import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Initialize client outside handler for connection reuse
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  maxAttempts: 3,
});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

interface CreatePostRequest {
  title: string;
  content: string;
  status?: 'draft' | 'published';
}

function validatePostData(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  } else if (body.title.trim().length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
    errors.push('Content is required and must be a non-empty string');
  } else if (body.content.trim().length > 10000) {
    errors.push('Content must be less than 10,000 characters');
  }

  if (body.status && !['draft', 'published'].includes(body.status)) {
    errors.push('Status must be either "draft" or "published"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
}

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    // Parse and validate request body
    let body: CreatePostRequest;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body' 
        }),
      };
    }

    // Validate input
    const validation = validatePostData(body);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Validation failed',
          details: validation.errors
        }),
      };
    }

    const postId = uuidv4();
    const createdAt = new Date().toISOString();

    const post = {
      postId,
      createdAt,
      title: sanitizeInput(body.title),
      content: sanitizeInput(body.content),
      status: body.status || 'draft',
      updatedAt: createdAt,
    };

    await docClient.send(new PutCommand({
      TableName: process.env.POSTS_TABLE_NAME,
      Item: post,
      // Prevent overwriting existing posts with same ID (though UUID collision is extremely unlikely)
      ConditionExpression: 'attribute_not_exists(postId)'
    }));

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(post),
    };
  } catch (error) {
    console.error('Error creating post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Handle specific DynamoDB errors
    if (error instanceof Error && error.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: 'Post with this ID already exists' 
        }),
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to create post',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }),
    };
  }
};
