
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

// Função para converter data do formato DD/MM/AAAA para um objeto Date
const parseDate = (dateString: string | null): Date | undefined => {
    if (!dateString) return undefined;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      // new Date(year, monthIndex, day)
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
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
    // 1. Pede à IA para extrair o texto bruto do PDF
    const { output: rawText } = await ai.generate({
        prompt: `Extraia todo o texto do documento a seguir. Mantenha a formatação e as quebras de linha o mais próximo possível do original. Documento: {{media url="${input.pdfDataUri}"}}`,
        output: {
            schema: z.string()
        }
    });

    if (!rawText) {
        throw new Error("A IA não conseguiu ler o conteúdo do PDF.");
    }
    
    // 2. Aplica as expressões regulares no texto extraído
    const extract = (regex: RegExp, group = 1) => {
        const match = rawText.match(regex);
        return match && match[group] ? match[group].trim().replace(/\s+/g, ' ') : null;
    };
    
    const extractAll = (regex: RegExp) => {
        const matches = [...rawText.matchAll(regex)];
        return matches.map(m => m.slice(1).map(s => s.trim().replace(/\s+/g, ' ')));
    }

    const passengerMatch = extractAll(/CPF E NOME:\s*([0-9.-]+)\s*-\s*([A-Za-zÀ-ú\s]+)/g);
    const birthDateMatch = extractAll(/DATA DE NASCIMENTO:\s*(\d{2}\/\d{2}\/\d{4})/g);
    const originMatch = extractAll(/CIDADE DE ORIGEM:\s*(.+)/g);
    const destinationMatch = extractAll(/CIDADE DE DESTINO:\s*(.+)/g);
    const departureDateMatch = extractAll(/DATA DE SA[IÍ]DA:\s*(\d{2}\/\d{2}\/\d{4})/gi);
    const returnDateMatch = extractAll(/DATA DE RETORNO:\s*(\d{2}\/\d{2}\/\d{4})/g);

    // 3. Monta o objeto de saída
    const title = extract(/Requisição para Compra de Passagens\s*([\s\S]*?)(?:DO PIAUÍ|Número da Solicitação:)/) || "Título não encontrado";
    const webId = extract(/Número da Solicitação: WEB:(\S+)/);
    const account = extract(/NUMERO DO PROJETO:\s*(\d+)/);
    const description = extract(/JUSTIFICATIVA\/FINALIDADE:\s*([\s\S]*?)\s*USUÁRIO DE CADASTRO:/);

    const departureDate = parseDate(departureDateMatch[0]?.[0]);
    const returnDate = parseDate(returnDateMatch[0]?.[0]);
    
    const itinerary = [];
    if (departureDate) {
        itinerary.push({
            id: 'temp-ida',
            origin: originMatch[0]?.[0] || "",
            destination: destinationMatch[0]?.[0] || "",
            departureDate: departureDate,
            isRoundTrip: !!returnDate
        });

        if (returnDate) {
             itinerary[0].returnDate = returnDate;
        }
    }


    const passengers = passengerMatch.map((p, index) => ({
        id: `temp-pass-${index}`,
        cpf: p[0] || "",
        name: p[1] || "",
        birthDate: parseDate(birthDateMatch[index]?.[0]) || new Date(),
        documents: [],
        itinerary: itinerary
    }));
    
    const extractedData = {
        title: title,
        passengers: passengers,
        billing: {
            costCenter: "N/A", // Este campo não foi encontrado nos padrões, usando um placeholder
            webId: webId || "",
            account: account || "",
            description: description || ""
        },
    };

    // 4. Valida e retorna os dados extraídos
    try {
        const validatedOutput = ExtractInfoOutputSchema.parse(extractedData);
        return validatedOutput;
    } catch (e) {
        console.error("Erro de validação Zod:", e);
        throw new Error("Os dados extraídos do PDF não são válidos.");
    }
  }
);
