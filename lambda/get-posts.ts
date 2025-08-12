import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

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

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    // Use Query on StatusIndex for better performance
    const result = await docClient.send(new QueryCommand({
      TableName: process.env.POSTS_TABLE_NAME,
      IndexName: 'StatusIndex',
      KeyConditionExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'published'
      },
      ScanIndexForward: false, // Sort by createdAt descending (newest first)
      Limit: 50 // Limit results for better performance
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      body: JSON.stringify(result.Items || []),
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch posts',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      }),
    };
  }
};
