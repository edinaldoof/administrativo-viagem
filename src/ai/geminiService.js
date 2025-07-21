// src/ai/geminiService.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRecentFeedback } from '../services/feedbackService.js'; 

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
    Você é um assistente de extração de dados altamente especializado para requisições de viagem de diversos formatos.
    Sua tarefa é analisar o texto do documento fornecido e retornar um único objeto JSON bem estruturado.
    A estrutura do documento pode variar. Você deve ser flexível para encontrar os dados, seja em tabelas, listas ou texto corrido.
    **Aprenda com as correções anteriores do usuário, elas são a regra mais importante.**

    ${feedbackPrompt}

    **Instruções de Extração Conceitual (Encontre a ideia, não apenas o texto exato):**

    1.  **Informações Globais (Faturamento e Título):**
        -   **title**: Identifique o título principal do documento. Geralmente está no topo e pode incluir "Requisição de Compra", "Solicitação de Viagem" e um nome ou número de projeto.
        -   **billing.costCenter**: Encontre o centro de custo. Procure por termos como "CENTRO DE CUSTO", "CC", "Cost Center". Pode ser um código ou um nome. Se não encontrar, pode estar associado ao número do projeto.
        -   **billing.account**: Encontre o número ou conta do projeto. Procure por "NUMERO DO PROJETO", "Conta do Projeto", "Project ID".
        -   **billing.webId**: Extraia o número de identificação da solicitação, frequentemente associado a termos como "Número da Solicitação", "WEB ID", "Request ID".
        -   **billing.description**: Obtenha a justificativa ou finalidade da viagem. Procure por campos como "JUSTIFICATIVA", "FINALIDADE", "OBJETIVO".

    2.  **Passageiros (Array de objetos):** O documento pode conter um ou mais passageiros. Identifique cada um. Eles podem ser chamados de "Passageiro", "Beneficiário", "Viajante" ou estarem em seções como "DADOS DO ITEM".
        -   **name**: O nome completo do passageiro. Geralmente está próximo ao CPF. **Padronize o nome para MAIÚSCULAS.**
        -   **cpf**: O número do CPF.
        -   **birthDate**: A data de nascimento, no formato DD/MM/AAAA.
        -   **email**: O endereço de e-mail.
        -   **phone**: O número de telefone ou celular.
        -   **itinerary (Array de objetos)**: Para cada passageiro, extraia seus trechos de viagem. Um passageiro pode ter múltiplos trechos (ida, volta, conexões).
            -   **origin**: A cidade de origem do trecho. **Padronize para MAIÚSCULAS e sem acentos (ex: 'São Paulo' -> 'SAO PAULO').**
            -   **destination**: A cidade de destino do trecho. **Padronize para MAIÚSCulas e sem acentos (ex: 'CUIABÁ' -> 'CUIABA').**
            -   **departureDate**: A data de partida do trecho, no formato DD/MM/AAAA.
            -   **returnDate**: A data de retorno do trecho, no formato DD/MM/AAAA. Se o trecho for apenas de ida, este campo deve ser nulo.
            -   **isRoundTrip**: Analise o contexto. Se houver uma data de retorno clara para o trecho de ida, marque como 'true' para aquele trecho. Para o trecho de volta, marque como 'false'.
            -   **tripType**: Determine se é "Aéreo" ou "Terrestre" com base no contexto (ex: menção a "Voo", "Cia Aérea" vs. "Ônibus", "Empresa"). Padrão para "Aéreo" se não especificado.
            -   **ciaAerea**: Nome da companhia aérea ou de transporte terrestre.
            -   **voo**: O número do voo ou identificador do transporte.
            -   **horarios**: Os horários de partida e chegada.
            -   **baggage**: Verifique se há menção a bagagens. Pode ser "Com Bagagem", "Sem Bagagem", "Baggage included", etc. Se não houver menção, defina como "Não especificado".
            -   **quantity**: A quantidade de passagens para este trecho. Se não for especificado, o padrão é 1.
            -   **unitPrice**: O valor unitário do trecho. Deve ser um número. Se não for especificado, o padrão é 0.

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
    - Seja preciso e meticuloso. Se um campo não for encontrado, retorne nulo ou uma string vazia conforme o esquema, exceto para quantidade (padrão 1) e valorUnitario (padrão 0).
    - **Suas regras mais importantes vêm do feedback do usuário. Aplique essas correções rigorosamente.**
    - **Sempre padronize os nomes de passageiros e cidades como instruído.**
    - Retorne apenas o objeto JSON, sem nenhum texto adicional ou formatação como \`\`\`json.

    **Documento para análise:**
    ---
    ${text}
    ---
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    // Limpeza robusta para garantir que apenas o JSON seja processado
    const cleanJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Erro ao processar com a API Gemini:', error);
    if (error.message.includes('API key not valid')) {
        throw new Error("Erro de Configuração: A chave da API é inválida.");
    }
    if (error instanceof SyntaxError) {
        throw new Error("A IA retornou uma resposta em um formato inesperado. Verifique o JSON retornado: " + error.message);
    }
    throw new Error('Falha ao extrair dados do PDF com a IA.');
  }
};
