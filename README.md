# AI Personal Assistant with Memory

An intelligent conversational AI assistant built on Cloudflare's edge infrastructure that remembers your conversations and learns your preferences over time.

> **Live Repository**: https://github.com/Sidharth6Shah/cf_ai_personal_assistant

## Table of Contents

- [Quick Start](#quick-start)
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Quick Start

Get up and running in 10 minutes:

**1. Install Dependencies**
```bash
cd worker && npm install
cd ../frontend && npm install
```

**2. Login to Cloudflare**
```bash
cd worker && npx wrangler login
```

**3. Start Both Servers (use 2 terminals)**
```bash
# Terminal 1 - Worker
cd worker && npx wrangler dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

**4. Test** - Open http://localhost:5173 and try:
- "Hello, my name is Alex"
- "What's my name?" (AI should remember!)

## Overview

This project demonstrates a complete AI-powered application using Cloudflare's suite of services:
- **Llama 3.3** for natural language processing via Workers AI
- **Cloudflare Workers** for serverless API endpoints
- **Durable Objects** for persistent conversation memory
- **Cloudflare Pages** for hosting the React-based chat interface

The assistant maintains conversation context across sessions, enabling it to reference previous interactions and provide a more personalized experience.

## Features

- **Conversational AI** using Llama 3.3 (70B parameter model)
- **Persistent Conversation Memory** - remembers past conversations
- **Session-based Chat History** - each user gets their own conversation thread
- **Clean, Responsive UI** - modern chat interface that works on all devices
- **Real-time Responses** - fast AI-powered replies
- **Conversation Management** - ability to clear chat history
- **Automatic Session Recovery** - conversations persist across page reloads

## Architecture

```
┌─────────────────┐
│ Cloudflare Pages│
│   (React UI)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│Cloudflare Worker│
│   (API Layer)   │
└────┬──────┬─────┘
     │      │
     ▼      ▼
┌─────────┐ ┌──────────────┐
│Workers AI│ │Durable Objects│
│(Llama 3.3)│ │(Chat Storage)│
└──────────┘ └──────────────┘
```

### Component Breakdown

1. **Frontend** (Cloudflare Pages + React)
   - Modern chat interface with message history
   - Session ID management via localStorage
   - Auto-scrolling and loading states
   - Responsive design for mobile and desktop

2. **Backend** (Cloudflare Worker)
   - RESTful API endpoints (`/api/chat`, `/api/history`, `/api/clear`)
   - Request routing and validation
   - Integration with Workers AI and Durable Objects
   - CORS handling for cross-origin requests

3. **AI Layer** (Workers AI - Llama 3.3)
   - Natural language understanding and generation
   - Context-aware responses using conversation history
   - Optimized for low latency on Cloudflare's edge

4. **State Management** (Durable Objects)
   - Persistent storage of conversation history per session
   - Message ordering and retrieval
   - Automatic cleanup to prevent unbounded growth

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Cloudflare account** ([Sign up](https://dash.cloudflare.com/sign-up))
- **Wrangler CLI** (Cloudflare's developer tool)

## Local Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd cf_ai_optional_assignment
```

### 2. Worker Setup

Navigate to the worker directory and install dependencies:

```bash
cd worker
npm install
```

Login to Cloudflare (if not already logged in):

```bash
npx wrangler login
```

Start the development server:

```bash
npx wrangler dev
```

The Worker will be available at `http://localhost:8787`

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

The development setup includes automatic proxy configuration, so the frontend will communicate with the Worker running on port 8787.

## Deployment

### Deploy Worker

From the `worker` directory:

```bash
npx wrangler deploy
```

After deployment, Wrangler will output your Worker URL (e.g., `https://ai-assistant.your-subdomain.workers.dev`). Save this URL for the frontend deployment.

### Deploy Frontend to Cloudflare Pages

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Create a `.env` file in the `frontend` directory:

```bash
echo "VITE_API_URL=https://ai-assistant.your-subdomain.workers.dev" > .env
```

Replace `https://ai-assistant.your-subdomain.workers.dev` with your actual Worker URL.

3. Rebuild with the environment variable:

```bash
npm run build
```

4. Deploy to Cloudflare Pages:

```bash
npx wrangler pages deploy dist --project-name=ai-assistant-frontend
```

Alternatively, you can deploy via the Cloudflare Dashboard:
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
- Navigate to Pages
- Create a new project
- Connect your Git repository or upload the `dist` folder
- Set the build command: `npm run build`
- Set the build output directory: `dist`
- Add environment variable: `VITE_API_URL` with your Worker URL

## Usage

### Starting a Conversation

1. Open the deployed frontend URL or `http://localhost:5173` for local development
2. Type your message in the input field
3. Press "Send" or hit Enter
4. The AI assistant will respond based on your message and conversation history

### Testing Conversation Memory

Try this sequence to test the memory feature:

1. **First message**: "My name is Alex and I love pizza"
2. **Second message**: "What's my name?"
3. **Third message**: "What food do I like?"

The assistant should remember your name and food preference from the first message.

### Clearing Conversation

Click the "Clear Chat" button in the header to reset the conversation history. This will remove all messages from storage.

### Session Persistence

Your conversation is tied to a unique session ID stored in your browser's localStorage. This means:
- Conversations persist across page reloads
- Each browser/device has its own conversation thread
- Clearing browser data will create a new session

## Project Structure

```
cf_ai_optional_assignment/
├── worker/
│   ├── src/
│   │   ├── index.ts           # Main Worker entry point
│   │   └── chat-storage.ts    # Durable Object implementation
│   ├── wrangler.toml          # Worker configuration
│   ├── package.json           # Worker dependencies
│   └── tsconfig.json          # TypeScript config
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main React component
│   │   ├── App.css            # Styles
│   │   ├── index.tsx          # React entry point
│   │   └── vite-env.d.ts      # TypeScript definitions
│   ├── index.html             # HTML template
│   ├── vite.config.ts         # Vite configuration
│   ├── package.json           # Frontend dependencies
│   └── tsconfig.json          # TypeScript config
├── README.md                  # This file
└── PROMPTS.md                 # AI prompts documentation
```

### Key Files

- **[worker/src/index.ts](worker/src/index.ts)** - Handles API requests, integrates with Workers AI (Llama 3.3), and manages Durable Object communication
- **[worker/src/chat-storage.ts](worker/src/chat-storage.ts)** - Durable Object class that stores and retrieves conversation messages
- **[frontend/src/App.tsx](frontend/src/App.tsx)** - React component with chat UI, message management, and API calls
- **[worker/wrangler.toml](worker/wrangler.toml)** - Configuration for Worker, Durable Objects, and AI bindings

## API Endpoints

### POST /api/chat

Send a message to the AI assistant.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "sessionId": "unique-session-id"
}
```

**Response:**
```json
{
  "response": "I'm doing well, thank you for asking! How can I help you today?"
}
```

### GET /api/history

Retrieve conversation history for a session.

**Query Parameters:**
- `sessionId` (required) - The session identifier

**Response:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello!",
      "timestamp": 1234567890000
    },
    {
      "role": "assistant",
      "content": "Hi there! How can I help?",
      "timestamp": 1234567891000
    }
  ]
}
```

### POST /api/clear

Clear conversation history for a session.

**Request:**
```json
{
  "sessionId": "unique-session-id"
}
```

**Response:**
```json
{
  "success": true
}
```

## Testing

### Manual Testing Checklist

- [ ] Create new chat session (first visit)
- [ ] Send multiple messages and verify responses
- [ ] Verify AI references previous messages in context
- [ ] Reload page and verify session persists
- [ ] Test "Clear Chat" functionality
- [ ] Test on multiple browsers/devices
- [ ] Verify different sessions are independent
- [ ] Test mobile responsive design

### Example Test Scenarios

1. **Memory Test**
   ```
   User: "I work as a software engineer"
   User: "What's my job?"
   Expected: Assistant mentions software engineer
   ```

2. **Context Awareness**
   ```
   User: "I'm planning a trip to Japan"
   User: "What should I pack?"
   Expected: Assistant provides Japan-specific packing suggestions
   ```

3. **Session Persistence**
   ```
   User: "Remember: my favorite color is blue"
   [Reload page]
   User: "What's my favorite color?"
   Expected: Assistant responds with blue
   ```

## Live Demo

[Deploy your application and add the URL here]

Example: `https://ai-assistant-frontend.pages.dev`

## Configuration

### Environment Variables

**Frontend (.env):**
- `VITE_API_URL` - URL of the deployed Worker (leave empty for local development)

**Worker (wrangler.toml):**
- `name` - Name of your Worker
- `compatibility_date` - Cloudflare Workers compatibility date
- `CHAT_STORAGE` - Durable Object binding name
- `AI` - Workers AI binding

### Customization

**Change AI Model:**
Edit [worker/src/index.ts:63](worker/src/index.ts#L63):
```typescript
const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
  // Change to another model like '@cf/meta/llama-2-7b-chat-int8'
```

**Modify System Prompt:**
Edit [worker/src/index.ts:11-13](worker/src/index.ts#L11-L13):
```typescript
const SYSTEM_PROMPT = `Your custom system prompt here`;
```

**Adjust Message History Limit:**
Edit [worker/src/index.ts:48](worker/src/index.ts#L48):
```typescript
const historyResponse = await stub.fetch(
  new Request('http://internal/messages?limit=20', { method: 'GET' })
  // Change limit=10 to your desired number
);
```

## Troubleshooting

### Worker Issues

**Problem:** "Error: No such module"
- **Solution:** Ensure all TypeScript files are in the `worker/src` directory and run `npm install`

**Problem:** "Durable Object binding not found"
- **Solution:** Verify `wrangler.toml` has the correct Durable Object binding configuration

**Problem:** "AI binding not available"
- **Solution:** Ensure you have Workers AI enabled in your Cloudflare account

### Frontend Issues

**Problem:** "Failed to fetch" errors
- **Solution:** Check that the Worker is running and the `VITE_API_URL` is correct

**Problem:** "Session ID not persisting"
- **Solution:** Ensure localStorage is enabled in your browser

**Problem:** CORS errors
- **Solution:** Verify the Worker's CORS headers are set correctly in [worker/src/index.ts](worker/src/index.ts)

### Development Tips

- Use browser DevTools Network tab to inspect API requests
- Check Worker logs with `npx wrangler tail` in the worker directory
- Use `console.log` statements in both Worker and frontend for debugging
- Clear browser cache and localStorage if experiencing session issues

## Performance Considerations

- **Message Limit**: Conversation history is limited to the last 50 messages to prevent storage bloat
- **Context Window**: Only the last 10 messages are sent to the AI to stay within model limits
- **Edge Computing**: Both Worker and AI run on Cloudflare's edge network for low latency
- **Caching**: Session data is cached in the Durable Object's memory for fast access

## Security Notes

- Session IDs are randomly generated UUIDs
- No authentication is implemented (suitable for demo purposes)
- For production use, consider adding:
  - User authentication
  - Rate limiting
  - Input sanitization
  - Content moderation

## Contributing

This is an assignment project. All work is original and completed as per the requirements.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with Cloudflare Workers, Durable Objects, and Workers AI
- Powered by Llama 3.3 (Meta)
- UI framework: React with Vite
- Icons and design inspired by modern chat applications

## Support

For issues related to:
- **Cloudflare Workers**: [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- **Workers AI**: [Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- **Durable Objects**: [Durable Objects Docs](https://developers.cloudflare.com/durable-objects/)
- **React**: [React Docs](https://react.dev/)

---

**Repository**: cf_ai_optional_assignment
**Built with**: Cloudflare Workers, Durable Objects, Workers AI (Llama 3.3), React
**Assignment**: Cloudflare AI Optional Assignment
