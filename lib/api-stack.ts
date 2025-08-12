import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.NestedStackProps {
  postsTable: dynamodb.Table;
}

export class ApiStack extends cdk.NestedStack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    // Create IAM role for Lambda functions
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Grant DynamoDB permissions
    props.postsTable.grantReadWriteData(lambdaRole);

    // Create log groups for Lambda functions
    const getPostsLogGroup = new logs.LogGroup(this, 'GetPostsLogGroup', {
      logGroupName: '/aws/lambda/get-posts',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const createPostLogGroup = new logs.LogGroup(this, 'CreatePostLogGroup', {
      logGroupName: '/aws/lambda/create-post',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Lambda functions with better configuration
    const getPosts = new lambda.Function(this, 'GetPostsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'get-posts.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      environment: {
        POSTS_TABLE_NAME: props.postsTable.tableName,
        NODE_ENV: 'production',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logGroup: getPostsLogGroup,
      description: 'Function to retrieve published blog posts',
    });

    const createPost = new lambda.Function(this, 'CreatePostFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'create-post.handler',
      code: lambda.Code.fromAsset('lambda'),
      role: lambdaRole,
      environment: {
        POSTS_TABLE_NAME: props.postsTable.tableName,
        NODE_ENV: 'production',
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      logGroup: createPostLogGroup,
      description: 'Function to create new blog posts',
    });

    // Create API Gateway with better configuration
    this.api = new apigateway.RestApi(this, 'BlogApi', {
      restApiName: 'Personal Blog API',
      description: 'API for personal blog application',
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: false,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: process.env.NODE_ENV === 'production' 
          ? ['https://your-domain.com'] // Replace with your actual domain
          : apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        maxAge: cdk.Duration.minutes(10),
      },
      cloudWatchRole: true,
    });

    // Create API resources and methods
    const posts = this.api.root.addResource('posts');
    
    // GET /posts - Retrieve published posts
    posts.addMethod('GET', new apigateway.LambdaIntegration(getPosts, {
      proxy: true,
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
          },
        },
      ],
    }), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
    });

    // POST /posts - Create new post
    posts.addMethod('POST', new apigateway.LambdaIntegration(createPost, {
      proxy: true,
      integrationResponses: [
        {
          statusCode: '201',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
          },
        },
      ],
    }), {
      methodResponses: [
        {
          statusCode: '201',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
          },
        },
      ],
      requestValidator: new apigateway.RequestValidator(this, 'PostRequestValidator', {
        restApi: this.api,
        validateRequestBody: true,
        validateRequestParameters: false,
      }),
      requestModels: {
        'application/json': new apigateway.Model(this, 'PostModel', {
          restApi: this.api,
          contentType: 'application/json',
          schema: {
            type: apigateway.JsonSchemaType.OBJECT,
            properties: {
              title: {
                type: apigateway.JsonSchemaType.STRING,
                minLength: 1,
                maxLength: 200,
              },
              content: {
                type: apigateway.JsonSchemaType.STRING,
                minLength: 1,
                maxLength: 10000,
              },
              status: {
                type: apigateway.JsonSchemaType.STRING,
                enum: ['draft', 'published'],
              },
            },
            required: ['title', 'content'],
          },
        }),
      },
    });

    // Output API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
    });
  }
}