import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Create a ReadableStream for streaming the response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Simulate AI thinking delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Send start of response
        const startData = {
          type: 'start',
          id: Date.now().toString(),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(startData)}\n\n`));

        // Mock AI responses based on user input
        const responses = getMockResponse(message);

        for (let i = 0; i < responses.length; i++) {
          // Simulate typing delay between words
          await new Promise(resolve => setTimeout(resolve, 50));

          const chunkData = {
            type: 'chunk',
            content: responses[i],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
        }

        // Send end of response
        const endData = {
          type: 'end',
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(endData)}\n\n`));

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getMockResponse(userMessage: string): string[] {
  const message = userMessage.toLowerCase();

  if (message.includes('hello') || message.includes('hi')) {
    return ['Hello', '! ', 'Welcome', ' to ', 'Inventing', ' Chat', '. ', 'How', ' can', ' I ', 'help', ' you', ' today', '?'];
  }

  if (message.includes('how are you')) {
    return ['I', "'m", ' doing', ' great', ', ', 'thanks', ' for', ' asking', '! ', 'I', "'m", ' here', ' to', ' assist', ' you', ' with', ' any', ' questions', ' or', ' tasks', ' you', ' might', ' have', '.'];
  }

  if (message.includes('what can you do')) {
    return ['I', ' can', ' help', ' you', ' with', ' a', ' variety', ' of', ' tasks', ' including', ':', '\n', '• ', 'Answering', ' questions', '\n', '• ', 'Providing', ' information', '\n', '• ', 'Creative', ' writing', '\n', '• ', 'Code', ' assistance', '\n', '• ', 'And', ' much', ' more', '!'];
  }

  if (message.includes('weather')) {
    return ['I', ' don', "'t", ' have', ' access', ' to', ' real-time', ' weather', ' data', ', ', 'but', ' I', ' can', ' help', ' you', ' find', ' weather', ' information', ' or', ' suggest', ' weather', ' apps', ' to', ' use', '.'];
  }

  if (message.includes('joke')) {
    return ['Why', ' don', "'t", ' scientists', ' trust', ' atoms', '? ', 'Because', ' they', ' make', ' up', ' everything', '! ', '😄'];
  }

  // Default response
  return ['That', "'s", ' an', ' interesting', ' question', '! ', 'I', "'m", ' still', ' learning', ' and', ' improving', ' my', ' responses', '. ', 'Is', ' there', ' anything', ' specific', ' you', "'d", ' like', ' to', ' know', ' more', ' about', '?'];
}
