import { SerenovaIntent, ActionHandler } from "../types";

type ActionRegistryType = Map<SerenovaIntent, ActionHandler["execute"]>;

const registry: ActionRegistryType = new Map();

export const ActionRegistry = {
  register(intent: SerenovaIntent, handler: ActionHandler["execute"]) {
    registry.set(intent, handler);
  },
  execute(intent: SerenovaIntent, payload: Record<string, unknown>) {
    const handler = registry.get(intent);
    if (!handler) {
      console.warn(`[Serenova] No handler registered for intent: ${intent}`);
      return;
    }
    return handler(payload);
  },
  has(intent: SerenovaIntent): boolean {
    return registry.has(intent);
  },
};
