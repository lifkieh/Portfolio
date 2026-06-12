export type SerenovaIntent =
  | "switch_theme"
  | "filter_projects"
  | "show_section"
  | "generate_theme"; // untuk generated theme (future)

export type SerenovaResponse =
  | {
      type: "answer";
      message: string;
    }
  | {
      type: "action";
      intent: SerenovaIntent;
      payload: Record<string, unknown>;
      // Optional: pesan yang ditampilkan ke user setelah action
      confirmationMessage?: string;
    };

export interface ActionHandler {
  intent: SerenovaIntent;
  execute: (payload: Record<string, unknown>) => void | Promise<void>;
}
