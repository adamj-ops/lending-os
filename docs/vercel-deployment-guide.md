# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure your code is pushed to GitHub
3. **Environment Variables**: Set up all required environment variables

## Environment Variables Setup

### Required Environment Variables

Add these environment variables in your Vercel dashboard under Settings > Environment Variables:

#### Database Configuration
```
DATABASE_URL=postgresql://username:password@host:port/database
NEON_DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
```

#### Session Configuration
```
SESSION_SECRET=your-super-secret-session-key-here
```

#### AWS S3 Configuration
```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
```

#### AI SDK Configuration
```
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
```

#### Application Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

## Deployment Steps

### 1. Connect to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link
```

### 2. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 3. Automatic Deployments

Once connected, Vercel will automatically deploy:
- **Preview deployments**: On every push to any branch
- **Production deployments**: On push to main branch

## Database Setup for Production

### Neon Database (Recommended)

1. **Create Neon Account**: Sign up at [neon.tech](https://neon.tech)
2. **Create Database**: Create a new database for production
3. **Get Connection String**: Copy the connection string
4. **Set Environment Variable**: Add `NEON_DATABASE_URL` in Vercel
5. **Run Migrations**: Deploy and run migrations via API

### Migration Strategy

```bash
# Run migrations in production (via Vercel function)
POST /api/v1/admin/migrate
```

## AI SDK Configuration

### OpenAI Setup
1. **Get API Key**: From [OpenAI Platform](https://platform.openai.com)
2. **Set Environment Variable**: `OPENAI_API_KEY`
3. **Configure Usage Limits**: Set appropriate limits in OpenAI dashboard

### Anthropic Setup
1. **Get API Key**: From [Anthropic Console](https://console.anthropic.com)
2. **Set Environment Variable**: `ANTHROPIC_API_KEY`
3. **Configure Usage Limits**: Set appropriate limits in Anthropic dashboard

## Monitoring and Analytics

### Vercel Analytics
- **Speed Insights**: Automatic performance monitoring
- **Web Analytics**: User behavior tracking
- **Function Logs**: API endpoint monitoring

### Custom Monitoring
- **Error Tracking**: Implement error boundaries
- **Performance Monitoring**: Use Web Vitals
- **Database Monitoring**: Monitor Neon database performance

## Security Considerations

### Environment Variables
- ✅ Never commit `.env.local` files
- ✅ Use Vercel's environment variable system
- ✅ Rotate API keys regularly
- ✅ Use different keys for staging/production

### API Security
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use HTTPS in production
- ✅ Implement proper CORS policies

### Database Security
- ✅ Use connection pooling
- ✅ Implement query timeouts
- ✅ Use read replicas for analytics
- ✅ Regular backups

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify connection string format
   - Check network access from Vercel
   - Ensure database is running

3. **Environment Variable Issues**
   - Verify all required variables are set
   - Check variable names match exactly
   - Ensure no trailing spaces

4. **AI SDK Issues**
   - Verify API keys are valid
   - Check usage limits and quotas
   - Monitor API response times

### Debug Commands

```bash
# Check Vercel status
vercel status

# View deployment logs
vercel logs

# Check environment variables
vercel env ls

# Test local build
npm run build
```

## Performance Optimization

### Vercel Optimizations
- **Edge Functions**: Use for low-latency operations
- **Image Optimization**: Automatic with Next.js Image component
- **Static Generation**: Use for content that doesn't change often
- **CDN**: Automatic global distribution

### Database Optimizations
- **Connection Pooling**: Configure appropriate pool size
- **Query Optimization**: Use indexes and efficient queries
- **Caching**: Implement Redis for frequently accessed data

### AI SDK Optimizations
- **Streaming**: Use streaming for long responses
- **Caching**: Cache AI responses when appropriate
- **Rate Limiting**: Implement client-side rate limiting
- **Error Handling**: Graceful fallbacks for AI failures

## Backup and Recovery

### Database Backups
- **Automated Backups**: Configure Neon automated backups
- **Point-in-Time Recovery**: Available with Neon
- **Export/Import**: Regular data exports

### Code Backups
- **Git Repository**: Primary backup mechanism
- **Vercel Deployments**: Automatic deployment history
- **Environment Variables**: Export from Vercel dashboard

## Scaling Considerations

### Horizontal Scaling
- **Vercel Functions**: Automatic scaling
- **Database**: Neon auto-scaling
- **CDN**: Global edge network

### Vertical Scaling
- **Function Memory**: Increase if needed
- **Database Resources**: Scale Neon instance
- **API Limits**: Increase AI provider limits

## Cost Optimization

### Vercel Costs
- **Function Execution Time**: Optimize code efficiency
- **Bandwidth**: Use CDN effectively
- **Build Time**: Optimize build process

### Database Costs
- **Query Optimization**: Reduce database load
- **Connection Pooling**: Efficient connection usage
- **Storage**: Regular cleanup of old data

### AI Costs
- **Token Usage**: Optimize prompts and responses
- **Model Selection**: Use appropriate models for tasks
- **Caching**: Cache responses when possible
