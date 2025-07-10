
'use server';
/**
 * @fileOverview Flow para extrair informações de viagem de um PDF usando regex.
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

// ------------------- Lógica de Extração Refinada -------------------

/**
 * Normaliza o texto removendo múltiplos espaços, quebras de linha e acentos para facilitar a análise.
 * @param {string} texto - O texto a ser normalizado.
 * @returns {string} O texto normalizado.
 */
function normalizarTexto(texto: string | null): string {
  if (!texto) return '';
  return texto
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/\s+/g, ' ') // Substitui múltiplos espaços/quebras de linha por um único espaço
    .trim();
}

/**
 * Função auxiliar genérica para extrair um valor com base numa regex.
 * @param {string} texto - O texto completo onde procurar.
 * @param {RegExp} regex - A expressão regular a ser usada.
 * @returns {string|null} O valor capturado ou null.
 */
function extrairCampo(texto: string, regex: RegExp): string | null {
  const match = texto.match(regex);
  return match && match[1] ? match[1].trim() : null;
}

/**
 * Extrai os dados de faturação do texto da requisição.
 * @param {string} texto - O texto completo da requisição.
 * @returns {object} Um objeto com os dados de faturação.
 */
function extrairFaturamento(texto: string) {
  return {
    webId: extrairCampo(texto, /Numero da Solicitacao: WEB:(\S+)/i) || "",
    account: extrairCampo(texto, /NUMERO DO PROJETO:\s*(\d+)/i) || "",
    description: extrairCampo(texto, /JUSTIFICATIVA\/FINALIDADE:\s*([\s\S]*?)(?=USUARIO DE CADASTRO:)/i) || "",
    costCenter: extrairCampo(texto, /centro de custo:\s*(.*?)(?=\s*gestor)/i) || "N/A", // Regex adicionada para Centro de Custo se houver.
  };
}

/**
 * Extrai os dados do passageiro (beneficiário) do texto da requisição.
 * @param {string} texto - O texto completo da requisição.
 * @returns {object|null} Um objeto com os dados do passageiro ou null.
 */
function extrairPassageiro(texto: string) {
    const passageiro: { name?: string; cpf?: string | null; birthDate?: string | null } = {};
    const nomeCompletoMatch = texto.match(/CPF E NOME:\s*[0-9.-]+\s*-\s*([A-Za-z\s]+)/i);
    if (nomeCompletoMatch) {
        passageiro.name = nomeCompletoMatch[1].trim();
    }

    passageiro.cpf = extrairCampo(texto, /CPF E NOME:\s*([0-9.-]+)/i);
    passageiro.birthDate = extrairCampo(texto, /DATA DE NASCIMENTO:\s*(\d{2}\/\d{2}\/\d{4})/i);

    return passageiro.name ? passageiro : null;
}

/**
 * Extrai os detalhes de um voo (Cia, Voo, Horários) de um bloco de texto.
 * @param {string | null} textoObs - O bloco de texto das observações.
 * @param {string} tipo - "ida" ou "volta" para ajudar a encontrar a linha correta.
 * @returns {object} Um objeto com os detalhes do voo.
 */
function extrairDetalhesVoo(textoObs: string | null, tipo: 'ida' | 'volta' = 'ida') {
    const detalhes = { ciaAerea: "", voo: "", horarios: "" };
    if (!textoObs) return detalhes;

    const regexLinha = new RegExp(`(?:${tipo === 'ida' ? 'Vinda|Ida' : 'Volta'})\\s*-\\s*(.+)`, 'i');
    const linhaMatch = textoObs.match(regexLinha);
    const linhaVoo = linhaMatch ? linhaMatch[1] : textoObs;

    const ciaMatch = linhaVoo.match(/(Latam|GOL|Azul)/i);
    if (ciaMatch) detalhes.ciaAerea = ciaMatch[1].toUpperCase();

    const vooMatch = linhaVoo.match(/(?:Voo N°|Voo No):\s*([A-Z0-9]+)/i);
    if (vooMatch) detalhes.voo = vooMatch[1];
    
    const horarioMatch = linhaVoo.match(/(\d{2}:?\d{2}h?)/);
    if (horarioMatch) detalhes.horarios = horarioMatch[1];

    return detalhes;
}


/**
 * Extrai os itinerários (ida e volta) do texto da requisição.
 * @param {string} texto - O texto completo da requisição.
 * @returns {Array} Uma lista de objetos de itinerário.
 */
function extrairItinerarios(texto: string) {
  const itinerarios = [];
  
  const origem = extrairCampo(texto, /CIDADE DE ORIGEM:\s*(.+?)(?=\s*CIDADE DE DESTINO:)/i);
  const destino = extrairCampo(texto, /CIDADE DE DESTINO:\s*(.+?)(?=\s*DATA DE SAIDA:)/i);
  const dataSaida = extrairCampo(texto, /DATA DE SAIDA:\s*(\d{2}\/\d{2}\/\d{4})/i);
  const dataRetorno = extrairCampo(texto, /DATA DE RETORNO:\s*(\d{2}\/\d{2}\/\d{4})/i);
  
  const blocoObservacoes = extrairCampo(texto, /(?:OBSERVACOES|Sugestao:)\s*([\s\S]+?)(?=Pagina \d de \d|ASSINADO ELETRONICAMENTE)/i);

  if (origem && destino && dataSaida) {
    const detalhesIda = extrairDetalhesVoo(blocoObservacoes, 'ida');
    itinerarios.push({
      id: 'temp-ida',
      origin: origem,
      destination: destino,
      departureDate: parseDate(dataSaida),
      isRoundTrip: !!dataRetorno,
      returnDate: dataRetorno ? parseDate(dataRetorno) : undefined,
      ...detalhesIda
    });
  }
  
  return itinerarios;
}

const parseDate = (dateString: string | null): Date | undefined => {
    if (!dateString) return undefined;
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    return undefined;
};

// ------------------- Fim da Lógica de Extração -------------------


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
    
    // 2. Processa o texto com a lógica refinada
    const textoNormalizado = normalizarTexto(rawText);
    const billing = extrairFaturamento(textoNormalizado);
    const passengerData = extrairPassageiro(textoNormalizado);
    const title = extrairCampo(textoNormalizado, /Requisicao para Compra de Passagens\s*([\s\S]*?)(?:DO PIAUI|Numero da Solicitacao:)/i) || "Título não encontrado";

    if (!passengerData) {
        throw new Error("Não foi possível extrair os dados do passageiro do PDF.");
    }
    
    // 3. Monta o objeto de saída
    const extractedData = {
        title: title,
        billing: billing,
        passengers: [
            {
                id: 'temp-pass-0',
                name: passengerData.name || "",
                cpf: passengerData.cpf || "",
                birthDate: parseDate(passengerData.birthDate) || new Date(),
                itinerary: extrairItinerarios(textoNormalizado),
                documents: [],
            }
        ]
    };

    // 4. Valida e retorna os dados extraídos
    try {
        const validatedOutput = ExtractInfoOutputSchema.parse(extractedData);
        return validatedOutput;
    } catch (e) {
        console.error("Erro de validação Zod:", e);
        throw new Error("Os dados extraídos do PDF não são válidos. Verifique o console para detalhes.");
    }
  }
);
