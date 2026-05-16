import { NextRequest, NextResponse } from 'next/server';
import { generateChatResponse, ChatMessage } from '@/lib/ollama';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = [
      ...(history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const result = await generateChatResponse(messages);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to get response' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      response: result.response,
      role: 'assistant'
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
