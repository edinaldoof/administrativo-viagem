// src/ai/geminiService.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRecentFeedback } from '../services/feedbackService'; 

const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

/**
 * Gera a seção do prompt dedicada ao histórico de feedback do usuário.
 * @param {Array<object>} feedbackHistory - Array de feedbacks salvos.
 * @returns {string} - A seção do prompt formatada.
 */
const generateFeedbackPrompt = (feedbackHistory) => {
  if (feedbackHistory.length === 0) return '';

  let promptSection = `
**Crucial User Feedback & Business Rules from Previous Corrections (Use this to improve accuracy):**
---`;

  feedbackHistory.forEach(item => {
    // Agora o feedback é apenas texto.
    if (item.justification && item.justification.trim()) {
      promptSection += `
- Rule/Correction provided by user: "${item.justification.trim()}"`;
    }
    promptSection += `
---`;
  });

  return promptSection;
};

/**
 * Processa o texto de um PDF usando IA para extrair dados de múltiplos beneficiários.
 * @param {string} text - O conteúdo de texto bruto extraído do PDF.
 * @returns {Promise<object>} - Uma promessa que resolve para o objeto JSON final.
 */
export const extractDataFromPdfWithGemini = async (text) => {
  if (!apiKey) {
    throw new Error('Erro de Configuração: A chave da API do Google não foi encontrada.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Busca o histórico de feedbacks para aprimorar a IA
  const storedFeedback = await getRecentFeedback(10); // Aumentado para 10 para mais contexto
  const feedbackPrompt = generateFeedbackPrompt(storedFeedback);

  const prompt = `
    You are a highly specialized data extraction assistant for travel requests.
    Your task is to meticulously analyze the provided PDF document text and return a single, well-structured JSON object.
    You must learn from the user's past corrections.

    ${feedbackPrompt}

    **Extraction Instructions:**

    1.  **Global Information (Billing & Title):**
        -   **title**: The main title, typically "Requisição para Compra de Passagens" plus the project name (e.g., "12071-5-CONT 31/2024 - IFMA - PROJETO...").
        -   **billing.costCenter**: Find the "CENTRO DE CUSTO" value. If not available, use the project number.
        -   **billing.account**: Find the "NUMERO DO PROJETO" value.
        -   **billing.webId**: Extract only the number from "Número da Solicitação: WEB:".
        -   **billing.description**: Get the full content from the "JUSTIFICATIVA/FINALIDADE" field.

    2.  **Passengers (Array of objects):** Find all passenger sections. Each "DADOS GERAIS DO ITEM" or "DADOS DO BENEFICIÁRIO" section represents a request for one passenger.
        -   **name**: The full name from "CPF E NOME".
        -   **cpf**: The CPF from "CPF E NOME".
        -   **birthDate**: The birth date from "DATA DE NASCIMENTO" in DD/MM/YYYY format.
        -   **email**: The email from "E-MAIL".
        -   **phone**: The phone number from "TELEFONE" or "CELULAR".
        -   **itinerary (Array of objects)**: For each passenger, extract their travel segments.
            -   **origin**: The "CIDADE DE ORIGEM" or "ORIGEM".
            -   **destination**: The "CIDADE DE DESTINO" or "DESTINO".
            -   **departureDate**: The "DATA DE SAÍDA" or "IDA" date in DD/MM/YYYY format.
            -   **returnDate**: The "DATA DE RETORNO" or "RETORNO" date in DD/MM/YYYY format. If not present, this field should be null.
            -   **isRoundTrip**: Set to 'true' if a return date exists, otherwise 'false'.
            -   **ciaAerea**, **voo**, **horarios**: Extract these from "DETALHE DO ITEM" or "OBSERVAÇÕES".
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
    - Be precise. If a field is not present, return null or an empty string.
    - If you are using feedback to make a correction, be sure to apply it. The user's rules are more important than your initial analysis. For example, if the user states "The project number is always the first part of the title", you must follow that rule.

    **Document for analysis:**
    ---
    ${text}
    ---
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    const cleanJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Erro ao processar com a API Gemini:', error);
    if (error.message.includes('API key not valid')) {
        throw new Error("Erro de Configuração: A chave da API é inválida.");
    }
    if (error instanceof SyntaxError) {
        throw new Error("A IA retornou uma resposta em um formato inesperado.");
    }
    throw new Error('Falha ao extrair dados do PDF com a IA.');
  }
};
