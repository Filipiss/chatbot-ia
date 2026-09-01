export interface Integration {
  id: number;
  provider: string;
  name: string;
  model_name: string;
  api_key?: string;
  api_url?: string;
  is_active: boolean;
  system_instruction?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: string;
  model_used?: string;
  latency?: number;
  tokens_used?: number;
  created_at: string;
}

export interface ChatSession {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://127.0.0.1:8000/api";

export async function fetchIntegrations(): Promise<Integration[]> {
  const res = await fetch(`${API_BASE_URL}/integrations`);
  if (!res.ok) throw new Error("Erro ao carregar integrações.");
  return res.json();
}

export async function updateIntegration(id: number, data: Partial<Integration>): Promise<Integration> {
  const res = await fetch(`${API_BASE_URL}/integrations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Erro ao atualizar integração.");
  return res.json();
}

export async function testIntegration(id: number): Promise<{ status: 'success' | 'error'; message: string; sample?: string }> {
  const res = await fetch(`${API_BASE_URL}/integrations/${id}/test`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Falha ao testar conexão.");
  return res.json();
}

export async function fetchChats(): Promise<ChatSession[]> {
  const res = await fetch(`${API_BASE_URL}/chats`);
  if (!res.ok) throw new Error("Erro ao carregar sessões de chat.");
  return res.json();
}

export async function createChat(name: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE_URL}/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error("Erro ao criar sessão de chat.");
  return res.json();
}

export async function updateChatName(id: number, name: string): Promise<ChatSession> {
  const res = await fetch(`${API_BASE_URL}/chats/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error("Erro ao atualizar nome da sessão.");
  return res.json();
}

export async function fetchChatDetails(id: number): Promise<ChatSession> {
  const res = await fetch(`${API_BASE_URL}/chats/${id}`);
  if (!res.ok) throw new Error("Erro ao carregar mensagens.");
  return res.json();
}

export async function deleteChat(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/chats/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Erro ao excluir sessão.");
}

export async function clearChatMessages(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/chats/${id}/clear`, {
    method: "POST"
  });
  if (!res.ok) throw new Error("Erro ao reiniciar chat.");
}

export async function sendMessageStream(
  chatId: number,
  content: string,
  onChunk: (text: string) => void,
  onDone: (metadata: any) => void,
  onError: (err: any) => void
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ role: "user", content })
    });

    if (!response.ok) {
      throw new Error(`Chamada falhou: HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) {
      throw new Error("Corpo de resposta vazio.");
    }

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");

      // Mantém a última linha incompleta no buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim().startsWith("data: ")) {
          try {
            const jsonStr = line.replace(/^data:\s*/, "");
            const parsed = JSON.parse(jsonStr);

            if (parsed.type === "content") {
              onChunk(parsed.content);
            } else if (parsed.type === "done") {
              onDone(parsed);
            }
          } catch (e) {
            console.error("Erro ao decodificar chunk:", line, e);
          }
        }
      }
    }
  } catch (error) {
    onError(error);
  }
}
