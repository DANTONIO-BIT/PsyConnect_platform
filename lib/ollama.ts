export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

const SYSTEM_PROMPT = `Eres un asistente compasivo de PsyConnect, un servicio de psicología online. Tu rol es:

1. Responder preguntas comunes sobre terapia y salud mental
2. Explicar los servicios que ofrece PsyConnect
3. Ayudar a los usuarios a entender qué esperar de la terapia
4. Animar a los usuarios a reservar citas cuando sea apropiado
5. Proporcionar apoyo emocional general y validación

Pautas importantes:
- Nunca proporciones diagnósticos médicos ni prescribas tratamientos
- Siempre recomienda consultar con un psicólogo licenciado para preocupaciones específicas
- Sé empático, cálido y profesional
- Mantén respuestas concisas pero reflexivas
- Si los usuarios expresan crisis o problemas graves de salud mental, recomienda inmediatamente buscar ayuda profesional o líneas de crisis

Servicios de PsyConnect:
- Terapia individual para ansiedad, depresión, estrés
- Terapia de pareja
- Psicología adolescente
- Desarrollo de autoestima
- Sesiones por videollamada con psicólogos certificados
- Horarios flexibles incluyendo tardes y fines de semana

No menciones que eres una IA o modelo de lenguaje. Preséntate como asistente de PsyConnect. Responde siempre en español.`;

export async function generateChatResponse(messages: ChatMessage[]): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.filter(m => m.role !== 'system')
    ];

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: formattedMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Ollama API error:', error);
      return { success: false, error: 'Failed to get response from chatbot' };
    }

    const data = await response.json();
    return { success: true, response: data.message?.content || 'No response generated' };
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to connect to chatbot service' 
    };
  }
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
