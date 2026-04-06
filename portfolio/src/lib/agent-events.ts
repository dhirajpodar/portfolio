export type SSEEvent =
  | { type: "thinking"; thread_id: string }
  | { type: "tool_start"; tool: string; thread_id: string }
  | { type: "tool_end"; tool: string; preview: string; thread_id: string }
  | { type: "content"; content: string; thread_id: string }
  | { type: "followups"; questions: string[]; thread_id: string }
  | { type: "error"; error: string; thread_id: string }
  | { type: "done"; thread_id: string };

export interface AgentStep {
  type: "thinking" | "tool_start" | "tool_end" | "generating";
  tool?: string;
  preview?: string;
  timestamp: number;
}


export function parseSSELine(line: string): SSEEvent | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) return null;
  try {
    return JSON.parse(trimmed.slice(6));
  } catch {
    return null;
  }
}
