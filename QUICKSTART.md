# Quick Start Guide

This guide will help you get the AI Personal Assistant running quickly on your local machine.

## Prerequisites

- Node.js 18+ installed
- Cloudflare account
- 10 minutes of your time

## Installation Steps

### 1. Install Dependencies

```bash
# Install Worker dependencies
cd worker
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Login to Cloudflare

```bash
cd ../worker
npx wrangler login
```

This will open a browser window. Log in to your Cloudflare account and authorize Wrangler.

### 3. Start the Worker

```bash
# From the worker directory
npx wrangler dev
```

Keep this terminal open. The Worker will run on `http://localhost:8787`

### 4. Start the Frontend

Open a new terminal:

```bash
# From the project root
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### 5. Test the Application

1. Open `http://localhost:5173` in your browser
2. Type a message like "Hello, my name is Alex"
3. Send the message
4. Try asking "What's my name?"
5. The AI should remember and respond with your name

## Common Issues

**Problem**: Worker fails to start with "AI binding not available"
- **Solution**: Workers AI is available on paid Cloudflare plans. Check your account status.

**Problem**: "Cannot connect to Worker"
- **Solution**: Ensure the Worker is running on port 8787. Check the terminal for errors.

**Problem**: "CORS error"
- **Solution**: The Worker includes CORS headers. Make sure you're accessing via `http://localhost:5173`

## Next Steps

Once you have it running locally:
1. Deploy the Worker: `npx wrangler deploy` (from worker directory)
2. Update frontend/.env with your Worker URL
3. Deploy the frontend: `npm run build && npx wrangler pages deploy dist`

See [README.md](README.md) for detailed documentation.

## Need Help?

Check the main [README.md](README.md) for:
- Detailed setup instructions
- API documentation
- Troubleshooting guide
- Architecture overview
