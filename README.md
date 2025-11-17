# BTR Document Management System

## 🏛️ Bureau of Treasury Document Management with AI Assistant

A secure, cloud-based document management system built specifically for the Bureau of Treasury, featuring regional access controls and AI-powered document analysis.

## ✨ Features

### 🔐 Security & Access Control
- **Cognito Authentication**: Secure email-based login
- **Regional Access Control**: Users can only access their assigned regional documents
- **Role-Based Permissions**: Super Admin (Sir Cons) has unified access to all regions
- **IAM Integration**: AWS IAM roles and policies for fine-grained access control

### 📁 Document Management
- **Regional Organization**: Documents organized by 15 regions (NCR, REGION-1 through REGION-13, REGION-4A/4B)
- **Secure Upload/Download**: Direct integration with S3 storage
- **File Type Support**: PDF, DOC, DOCX, XLS, XLSX, TXT
- **Metadata Tracking**: File size, upload date, region assignment

### 🤖 AI-Powered Assistant
- **Document Analysis**: AI can read and analyze treasury documents
- **Regional Context**: AI understands user's region and role
- **Natural Language Q&A**: Ask questions about budget allocations, financial data, procedures
- **Real-time Chat**: Instant responses powered by Amazon Bedrock (Claude 3.5 Sonnet)

### 🌐 Modern Web Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live document listing and chat
- **Professional UI**: Government-appropriate design and branding
- **Accessibility**: WCAG compliant interface

## 🏗️ Architecture

### AWS Services Used
- **AWS Amplify**: Frontend hosting and deployment
- **Amazon Cognito**: User authentication and authorization
- **Amazon S3**: Document storage with regional folder structure
- **Amazon Bedrock**: AI document analysis (Claude 3.5 Sonnet)
- **AWS IAM**: Access control and security policies

### Regional Structure
```
S3 Bucket: btr-treasury-docs-367471965495
├── NCR/                    # National Capital Region
├── REGION-1/               # Region 1 documents
├── REGION-2/               # Region 2 documents
├── ...                     # Additional regions
└── REGION-13/              # Region 13 documents
```

### User Hierarchy
```
Super Admin (Sir Cons)
├── Access: ALL regions
├── Features: Unified dashboard, cross-regional search
└── AI Context: Full system awareness

Regional Administrators
├── Access: Assigned region only
├── Features: Regional document management
└── AI Context: Region-specific assistance
```

## 🚀 Deployment

### Prerequisites
- AWS Account with appropriate permissions
- Node.js 18+ and npm
- AWS CLI configured

### Environment Setup
1. **Cognito Configuration**:
   - User Pool ID: `ap-southeast-1_AkRq0F7rd`
   - Client ID: `7o9770rpftnrf20i9vja01qba5`
   - Identity Pool ID: `ap-southeast-1:1f5d6e45-c8a0-4e53-8e46-3fefcc19abbf`

2. **S3 Configuration**:
   - Bucket: `btr-treasury-docs-367471965495`
   - Region: `ap-southeast-1`

3. **Bedrock Configuration**:
   - Model: `anthropic.claude-3-5-sonnet-20240620-v1:0`
   - Region: `ap-southeast-1`

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### AWS Amplify Deployment
```bash
# Deploy to Amplify
aws amplify create-app --name "btr-document-system"
aws amplify create-branch --app-id <app-id> --branch-name main
```

## 👥 User Management

### Test Users
| Email | Password | Region | Role | Access |
|-------|----------|--------|------|---------|
| sir.cons@btr.gov.ph | TempPass123! | ALL | super-admin | All regions |
| ncr.admin@btr.gov.ph | TempPass123! | NCR | admin | NCR only |
| region1.admin@btr.gov.ph | TempPass123! | REGION-1 | admin | Region 1 only |

*Note: Users must change password on first login*

### Adding New Users
1. **Via AWS Console**: Cognito → User pools → BTR-Treasury-UserPool → Users
2. **Required Attributes**:
   - Email (username)
   - custom:region (NCR, REGION-1, etc.)
   - custom:role (admin, super-admin)
3. **Group Assignment**: Add user to appropriate regional group

## 🤖 AI Assistant Usage

### Supported Queries
- **Budget Analysis**: "What is the total allocation for infrastructure?"
- **Document Summaries**: "Summarize the key points in this document"
- **Financial Data**: "Show me the education budget breakdown"
- **Cross-Regional** (Super Admin): "Compare allocations across regions"

### AI Context Awareness
- **Regional Filtering**: AI knows user's assigned region
- **Role Recognition**: Different responses for admin vs super-admin
- **Document Context**: AI analyzes uploaded document content
- **Professional Tone**: Government-appropriate language and responses

## 🔧 Configuration

### Environment Variables
```javascript
// aws-exports.js
const awsconfig = {
  "aws_project_region": "ap-southeast-1",
  "aws_cognito_identity_pool_id": "ap-southeast-1:1f5d6e45-c8a0-4e53-8e46-3fefcc19abbf",
  "aws_user_pools_id": "ap-southeast-1_AkRq0F7rd",
  "aws_user_pools_web_client_id": "7o9770rpftnrf20i9vja01qba5",
  "aws_user_files_s3_bucket": "btr-treasury-docs-367471965495",
  "aws_bedrock_model_id": "anthropic.claude-3-5-sonnet-20240620-v1:0"
};
```

### Security Configuration
- **HTTPS Only**: All communications encrypted
- **CORS Policies**: Restricted to authorized domains
- **CSP Headers**: Content Security Policy implemented
- **IAM Roles**: Least privilege access principles

## 📊 Monitoring & Analytics

### CloudWatch Metrics
- User authentication events
- Document upload/download counts
- AI query volume and response times
- Error rates and system health

### Audit Logging
- User access logs
- Document access history
- AI interaction logs
- Security events

## 🛠️ Maintenance

### Regular Tasks
- **User Management**: Add/remove users as needed
- **Document Cleanup**: Archive old documents
- **Security Updates**: Keep dependencies updated
- **Performance Monitoring**: Monitor AWS costs and usage

### Backup & Recovery
- **S3 Versioning**: Enabled for document protection
- **Cognito Backup**: User pool configuration backed up
- **Infrastructure as Code**: All AWS resources documented

## 📞 Support

### Technical Support
- **IT Department**: Bureau of Treasury IT Team
- **AWS Support**: Enterprise Support Plan
- **Documentation**: Complete setup guides available

### Emergency Contacts
- **System Administrator**: [Contact Information]
- **AWS Account Manager**: [Contact Information]
- **Security Team**: [Contact Information]

## 📄 License

This project is proprietary software developed for the Bureau of Treasury, Republic of the Philippines.

## 🔄 Version History

- **v1.0.0** (2025-11-17): Initial release with full AI integration
  - Cognito authentication
  - Regional access controls
  - Bedrock AI assistant
  - S3 document management
  - Responsive web interface

---

**Built with ❤️ for the Bureau of Treasury**  
*Secure • Regional • AI-Powered*
