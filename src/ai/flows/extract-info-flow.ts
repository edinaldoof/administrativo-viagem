
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

// A saída deve corresponder ao esquema do formulário de viagem
const ExtractInfoOutputSchema = travelRequestSchema;
export type ExtractInfoOutput = z.infer<typeof ExtractInfoOutputSchema>;

// Função exportada que o aplicativo chamará
export async function extractInfoFromPdf(input: ExtractInfoInput): Promise<ExtractInfoOutput> {
  return extractInfoFlow(input);
}

const parseDate = (dateString: string | null): Date | undefined => {
    if (!dateString) return undefined;
    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (parts) {
      // parts[1] = DD, parts[2] = MM, parts[3] = YYYY
      return new Date(parseInt(parts[3], 10), parseInt(parts[2], 10) - 1, parseInt(parts[1], 10));
    }
    return undefined;
};


// Define o fluxo do Genkit
const extractInfoFlow = ai.defineFlow(
  {
    name: 'extractInfoFlow',
    inputSchema: ExtractInfoInputSchema,
    outputSchema: ExtractInfoOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `
        Você é um assistente especialista em extração de dados de documentos.
        Sua tarefa é analisar o documento PDF a seguir e extrair as informações para preencher um formulário de solicitação de viagem.
        
        O documento é uma "Requisição para Compra de Passagens".

        Extraia as seguintes informações e retorne-as em um formato JSON. Preste muita atenção aos nomes dos campos e à estrutura.

        - "title": O título principal da requisição, geralmente encontrado no topo.
        - "billing":
          - "costCenter": O valor do campo "CENTRO DE CUSTO".
          - "account": O valor do campo "NUMERO DO PROJETO".
          - "webId": O número da solicitação, que aparece como "Numero da Solicitacao: WEB:". Extraia apenas o número.
          - "description": O conteúdo do campo "JUSTIFICATIVA/FINALIDADE".
        - "passengers": Uma lista contendo um passageiro.
          - "name": O nome completo do passageiro, encontrado em "CPF E NOME".
          - "cpf": O CPF do passageiro, encontrado em "CPF E NOME".
          - "birthDate": A data de nascimento, encontrada em "DATA DE NASCIMENTO". Formate como DD/MM/YYYY.
          - "email": O e-mail do passageiro, encontrado em "E-MAIL".
          - "phone": O telefone do passageiro, encontrado em "TELEFONE" ou "CELULAR".
          - "itinerary": Uma lista de trechos da viagem.
            - "origin": A "CIDADE DE ORIGEM".
            - "destination": A "CIDADE DE DESTINO".
            - "departureDate": A "DATA DE SAIDA". Formate como DD/MM/YYYY.
            - "returnDate": A "DATA DE RETORNO", se existir. Formate como DD/MM/YYYY.
            - "isRoundTrip": Defina como 'true' se houver uma data de retorno, caso contrário, 'false'.
            - "ciaAerea", "voo", "horarios": Tente extrair esses detalhes do campo "OBSERVACOES" ou "Sugestao". Se não encontrar, deixe em branco.

        Documento para análise: {{media url="${input.pdfDataUri}"}}
      `,
      output: {
        format: 'json',
        schema: ExtractInfoOutputSchema,
      },
    });

    if (!output) {
        throw new Error("A IA não conseguiu extrair os dados do PDF. Verifique se o documento é válido.");
    }

    // A IA retorna o objeto JSON diretamente, então apenas o retornamos.
    // Opcional: fazer pós-processamento ou validação adicional aqui, se necessário.
    const processedOutput = {
      ...output,
      passengers: output.passengers.map(p => ({
        ...p,
        // Garante que as datas sejam objetos Date, pois a IA pode retornar strings.
        birthDate: parseDate(p.birthDate as any) || new Date(),
        itinerary: (p.itinerary || []).map(i => ({
          ...i,
          departureDate: parseDate(i.departureDate as any) || new Date(),
          returnDate: parseDate(i.returnDate as any) || undefined,
        }))
      }))
    };

    try {
        const validatedOutput = ExtractInfoOutputSchema.parse(processedOutput);
        return validatedOutput;
    } catch (e) {
        console.error("Erro de validação Zod após extração da IA:", e);
        console.error("Dados recebidos da IA:", JSON.stringify(output, null, 2));
        throw new Error("Os dados extraídos pela IA não são válidos. Verifique o console para detalhes.");
    }
  }
);
