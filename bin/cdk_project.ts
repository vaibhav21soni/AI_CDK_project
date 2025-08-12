#!/usr/bin/env node

/**
 * Personal Blog CDK Application Entry Point
 * 
 * ⚠️ AI DISCLAIMER:
 * This project was generated and enhanced using AI assistance (Amazon Q Developer).
 * The code, architecture, and documentation have been created with AI support and 
 * should be thoroughly reviewed, tested, and validated before use in production 
 * environments. Please ensure all components meet your specific requirements and 
 * security standards.
 * 
 * @author Generated with Amazon Q Developer AI
 * @version 1.0.0
 * @license MIT
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PersonalBlogStack } from '../lib/personal-blog-stack';

const app = new cdk.App();

// Create the main stack with environment configuration
new PersonalBlogStack(app, 'PersonalBlogStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Personal Blog - Serverless blog platform built with AWS CDK (AI-generated)',
  tags: {
    Project: 'PersonalBlog',
    Environment: process.env.NODE_ENV || 'development',
    GeneratedBy: 'Amazon Q Developer AI',
    Version: '1.0.0',
  },
});