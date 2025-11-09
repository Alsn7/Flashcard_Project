# Render Deployment Guide

## Environment Variables Required

Set these environment variables in your Render dashboard:

```
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app-name.onrender.com
```

## Build Configuration

In your Render service settings:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18 or 20 (recommended)

## Common Issues and Solutions

### 1. PDF Processing Fails
- **Symptoms**: 500 error when processing PDFs, "Failed to process PDF" message
- **Solutions**:
  - Check health endpoint: `https://your-app.onrender.com/api/health`
  - Ensure PDF.js dependencies are properly installed
  - Check server logs for memory issues

### 2. Memory Issues
- **Symptoms**: Application crashes or timeouts during PDF processing
- **Solutions**:
  - Upgrade to a higher tier Render plan with more memory
  - Process smaller PDFs or limit pages processed
  - The code now limits to 50 pages maximum

### 3. Build Timeouts
- **Symptoms**: Build process takes too long or fails
- **Solutions**:
  - Clear build cache in Render dashboard
  - Check for large dependencies
  - Ensure all dependencies are in package.json

### 4. API Timeouts
- **Symptoms**: OpenAI API calls timeout
- **Solutions**:
  - Check OpenAI API key validity
  - Monitor OpenAI API status
  - The code includes 50-second timeout protection

## Testing Your Deployment

1. Visit your health check endpoint: `/api/health`
2. Upload a small PDF to test the full pipeline
3. Check Render logs for any errors

## Troubleshooting

### Check Logs
In Render dashboard, go to your service → Logs to see real-time application logs.

### Health Check Response
A healthy deployment should return:
```json
{
  "status": "healthy",
  "services": {
    "openai": "configured",
    "pdfjs": "available"
  },
  "timestamp": "2025-11-09T...",
  "environment": "production"
}
```

### Common Error Messages

1. **"PDF processing library not available"**
   - PDF.js failed to load
   - Try redeploying or check build logs

2. **"OpenAI API key is not configured"**
   - Environment variable missing or incorrect
   - Check OPENAI_API_KEY in Render dashboard

3. **"Failed to process PDF"**
   - Could be memory, timeout, or corrupted PDF
   - Check file size and format

## Performance Optimization

1. **Memory Usage**: The code now includes limits on pages processed and image sizes
2. **Timeouts**: Built-in timeouts prevent hanging requests
3. **Error Recovery**: Graceful fallbacks when PDF.js encounters issues

## Monitoring

- Use `/api/health` endpoint for uptime monitoring
- Monitor Render logs for performance issues
- Set up alerts for 500 errors