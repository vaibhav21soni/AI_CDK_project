import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

interface MonitoringStackProps extends cdk.NestedStackProps {
  api: apigateway.RestApi;
  lambdaFunctions: lambda.Function[];
  table: dynamodb.Table;
  alertEmail?: string;
}

export class MonitoringStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // SNS Topic for alerts
    const alertTopic = new sns.Topic(this, 'AlertTopic', {
      displayName: 'Blog Application Alerts',
    });

    if (props.alertEmail) {
      alertTopic.addSubscription(
        new snsSubscriptions.EmailSubscription(props.alertEmail)
      );
    }

    // CloudWatch Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'BlogDashboard', {
      dashboardName: 'PersonalBlogMetrics',
    });

    // API Gateway Metrics
    const apiWidget = new cloudwatch.GraphWidget({
      title: 'API Gateway Metrics',
      left: [
        props.api.metricCount(),
        props.api.metricLatency(),
      ],
      right: [
        props.api.metric4XXError(),
        props.api.metric5XXError(),
      ],
    });

    // Lambda Metrics
    const lambdaWidgets = props.lambdaFunctions.map((func, index) => 
      new cloudwatch.GraphWidget({
        title: `Lambda Metrics - ${func.functionName}`,
        left: [
          func.metricInvocations(),
          func.metricDuration(),
        ],
        right: [
          func.metricErrors(),
          func.metricThrottles(),
        ],
      })
    );

    // DynamoDB Metrics
    const dynamoWidget = new cloudwatch.GraphWidget({
      title: 'DynamoDB Metrics',
      left: [
        props.table.metricConsumedReadCapacityUnits(),
        props.table.metricConsumedWriteCapacityUnits(),
      ],
      right: [
        props.table.metricThrottledRequests(),
      ],
    });

    // Add widgets to dashboard
    dashboard.addWidgets(apiWidget);
    lambdaWidgets.forEach(widget => dashboard.addWidgets(widget));
    dashboard.addWidgets(dynamoWidget);

    // Alarms
    // API Gateway 5XX errors
    new cloudwatch.Alarm(this, 'ApiGateway5XXAlarm', {
      metric: props.api.metric5XXError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 5,
      evaluationPeriods: 2,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch.SnsAction(alertTopic));

    // Lambda Error Rate
    props.lambdaFunctions.forEach((func, index) => {
      new cloudwatch.Alarm(this, `Lambda${index}ErrorAlarm`, {
        metric: func.metricErrors({
          period: cdk.Duration.minutes(5),
          statistic: 'Sum',
        }),
        threshold: 3,
        evaluationPeriods: 2,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(new cloudwatch.SnsAction(alertTopic));

      // Lambda Duration
      new cloudwatch.Alarm(this, `Lambda${index}DurationAlarm`, {
        metric: func.metricDuration({
          period: cdk.Duration.minutes(5),
          statistic: 'Average',
        }),
        threshold: 10000, // 10 seconds
        evaluationPeriods: 3,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(new cloudwatch.SnsAction(alertTopic));
    });

    // DynamoDB Throttling
    new cloudwatch.Alarm(this, 'DynamoDBThrottleAlarm', {
      metric: props.table.metricThrottledRequests({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(new cloudwatch.SnsAction(alertTopic));

    // Outputs
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://console.aws.amazon.com/cloudwatch/home?region=${cdk.Aws.REGION}#dashboards:name=${dashboard.dashboardName}`,
      description: 'CloudWatch Dashboard URL',
    });

    new cdk.CfnOutput(this, 'AlertTopicArn', {
      value: alertTopic.topicArn,
      description: 'SNS Topic ARN for alerts',
    });
  }
}
