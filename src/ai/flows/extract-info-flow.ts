// src/ai/flows/extract-info-flow.ts
/**
 * @fileOverview Flow to extract travel information from a PDF.
 */

import { ai } from '../genkit';
import { z } from 'zod';
import { travelRequestSchema } from '../../lib/schemas';

const ExtractInfoInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A travel request PDF file as a data URI, which must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractInfoInput = z.infer<typeof ExtractInfoInputSchema>;

const ExtractInfoOutputSchema = travelRequestSchema;
export type ExtractInfoOutput = z.infer<typeof ExtractInfoOutputSchema>;

export async function extractInfoFromPdf(input: ExtractInfoInput): Promise<ExtractInfoOutput> {
  return extractInfoFlow(input);
}

const parseDate = (dateString: string | null): Date | undefined => {
    if (!dateString) return undefined;
    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (parts) {
      return new Date(parseInt(parts[3], 10), parseInt(parts[2], 10) - 1, parseInt(parts[1], 10));
    }
    return undefined;
};

const extractInfoFlow = ai.defineFlow(
  {
    name: 'extractInfoFlow',
    inputSchema: ExtractInfoInputSchema,
    outputSchema: ExtractInfoOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `
        You are an expert-level assistant for extracting data from documents.
        Your task is to analyze the following PDF document and extract the information to fill out a travel request form.
        The document is a "Requisição para Compra de Passagens".
        Extract the following information and return it in a JSON format. Pay close attention to the field names and structure.
        - "title": The main title of the request, usually found at the top.
        - "billing":
          - "costCenter": The value from the "CENTRO DE CUSTO" field.
          - "account": The value from the "NUMERO DO PROJETO" field.
          - "webId": The request number, which appears as "Numero da Solicitacao: WEB:". Extract only the number.
          - "description": The content of the "JUSTIFICATIVA/FINALIDADE" field.
        - "passengers": A list containing one passenger.
          - "name": The full name of the passenger, found in "CPF E NOME".
          - "cpf": The passenger's CPF, found in "CPF E NOME".
          - "birthDate": The date of birth, found in "DATA DE NASCIMENTO". Format as DD/MM/YYYY.
          - "email": The passenger's email, found in "E-MAIL".
          - "phone": The passenger's phone, found in "TELEFONE" or "CELULAR".
          - "itinerary": A list of travel segments.
            - "origin": The "CIDADE DE ORIGEM".
            - "destination": The "CIDADE DE DESTINO".
            - "departureDate": The "DATA DE SAIDA". Format as DD/MM/YYYY.
            - "returnDate": The "DATA DE RETORNO", if it exists. Format as DD/MM/YYYY.
            - "isRoundTrip": Set to 'true' if a return date is present, otherwise 'false'.
            - "ciaAerea", "voo", "horarios": Try to extract these details from the "OBSERVACOES" or "Sugestao" field. If not found, leave them blank.
        Document for analysis: {{media url="${input.pdfDataUri}"}}
      `,
      output: {
        format: 'json',
        schema: ExtractInfoOutputSchema,
      },
    });

    if (!output) {
        throw new Error("AI failed to extract data from the PDF. Please ensure the document is valid.");
    }

    const processedOutput = {
      ...output,
      passengers: output.passengers.map(p => ({
        ...p,
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
        console.error("Zod validation error after AI extraction:", e);
        console.error("Data received from AI:", JSON.stringify(output, null, 2));
        throw new Error("The data extracted by the AI is not valid. Check the console for details.");
    }
  }
);