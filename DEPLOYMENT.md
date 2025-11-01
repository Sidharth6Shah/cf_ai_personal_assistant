# Deployment Guide

Step-by-step guide to deploy the AI Personal Assistant to Cloudflare's edge network.

## Prerequisites Checklist

- [ ] Cloudflare account created
- [ ] Wrangler CLI installed
- [ ] Logged in to Cloudflare via Wrangler
- [ ] Workers AI enabled on your account (requires paid plan)
- [ ] Local development tested and working

## Deployment Steps

### Step 1: Deploy the Worker

1. Navigate to the worker directory:
   ```bash
   cd worker
   ```

2. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

3. Deploy to Cloudflare:
   ```bash
   npx wrangler deploy
   ```

4. Note the deployed Worker URL from the output:
   ```
   Published ai-assistant (X.XX sec)
     https://ai-assistant.<your-subdomain>.workers.dev
   ```

5. Save this URL - you'll need it for the frontend!

### Step 2: Test the Worker API

Test that your Worker is responding correctly:

```bash
# Test the API endpoint (replace with your Worker URL)
curl -X POST https://ai-assistant.<your-subdomain>.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "sessionId": "test-session"}'
```

Expected response:
```json
{"response": "Hi there! How can I help you today?"}
```

### Step 3: Configure Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Create a `.env` file:
   ```bash
   echo "VITE_API_URL=https://ai-assistant.<your-subdomain>.workers.dev" > .env
   ```

   **Important**: Replace `<your-subdomain>` with your actual Worker URL!

3. Verify the environment variable:
   ```bash
   cat .env
   ```

### Step 4: Build the Frontend

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Build the production bundle:
   ```bash
   npm run build
   ```

3. Verify the build output:
   ```bash
   ls -la dist/
   ```

   You should see: `index.html`, `assets/` directory

### Step 5: Deploy Frontend to Cloudflare Pages

#### Option A: Using Wrangler CLI (Recommended)

```bash
npx wrangler pages deploy dist --project-name=ai-assistant-frontend
```

Follow the prompts:
- Project name: `ai-assistant-frontend`
- Production branch: `main` (or your preference)

#### Option B: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** in the sidebar
3. Click **Create a project**
4. Choose **Upload assets**
5. Select the `dist` folder from your frontend directory
6. Set project name: `ai-assistant-frontend`
7. Click **Deploy**

### Step 6: Configure Pages Environment Variables

1. In Cloudflare Dashboard, go to your Pages project
2. Navigate to **Settings** → **Environment variables**
3. Add a new variable:
   - **Variable name**: `VITE_API_URL`
   - **Value**: `https://ai-assistant.<your-subdomain>.workers.dev`
   - **Environment**: Production
4. Click **Save**
5. Redeploy to apply changes

### Step 7: Test the Deployed Application

1. Open your Pages URL (e.g., `https://ai-assistant-frontend.pages.dev`)
2. Run through the test scenarios:
   - [ ] Send a message
   - [ ] Verify AI responds
   - [ ] Send a follow-up message
   - [ ] Check if AI remembers context
   - [ ] Reload the page
   - [ ] Verify conversation persists
   - [ ] Click "Clear Chat"
   - [ ] Verify conversation is cleared

## Post-Deployment

### Update README.md

Add your live demo URL to the README:

```markdown
## Live Demo

Worker API: https://ai-assistant.<your-subdomain>.workers.dev
Frontend: https://ai-assistant-frontend.pages.dev
```

### Monitoring

Monitor your Worker:
```bash
cd worker
npx wrangler tail
```

This will show real-time logs from your Worker.

### Custom Domain (Optional)

To use a custom domain:

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Navigate to **Custom domains**
3. Click **Set up a custom domain**
4. Follow the instructions to add your domain

## Troubleshooting

### Worker Deployment Issues

**Issue**: "Error: No such module 'cloudflare:workers'"
- **Fix**: Update Wrangler: `npm install -g wrangler@latest`

**Issue**: "Durable Objects not available"
- **Fix**: Ensure you're on a paid Cloudflare plan with Durable Objects enabled

**Issue**: "AI binding not found"
- **Fix**: Workers AI requires a paid plan. Check your account status.

### Frontend Deployment Issues

**Issue**: "API calls fail with CORS errors"
- **Fix**: Verify the Worker URL in `.env` is correct and includes `https://`

**Issue**: "Environment variable not working"
- **Fix**: Rebuild the frontend after changing `.env`: `npm run build`

**Issue**: "Blank page after deployment"
- **Fix**: Check browser console for errors. Verify build was successful.

## Rollback Procedure

### Rollback Worker

```bash
cd worker
npx wrangler rollback
```

### Rollback Frontend

In Cloudflare Dashboard:
1. Go to Pages → Your Project
2. Click **Deployments**
3. Find the previous successful deployment
4. Click **...** → **Rollback to this deployment**

## Performance Optimization

### Worker Optimizations

1. **Regional deployments**: Workers automatically deploy globally
2. **Caching**: Durable Objects cache messages in memory
3. **Keep-alive**: Durable Objects remain active between requests

### Frontend Optimizations

1. **Enable Cloudflare's Auto Minify**:
   - Dashboard → Pages → Your Project → Settings → Build & deployments
   - Enable: JavaScript, CSS, HTML

2. **Enable Analytics**:
   - Dashboard → Pages → Your Project → Analytics
   - Enable Web Analytics

## Cost Estimation

Cloudflare pricing (approximate):

- **Workers**: $5/month (includes 10M requests)
- **Durable Objects**: $5/month + $0.36/million requests
- **Workers AI**: Varies based on model and usage
- **Pages**: Free (includes unlimited requests)

For this demo with light usage:
- Estimated cost: ~$10-15/month

## Security Checklist

Post-deployment security:

- [ ] Review Worker logs for suspicious activity
- [ ] Implement rate limiting (production use)
- [ ] Add authentication (production use)
- [ ] Enable Cloudflare's Bot Management (optional)
- [ ] Set up error alerting

## Next Steps

1. **Monitor Usage**:
   - Check Cloudflare Analytics
   - Review Worker metrics
   - Monitor costs

2. **Gather Feedback**:
   - Test with real users
   - Collect feedback on AI responses
   - Iterate on improvements

3. **Enhance Features**:
   - Add user authentication
   - Implement conversation export
   - Add rich text formatting
   - Enable voice input

## Support

If you encounter issues:

1. Check [Cloudflare Status](https://www.cloudflarestatus.com/)
2. Review [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
3. Check [Cloudflare Community](https://community.cloudflare.com/)

---

**Deployed!** Your AI Personal Assistant is now live on Cloudflare's edge network.
