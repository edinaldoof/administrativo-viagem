import { z } from 'zod';

// --- Tipos para o Chat ---

// Esquema para uma única mensagem no histórico de chat
export const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
