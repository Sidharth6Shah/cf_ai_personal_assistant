import { ChatStorage, ChatMessage } from './chat-storage';

export { ChatStorage };

interface Env {
  CHAT_STORAGE: DurableObjectNamespace<ChatStorage>;
  AI: Ai;
}

const SYSTEM_PROMPT = `You are a helpful personal assistant with memory. You remember past conversations with the user and can reference them. Be concise, friendly, and helpful. When appropriate, reference previous conversations to show continuity.`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Handle chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message, sessionId } = await request.json() as {
          message: string;
          sessionId: string;
        };

        if (!message || !sessionId) {
          return Response.json(
            { error: 'Missing message or sessionId' },
            { status: 400, headers: corsHeaders }
          );
        }

        // Get Durable Object stub for this session
        const id = env.CHAT_STORAGE.idFromName(sessionId);
        const stub = env.CHAT_STORAGE.get(id);

        // Get conversation history
        const historyResponse = await stub.fetch(
          new Request('http://internal/messages?limit=10', { method: 'GET' })
        );
        const { messages: history } = await historyResponse.json() as { messages: ChatMessage[] };

        // Store user message
        const userMessage: ChatMessage = {
          role: 'user',
          content: message,
          timestamp: Date.now(),
        };

        await stub.fetch(
          new Request('http://internal/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userMessage),
          })
        );

        // Build messages array for AI with system prompt
        const aiMessages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ];

        // Call Llama 3.3 via Workers AI
        const aiResponse = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
          messages: aiMessages,
          stream: false,
        }) as { response: string };

        const assistantMessage = aiResponse.response || 'I apologize, but I could not generate a response.';

        // Store assistant response
        const assistantMessageObj: ChatMessage = {
          role: 'assistant',
          content: assistantMessage,
          timestamp: Date.now(),
        };

        await stub.fetch(
          new Request('http://internal/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assistantMessageObj),
          })
        );

        return Response.json(
          { response: assistantMessage },
          { headers: corsHeaders }
        );
      } catch (error) {
        console.error('Error in chat endpoint:', error);
        return Response.json(
          { error: error instanceof Error ? error.message : 'Internal server error' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Handle clear conversation endpoint
    if (url.pathname === '/api/clear' && request.method === 'POST') {
      try {
        const { sessionId } = await request.json() as { sessionId: string };

        if (!sessionId) {
          return Response.json(
            { error: 'Missing sessionId' },
            { status: 400, headers: corsHeaders }
          );
        }

        const id = env.CHAT_STORAGE.idFromName(sessionId);
        const stub = env.CHAT_STORAGE.get(id);

        await stub.fetch(
          new Request('http://internal/clear', { method: 'POST' })
        );

        return Response.json(
          { success: true },
          { headers: corsHeaders }
        );
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : 'Internal server error' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Handle history endpoint
    if (url.pathname === '/api/history' && request.method === 'GET') {
      try {
        const sessionId = url.searchParams.get('sessionId');

        if (!sessionId) {
          return Response.json(
            { error: 'Missing sessionId' },
            { status: 400, headers: corsHeaders }
          );
        }

        const id = env.CHAT_STORAGE.idFromName(sessionId);
        const stub = env.CHAT_STORAGE.get(id);

        const historyResponse = await stub.fetch(
          new Request('http://internal/messages?limit=50', { method: 'GET' })
        );
        const { messages } = await historyResponse.json() as { messages: ChatMessage[] };

        return Response.json(
          { messages },
          { headers: corsHeaders }
        );
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : 'Internal server error' },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return Response.json(
      { error: 'Not found' },
      { status: 404, headers: corsHeaders }
    );
  },
};
