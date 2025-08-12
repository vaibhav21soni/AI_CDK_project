import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class DatabaseStack extends cdk.NestedStack {
  public readonly postsTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    this.postsTable = new dynamodb.Table(this, 'PostsTable', {
      tableName: 'blog-posts',
      partitionKey: {
        name: 'postId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    this.postsTable.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}