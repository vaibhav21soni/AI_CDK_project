import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface FrontendStackProps extends cdk.NestedStackProps {
  apiUrl: string;
}

export class FrontendStack extends cdk.NestedStack {
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `personal-blog-${cdk.Aws.ACCOUNT_ID}-${cdk.Aws.REGION}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Create Origin Access Control
    const originAccessControl = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      description: 'OAC for personal blog website',
    });

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket, {
          originAccessControl,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // Grant CloudFront access to S3 bucket
    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
        conditions: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${cdk.Aws.ACCOUNT_ID}:distribution/${this.distribution.distributionId}`,
          },
        },
      })
    );

    // Deploy website assets without Docker bundling (simplified approach)
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./frontend')],
      destinationBucket: websiteBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
      memoryLimit: 512,
      // Use environment variable substitution instead of Docker bundling
      substitutions: {
        'API_URL_PLACEHOLDER': props.apiUrl,
      },
    });

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Website URL',
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: props.apiUrl,
      description: 'API Gateway URL - Update this in your frontend JavaScript',
    });
  }
}
