import { DurableObject } from "cloudflare:workers";

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export class ChatStorage extends DurableObject {
  private messages: ChatMessage[] = [];
  private initialized = false;

  constructor(state: DurableObjectState, env: never) {
    super(state, env);
  }

  async initialize() {
    if (!this.initialized) {
      const stored = await this.ctx.storage.get<ChatMessage[]>('messages');
      if (stored) {
        this.messages = stored;
      }
      this.initialized = true;
    }
  }

  async addMessage(message: ChatMessage): Promise<void> {
    await this.initialize();
    this.messages.push(message);

    // Keep only the last 50 messages to prevent unlimited growth
    if (this.messages.length > 50) {
      this.messages = this.messages.slice(-50);
    }

    await this.ctx.storage.put('messages', this.messages);
  }

  async getMessages(limit: number = 10): Promise<ChatMessage[]> {
    await this.initialize();
    // Return the last N messages
    return this.messages.slice(-limit);
  }

  async clear(): Promise<void> {
    this.messages = [];
    await this.ctx.storage.delete('messages');
    this.initialized = true;
  }

  async fetch(request: Request): Promise<Response> {
    await this.initialize();

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/messages' && request.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const messages = await this.getMessages(limit);
        return Response.json({ messages });
      }

      if (path === '/messages' && request.method === 'POST') {
        const message = await request.json() as ChatMessage;
        await this.addMessage(message);
        return Response.json({ success: true });
      }

      if (path === '/clear' && request.method === 'POST') {
        await this.clear();
        return Response.json({ success: true });
      }

      return Response.json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      return Response.json({
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }
}
