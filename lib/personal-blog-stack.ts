/**
 * Personal Blog Main Stack
 * 
 * ⚠️ AI DISCLAIMER:
 * This stack was generated and enhanced using AI assistance (Amazon Q Developer).
 * Please review all configurations, security settings, and resource definitions
 * before deploying to production environments.
 * 
 * @author Generated with Amazon Q Developer AI
 * @version 1.0.0
 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DatabaseStack } from './database-stack';
import { ApiStack } from './api-stack';
import { FrontendStack } from './frontend-stack';

export class PersonalBlogStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create nested stacks with proper dependencies
    const databaseStack = new DatabaseStack(this, 'DatabaseStack');
    
    const apiStack = new ApiStack(this, 'ApiStack', {
      postsTable: databaseStack.postsTable,
    });
    
    const frontendStack = new FrontendStack(this, 'FrontendStack', {
      apiUrl: apiStack.api.url,
    });

    // Establish dependencies between stacks
    apiStack.addDependency(databaseStack);
    frontendStack.addDependency(apiStack);

    // Add stack-level outputs
    new cdk.CfnOutput(this, 'ProjectInfo', {
      value: 'Personal Blog - AI Generated with Amazon Q Developer',
      description: 'Project information and AI attribution',
    });

    new cdk.CfnOutput(this, 'DeploymentInstructions', {
      value: 'Please review all AI-generated code before production use',
      description: 'Important deployment notice',
    });
  }
}