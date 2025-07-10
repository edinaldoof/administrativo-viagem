
'use server';
/**
 * @fileOverview Flow para um chatbot assistente de viagens.
 *
 * - chat - Envia uma mensagem para o chatbot e obtém uma resposta.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getRequests } from '@/lib/actions';
import { type Message, MessageSchema } from '@/types';

// Define o prompt do sistema para o chatbot
const chatPrompt = ai.definePrompt({
    name: 'travelAssistantPrompt',
    input: { schema: z.array(MessageSchema) },
    output: { schema: z.string() },
    prompt: `Você é um assistente de IA amigável e prestativo para o sistema "Viagens-Fadex".
Sua função é ajudar os usuários a entender como usar o sistema, tirar dúvidas sobre solicitações de viagem existentes e fornecer informações úteis.

Aqui está um resumo das solicitações de viagem atuais no sistema. Você pode usar essas informações para responder a perguntas sobre elas.
Data e hora atual: ${new Date().toLocaleString()}

Solicitações de Viagem:
{{#if requests}}
    {{#each requests}}
        - Título: {{this.title}} (ID: {{this.id}})
          - Status: {{this.status}}
          - Criado em: {{this.createdAt}}
          - Faturamento: CC {{this.billing.costCenter}}, Conta {{this.billing.account}}
          - Passageiros:
            {{#each this.passengers}}
                - {{this.name}} (CPF: {{this.cpf}})
            {{/each}}
    {{/each}}
{{else}}
    Nenhuma solicitação de viagem encontrada.
{{/if}}

Baseado no histórico da conversa e nas informações acima, responda à pergunta do usuário.
Seja conciso e direto.

Histórico da Conversa:
{{#each input}}
    {{#if (eq this.role 'user')}}
        Usuário: {{this.content}}
    {{else}}
        Assistente: {{this.content}}
    {{/if}}
{{/each}}
`
});


// Define o fluxo de chat
const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: z.array(MessageSchema),
        outputSchema: MessageSchema,
    },
    async (history) => {

        // Obtém as solicitações de viagem atuais para injetar no prompt
        const requests = getRequests();

        const llmResponse = await chatPrompt({
            // @ts-ignore
            requests: requests,
        }, {
            history: history,
        });

        const responseText = llmResponse.output || "Não consegui processar a resposta.";
        
        return { role: 'model', content: responseText };
    }
);

// Função exportada que o aplicativo chamará
export async function chat(history: Message[]): Promise<Message> {
  return chatFlow(history);
}
