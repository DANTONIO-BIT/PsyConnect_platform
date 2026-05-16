export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─── Ollama config ─────────────────────────────────────────────
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

// ─── OpenRouter config ─────────────────────────────────────────
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
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

// ─── Ollama ────────────────────────────────────────────────────
async function callOllama(messages: ChatMessage[]): Promise<{ success: boolean; response?: string; error?: string }> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.filter(m => m.role !== 'system')],
        stream: false,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return { success: false, error: `Ollama HTTP ${response.status}` };
    }

    const data = await response.json();
    return { success: true, response: data.message?.content || 'No response generated' };
  } catch {
    return { success: false, error: 'Ollama not available' };
  }
}

// ─── OpenRouter ────────────────────────────────────────────────
async function callOpenRouter(messages: ChatMessage[]): Promise<{ success: boolean; response?: string; error?: string }> {
  if (!OPENROUTER_API_KEY) {
    return { success: false, error: 'OpenRouter API key not configured' };
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://psyconnect.cl',
        'X-Title': 'PsyConnect',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
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

// ─── Main: try Ollama first, fallback to OpenRouter ────────────
export async function generateChatResponse(messages: ChatMessage[]): Promise<{ success: boolean; response?: string; error?: string }> {
  // 1. Try Ollama (local, free)
  const ollamaResult = await callOllama(messages);
  if (ollamaResult.success) return ollamaResult;

  // 2. Fallback to OpenRouter (cloud, needs API key)
  const openrouterResult = await callOpenRouter(messages);
  if (openrouterResult.success) return openrouterResult;

  // 3. Both failed
  return {
    success: false,
    error: `Chat no disponible: Ollama (${ollamaResult.error}) + OpenRouter (${openrouterResult.error})`,
  };
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
