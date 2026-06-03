export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

// ─── OpenRouter ────────────────────────────────────────────────
async function callOpenRouter(messages: ChatMessage[]): Promise<{ success: boolean; response?: string; error?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || 'qwen/qwen-2.5-7b-instruct:free';

  if (!apiKey) {
    return { success: false, error: 'OpenRouter API key not configured' };
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://psyconnect.cl',
        'X-Title': 'PsyConnect',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const err = await response.text();
      return { success: false, error: `OpenRouter HTTP ${response.status}: ${err}` };
    }

    const data = await response.json();
    return { success: true, response: data.choices?.[0]?.message?.content || 'No response generated' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'OpenRouter request failed' };
  }
}

// ─── Main: OpenRouter ──────────────────────────────────────────
export async function generateChatResponse(messages: ChatMessage[]): Promise<{ success: boolean; response?: string; error?: string }> {
  const result = await callOpenRouter(messages);
  if (result.success) return result;

  return {
    success: false,
    error: `Chat no disponible: ${result.error}`,
  };
}

