
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
**Regras de Negócio e Correções Anteriores do Usuário (Use para melhorar a precisão):**
---`;

  feedbackHistory.forEach(item => {
    // O feedback agora é uma dica textual direta.
    if (item.justification && item.justification.trim()) {
      promptSection += `
- Regra/Correção fornecida: "${item.justification.trim()}"`;
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
  const storedFeedback = await getRecentFeedback(15); // Aumentado para 15 para mais contexto
  const feedbackPrompt = generateFeedbackPrompt(storedFeedback);

  const prompt = `
    Você é um assistente de extração de dados altamente especializado para requisições de viagem.
    Sua tarefa é analisar meticulosamente o texto do documento PDF fornecido e retornar um único objeto JSON bem estruturado.
    Você deve aprender com as correções anteriores do usuário.

    ${feedbackPrompt}

    **Instruções de Extração:**

    1.  **Informações Globais (Faturamento e Título):**
        -   **title**: O título principal, tipicamente "Requisição para Compra de Passagens" mais o nome do projeto (ex: "12071-5-CONT 31/2024 - IFMA - PROJETO...").
        -   **billing.costCenter**: Encontre o valor de "CENTRO DE CUSTO". Esta é a conta corrente do projeto. Se não disponível, use o número do projeto.
        -   **billing.account**: Encontre o valor de "NUMERO DO PROJETO".
        -   **billing.webId**: Extraia apenas o número de "Número da Solicitação: WEB:".
        -   **billing.description**: Obtenha o conteúdo completo do campo "JUSTIFICATIVA/FINALIDADE".

    2.  **Passageiros (Array de objetos):** Encontre todas as seções de passageiros. Cada seção "DADOS GERAIS DO ITEM" ou "DADOS DO BENEFICIÁRIO" representa uma requisição para um passageiro.
        -   **name**: O nome completo de "CPF E NOME". Padronize o nome convertendo-o para letras maiúsculas (ex: 'João da Silva' se torna 'JOÃO DA SILVA').
        -   **cpf**: O CPF de "CPF E NOME".
        -   **birthDate**: A data de nascimento de "DATA DE NASCIMENTO" no formato DD/MM/AAAA.
        -   **email**: O e-mail de "E-MAIL".
        -   **phone**: O número de telefone de "TELEFONE" ou "CELULAR".
        -   **itinerary (Array de objetos)**: Para cada passageiro, extraia seus segmentos de viagem.
            -   **origin**: A "CIDADE DE ORIGEM" ou "ORIGEM". Padronize o nome da cidade removendo acentos e convertendo para maiúsculas (ex: 'São Paulo' se torna 'SAO PAULO').
            -   **destination**: A "CIDADE DE DESTINO" ou "DESTINO". Padronize o nome da cidade removendo acentos e convertendo para maiúsculas (ex: 'CUIABÁ' se torna 'CUIABA').
            -   **departureDate**: A data de "DATA DE SAÍDA" ou "IDA" no formato DD/MM/AAAA.
            -   **returnDate**: A data de "DATA DE RETORNO" ou "RETORNO" no formato DD/MM/AAAA. Se não estiver presente, este campo deve ser nulo.
            -   **isRoundTrip**: Defina como 'true' se uma data de retorno existir, caso contrário, 'false'.
            -   **tripType**: Determine se é "Aéreo" ou "Terrestre". Padrão para "Aéreo" se não especificado.
            -   **ciaAerea**: Extraia de "DETALHE DO ITEM" ou "OBSERVAÇÕES". Para terrestre, pode ser a empresa de ônibus.
            -   **voo**: Extraia de "DETALHE DO ITEM" ou "OBSERVAÇÕES". Para terrestre, pode ser nulo.
            -   **horarios**: Extraia de "DETALHE DO ITEM" ou "OBSERVAÇÕES".
            -   **baggage**: Verifique o campo "BAGAGENS". Se contiver "COM BAGAGENS", defina como "Com Bagagem". Se "SEM BAGAGENS", defina como "Sem Bagagem". Se não estiver presente, defina como "Não especificado".
            -   **quantity**: Extraia o valor de "QUANTIDADE". É um número. Se não presente, o padrão é 1.
            -   **unitPrice**: Extraia o valor de "VALOR UNITARIO". Deve ser um número (ex: 1234.56). Se não presente, o padrão é 0.

    **Formato de Saída JSON Esperado:**
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
          "name": "string (TUDO MAIÚSCULO)",
          "cpf": "string",
          "birthDate": "string (DD/MM/AAAA)",
          "email": "string or null",
          "phone": "string or null",
          "itinerary": [
            {
              "origin": "string (TUDO MAIÚSCULO, SEM ACENTOS)",
              "destination": "string (TUDO MAIÚSCULO, SEM ACENTOS)",
              "departureDate": "string (DD/MM/AAAA)",
              "returnDate": "string (DD/MM/AAAA) or null",
              "isRoundTrip": "boolean",
              "tripType": "Aéreo" | "Terrestre",
              "ciaAerea": "string or null",
              "voo": "string or null",
              "horarios": "string or null",
              "baggage": "Com Bagagem" | "Sem Bagagem" | "Não especificado",
              "quantity": "number",
              "unitPrice": "number"
            }
          ]
        }
      ]
    }

    **Instruções Cruciais:**
    - Seja preciso. Se um campo não estiver presente, retorne nulo ou uma string vazia conforme apropriado pelo esquema, exceto para quantidade (padrão 1) e valorUnitario (padrão 0).
    - Se você estiver usando o feedback para fazer uma correção, certifique-se de aplicá-la. As regras do usuário são mais importantes que sua análise inicial. Por exemplo, se o usuário afirmar "O número do projeto é sempre a primeira parte do título", você deve seguir essa regra.
    - **Sempre padronize os nomes de passageiros e cidades como instruído acima.**

    **Documento para análise:**
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

    
