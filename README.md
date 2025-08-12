# 🚀 Personal Blog - AWS CDK Project

A modern, serverless personal blog application built with AWS CDK, featuring a beautiful responsive frontend and robust backend infrastructure.

## ⚠️ AI Disclaimer

**This project was generated and enhanced using AI assistance (Amazon Q Developer).** The code, architecture, and documentation have been created with AI support and should be thoroughly reviewed, tested, and validated before use in production environments. While the AI has followed best practices and included comprehensive testing, please ensure all components meet your specific requirements and security standards.

## 🏗️ Architecture Overview

This project implements a modern serverless blog platform using AWS services:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │    │   API Gateway    │    │   DynamoDB      │
│   + S3 Bucket   │◄──►│   + Lambda       │◄──►│   (Posts)       │
│   (Frontend)    │    │   (Backend API)  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 🔧 Infrastructure Components

- **Frontend**: Static website hosted on S3 with CloudFront CDN
- **API**: RESTful API using API Gateway and Lambda functions
- **Database**: DynamoDB for storing blog posts
- **Security**: IAM roles, CORS configuration, input validation
- **Monitoring**: CloudWatch logs and metrics

## ✨ Features

### 🎨 Frontend Features
- **Modern UI/UX**: Beautiful gradient design with smooth animations
- **Dark/Light Theme**: Toggle between themes with persistent storage
- **Responsive Design**: Mobile-first approach, works on all devices
- **Real-time Search**: Instant post filtering as you type
- **Interactive Elements**: Like, share, bookmark posts
- **Auto-save Drafts**: Never lose your work with local storage backup
- **Character Counters**: Real-time feedback on input limits
- **Toast Notifications**: Beautiful feedback messages
- **Floating Action Button**: Quick access to create posts
- **Reading Time**: Estimated reading time for each post
- **Tag Support**: Organize posts with tags
- **Post Statistics**: View total posts, views, and last updated

### 🔧 Backend Features
- **RESTful API**: Clean API endpoints for CRUD operations
- **Input Validation**: Comprehensive server-side validation
- **Error Handling**: Graceful error responses with detailed messages
- **CORS Support**: Proper cross-origin resource sharing
- **Security**: XSS protection, input sanitization
- **Scalability**: Serverless architecture that scales automatically
- **Monitoring**: CloudWatch integration for observability

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)

### Installation

1. **Clone and setup**:
```bash
git clone <your-repo-url>
cd CDK_project
npm install
```

2. **Install Lambda dependencies**:
```bash
cd lambda
npm install
cd ..
```

3. **Bootstrap CDK** (first time only):
```bash
npm run bootstrap
```

4. **Deploy to AWS**:
```bash
npm run deploy
```

### 🧪 Local Development

**Test Frontend Locally**:
```bash
npm run test:frontend
# Open http://localhost:3000
```

**Run Tests**:
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**Build Project**:
```bash
npm run build           # Compile TypeScript
npm run synth           # Generate CloudFormation
```

## 📁 Project Structure

```
CDK_project/
├── 📁 bin/                    # CDK app entry point
│   └── cdk_project.ts
├── 📁 lib/                    # CDK stack definitions
│   ├── personal-blog-stack.ts # Main stack
│   ├── database-stack.ts      # DynamoDB resources
│   ├── api-stack.ts          # API Gateway + Lambda
│   ├── frontend-stack.ts     # S3 + CloudFront
│   └── monitoring-stack.ts   # CloudWatch dashboards
├── 📁 lambda/                 # Lambda function code
│   ├── get-posts.ts          # Retrieve posts
│   ├── create-post.ts        # Create new posts
│   └── package.json          # Lambda dependencies
├── 📁 frontend/               # Static website files
│   ├── index.html            # Main HTML file
│   ├── style.css             # Enhanced CSS with themes
│   └── script.js             # Interactive JavaScript
├── 📁 test/                   # Test files
│   ├── cdk_project.test.ts   # CDK stack tests
│   └── lambda-functions.test.ts # Lambda unit tests
├── 📁 config/                 # Environment configurations
├── 📁 scripts/                # Deployment scripts
├── cdk.json                   # CDK configuration
├── package.json               # Project dependencies
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables
```bash
# Set in your deployment environment
NODE_ENV=production
POSTS_TABLE_NAME=blog-posts
```

### CDK Context
Configure in `cdk.json` or pass via CLI:
```bash
cdk deploy --context stage=prod
```

## 📊 API Endpoints

### GET /posts
Retrieve all published blog posts.

**Response**:
```json
[
  {
    "postId": "uuid",
    "title": "Post Title",
    "content": "Post content...",
    "status": "published",
    "tags": ["tag1", "tag2"],
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### POST /posts
Create a new blog post.

**Request**:
```json
{
  "title": "My New Post",
  "content": "This is the content of my post...",
  "status": "published",
  "tags": ["tech", "aws"]
}
```

**Response**:
```json
{
  "postId": "generated-uuid",
  "title": "My New Post",
  "content": "This is the content of my post...",
  "status": "published",
  "tags": ["tech", "aws"],
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

## 🧪 Testing

### Test Coverage
- **19 passing tests** across Lambda functions and CDK infrastructure
- **Unit tests** for Lambda function logic and validation
- **Integration tests** for CDK stack synthesis and resource creation
- **Frontend tests** via local test server

### Running Tests
```bash
# All tests
npm test

# Specific test suites
npm test -- test/lambda-functions.test.ts
npm test -- test/cdk_project.test.ts

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

## 🚀 Deployment

### Development Environment
```bash
npm run deploy:dev
```

### Production Environment
```bash
npm run deploy:prod
```

### Manual Deployment Steps
```bash
# 1. Build the project
npm run build

# 2. Synthesize CloudFormation
npm run synth

# 3. Deploy all stacks
cdk deploy --all

# 4. Get outputs
cdk outputs
```

## 🔒 Security Considerations

### Implemented Security Measures
- ✅ **Input Validation**: Server-side validation for all inputs
- ✅ **XSS Protection**: HTML escaping and content sanitization
- ✅ **CORS Configuration**: Proper cross-origin resource sharing
- ✅ **IAM Roles**: Least privilege access for Lambda functions
- ✅ **Encryption**: DynamoDB encryption at rest
- ✅ **HTTPS**: CloudFront enforces HTTPS connections

### Production Recommendations
- [ ] **API Authentication**: Add Cognito or API keys
- [ ] **Rate Limiting**: Implement API throttling
- [ ] **WAF**: Add Web Application Firewall
- [ ] **Domain**: Configure custom domain with SSL certificate
- [ ] **Monitoring**: Set up CloudWatch alarms and notifications

## 📈 Monitoring & Observability

### CloudWatch Integration
- **Lambda Metrics**: Duration, errors, invocations
- **API Gateway Metrics**: Request count, latency, errors
- **DynamoDB Metrics**: Read/write capacity, throttling
- **Custom Dashboards**: Comprehensive monitoring views

### Logging
- **Lambda Logs**: Structured logging with correlation IDs
- **API Gateway Logs**: Request/response logging
- **CloudFront Logs**: Access logs for frontend

## 🔄 CI/CD Pipeline

### Recommended Pipeline
```yaml
# Example GitHub Actions workflow
name: Deploy Blog
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: cdk deploy --require-approval never
```

## 🛠️ Troubleshooting

### Common Issues

**1. CDK Bootstrap Required**
```bash
Error: Need to perform AWS CDK bootstrap
Solution: npm run bootstrap
```

**2. Lambda Dependencies Missing**
```bash
Error: Cannot find module in Lambda
Solution: cd lambda && npm install
```

**3. API URL Not Updated in Frontend**
```bash
Error: API_URL_PLACEHOLDER not replaced
Solution: Check frontend deployment configuration
```

**4. CORS Errors**
```bash
Error: Access-Control-Allow-Origin
Solution: Verify CORS configuration in API stack
```

### Debug Commands
```bash
# Check CDK diff
npm run diff

# Validate CloudFormation
cdk synth

# Check logs
aws logs tail /aws/lambda/get-posts --follow

# Test API directly
curl -X GET https://your-api-url/posts
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and formatting
- **Jest**: Unit testing framework
- **CDK**: Latest stable version

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AWS CDK Team**: For the excellent infrastructure-as-code framework
- **AWS Documentation**: Comprehensive guides and best practices
- **Open Source Community**: For the tools and libraries used
- **Amazon Q Developer**: AI assistance in code generation and enhancement

## 📞 Support

For questions, issues, or contributions:

1. **Issues**: Open a GitHub issue
2. **Documentation**: Check AWS CDK documentation
3. **Community**: AWS CDK GitHub discussions
4. **AWS Support**: For AWS-specific issues

---

**⚠️ Important**: This project was created with AI assistance. Please review all code, test thoroughly, and ensure it meets your security and compliance requirements before deploying to production environments.

**📝 Version**: 1.0.0
**🤖 AI Generated**: Yes, with human review and validation recommended
