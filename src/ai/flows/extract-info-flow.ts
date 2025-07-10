
'use server';
/**
 * @fileOverview Flow para extrair informações de viagem de um PDF.
 *
 * - extractInfoFromPdf - Extrai dados estruturados de uma solicitação de viagem em PDF.
 * - ExtractInfoInput - O tipo de entrada para a função.
 * - ExtractInfoOutput - O tipo de saída para a função.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { travelRequestSchema } from '@/lib/schemas';

// Define o esquema de entrada para o fluxo
const ExtractInfoInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "Um arquivo PDF de solicitação de viagem como um data URI, que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:application/pdf;base64,<dados_codificados>'."
    ),
});
export type ExtractInfoInput = z.infer<typeof ExtractInfoInputSchema>;

// A saída deve corresponder ao esquema do formulário de viagem, mas sem os IDs e datas gerados pelo sistema
const ExtractInfoOutputSchema = travelRequestSchema;
export type ExtractInfoOutput = z.infer<typeof ExtractInfoOutputSchema>;


// Função exportada que o aplicativo chamará
export async function extractInfoFromPdf(input: ExtractInfoInput): Promise<ExtractInfoOutput> {
  return extractInfoFlow(input);
}


// Define o prompt para o Genkit
const extractPrompt = ai.definePrompt({
  name: 'extractTravelInfoPrompt',
  input: { schema: ExtractInfoInputSchema },
  output: { schema: ExtractInfoOutputSchema },
  prompt: `Você é um assistente especializado em extrair informações de documentos de solicitação de viagem em formato PDF.
Sua tarefa é analisar o PDF fornecido e preencher os campos de acordo com o esquema de saída JSON.

PDF para análise: {{media url=pdfDataUri}}

Por favor, extraia as seguintes informações:
- Título da solicitação.
- Detalhes de faturamento, incluindo centro de custo, conta, descrição e WEB ID.
- Uma lista de todos os passageiros.
- Para cada passageiro, extraia o nome completo, CPF e data de nascimento.
- Para cada passageiro, extraia a lista de itinerários (trechos da viagem).
- Para cada itinerário, extraia a origem, destino, data de partida e, se houver, a data de retorno (e se é ida e volta).
- Se não encontrar um valor para um campo opcional, omita-o do JSON. Campos obrigatórios como nome, cpf, origem, destino e datas devem ser preenchidos.
- Preste muita atenção aos formatos de data e CPF.

Retorne os dados estritamente no formato JSON especificado.`,
});


// Define o fluxo do Genkit
const extractInfoFlow = ai.defineFlow(
  {
    name: 'extractInfoFlow',
    inputSchema: ExtractInfoInputSchema,
    outputSchema: ExtractInfoOutputSchema,
  },
  async (input) => {
    const { output } = await extractPrompt(input);
    
    if (!output) {
        throw new Error("A IA não conseguiu extrair as informações do PDF.");
    }

    return output;
  }
);
