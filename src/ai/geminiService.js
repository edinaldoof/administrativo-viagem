
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

/**
 * Processa o texto de um PDF usando IA para extrair dados de múltiplos beneficiários.
 * @param {string} text - O conteúdo de texto bruto extraído do PDF.
 * @param {object} preprocessedData - Dados já extraídos via Regex para dar contexto à IA (opcional).
 * @returns {Promise<object>} - Uma promessa que resolve para o objeto JSON final com a estrutura de múltiplos passageiros.
 */
export const extractDataFromPdfWithGemini = async (text, preprocessedData = {}) => {
  if (!apiKey) {
    throw new Error('Erro de Configuração: A chave da API do Google não foi encontrada.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    You are a highly specialized data extraction assistant for travel requests.
    Your task is to meticulously analyze the provided PDF document, which can contain multiple travel requests for different people across many pages.
    Extract all information and return a single, well-structured JSON object.

    **Extraction Instructions:**

    1.  **Global Information (Billing & Title):** This information usually appears once at the top of the document and applies to all passengers.
        -   **title**: The main title, typically "Requisição para Compra de Passagens" plus the project name (e.g., "12071-5-CONT 31/2024 - IFMA - PROJETO...").
        -   **billing.costCenter**: Find the "CENTRO DE CUSTO" value. If not available, use the project number.
        -   **billing.account**: Find the "NUMERO DO PROJETO" value.
        -   **billing.webId**: Extract only the number from "Número da Solicitação: WEB:".
        -   **billing.description**: Get the full content from the "JUSTIFICATIVA/FINALIDADE" field.

    2.  **Passengers (Array of objects):** Scour the entire document for all passenger sections. Each passenger is usually identified by a "DADOS DO BENEFICIÁRIO" section. Create one object in the array for each passenger found.
        -   **name**: The full name from "CPF E NOME".
        -   **cpf**: The CPF from "CPF E NOME".
        -   **birthDate**: The birth date from "DATA DE NASCIMENTO" in DD/MM/YYYY format.
        -   **email**: The email from "E-MAIL".
        -   **phone**: The phone number from "TELEFONE" or "CELULAR".
        -   **itinerary (Array of objects)**: For each passenger, extract their travel segments from the "DADOS DA VIAGEM" or "DETALHE DO ITEM" sections associated with them.
            -   **origin**: The "CIDADE DE ORIGEM" or "ORIGEM".
            -   **destination**: The "CIDADE DE DESTINO" or "DESTINO".
            -   **departureDate**: The "DATA DE SAÍDA" or "IDA" date in DD/MM/YYYY format.
            -   **returnDate**: The "DATA DE RETORNO" or "RETORNO" date in DD/MM/YYYY format. If not present, this field should be null.
            -   **isRoundTrip**: Set to 'true' if a return date exists, otherwise 'false'.
            -   **ciaAerea**, **voo**, **horarios**: Extract these from the "DETALHE DO ITEM" or "OBSERVAÇÕES" sections. Look for flight numbers (e.g., "VÔO N°: AD4361"), airline names (e.g., "Latam", "Azul"), and times.
            -   **baggage**: Check the "BAGAGENS" field. If it contains "COM BAGAGENS", set to "Com Bagagem". If "SEM BAGAGENS", set to "Sem Bagagem".

    **Expected JSON Output Format:**
    {
      "title": "string or null",
      "billing": {
        "costCenter": "string or null",
        "account": "string or null",
        "webId": "string or null",
        "description": "string or null"
      },
      "passengers": [
        {
          "name": "string",
          "cpf": "string",
          "birthDate": "string (DD/MM/YYYY)",
          "email": "string or null",
          "phone": "string or null",
          "itinerary": [
            {
              "origin": "string",
              "destination": "string",
              "departureDate": "string (DD/MM/YYYY)",
              "returnDate": "string (DD/MM/YYYY) or null",
              "isRoundTrip": "boolean",
              "ciaAerea": "string or null",
              "voo": "string or null",
              "horarios": "string or null",
              "baggage": "string or null"
            }
          ]
        }
      ]
    }

    **Crucial Instructions:**
    - A single document can have many pages and multiple passengers. You MUST iterate through all pages to find every beneficiary.
    - The details for a single passenger can be spread across multiple pages.
    - Be precise. Do not invent data. If a field is not present in the document, return null or an empty string for that field.

    **Document for analysis:**
    ---
    ${text}
    ---
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    // Limpeza para garantir que a resposta seja um JSON válido
    const cleanJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Erro ao processar com a API Gemini:', error);
    if (error.message.includes('API key not valid')) {
        throw new Error("Erro de Configuração: A chave da API é inválida. Por favor, contate o administrador do sistema.");
    }
    if (error instanceof SyntaxError) {
        throw new Error("A IA retornou uma resposta em um formato inesperado. Por favor, tente novamente ou com outro arquivo.");
    }
    throw new Error('Falha ao extrair dados do PDF com a IA.');
  }
};
