// src/ai/geminiService.js

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRecentFeedback } from '../services/feedbackService.js';

const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

// Configurações de retry
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  backoffMultiplier: 2
};

// Cache simples para evitar requisições duplicadas
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Limpa entradas antigas do cache
 */
const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      requestCache.delete(key);
    }
  }
};

/**
 * Gera uma chave de cache baseada no conteúdo
 */
const generateCacheKey = (text) => {
  // Cria um hash simples do texto (primeiros 100 chars + tamanho)
  const preview = text.substring(0, 100);
  return `${preview}_${text.length}`;
};

/**
 * Aguarda um período de tempo (para retry com backoff)
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Realiza uma requisição com retry automático
 */
const requestWithRetry = async (model, prompt, retryCount = 0) => {
  try {
    const result = await model.generateContent(prompt);
    return result;
  } catch (error) {
    // Verifica se é um erro que vale a pena tentar novamente
    const isRetryableError = 
      error.message?.includes('503') ||
      error.message?.includes('overloaded') ||
      error.message?.includes('429') || // Rate limit
      error.message?.includes('500') || // Server error
      error.message?.includes('timeout');

    if (isRetryableError && retryCount < RETRY_CONFIG.maxRetries) {
      const delayTime = Math.min(
        RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
        RETRY_CONFIG.maxDelay
      );
      
      console.log(`Tentativa ${retryCount + 1}/${RETRY_CONFIG.maxRetries} falhou. Aguardando ${delayTime}ms antes de tentar novamente...`);
      
      await delay(delayTime);
      return requestWithRetry(model, prompt, retryCount + 1);
    }
    
    throw error;
  }
};

/**
 * Gera a seção do prompt dedicada ao histórico de feedback do usuário.
 */
const generateFeedbackPrompt = (feedbackHistory) => {
  if (!feedbackHistory || feedbackHistory.length === 0) return '';

  let promptSection = `
**Regras de Negócio e Correções Anteriores do Usuário (Use para melhorar a precisão):**
---`;

  feedbackHistory.forEach(item => {
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
 * @param {object} options - Opções adicionais (onProgress, useCache, etc.)
 * @returns {Promise<object>} - Uma promessa que resolve para o objeto JSON final.
 */
export const extractDataFromPdfWithGemini = async (text, options = {}) => {
  const { onProgress, useCache = true } = options;
  
  if (!apiKey) {
    throw new Error('Erro de Configuração: A chave da API do Google não foi encontrada. Por favor, configure a variável de ambiente REACT_APP_GOOGLE_API_KEY.');
  }

  if (!text || text.trim().length < 10) {
    throw new Error('Erro: O documento está vazio ou não contém texto suficiente para análise.');
  }

  // Limpa o cache periodicamente
  cleanCache();

  // Verifica se existe no cache
  if (useCache) {
    const cacheKey = generateCacheKey(text);
    const cached = requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Usando resultado do cache para evitar nova requisição à API.');
      return cached.data;
    }
  }

  try {
    if (onProgress) onProgress('Inicializando modelo de IA...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1, // Menor temperatura para respostas mais consistentes
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 4096,
      }
    });

    if (onProgress) onProgress('Buscando histórico de aprendizados...');
    
    // Busca o histórico de feedbacks com tratamento de erro
    let feedbackHistory = [];
    try {
      feedbackHistory = await getRecentFeedback(20);
    } catch (feedbackError) {
      console.warn('Aviso: Não foi possível carregar o histórico de feedbacks:', feedbackError);
      // Continua sem o histórico de feedback
    }
    
    const feedbackPrompt = generateFeedbackPrompt(feedbackHistory);

    if (onProgress) onProgress('Analisando documento com IA...');

    const prompt = `
    Você é um assistente de extração de dados altamente especializado para requisições de viagem de diversos formatos.
    Sua tarefa é analisar o texto do documento fornecido e retornar um único objeto JSON bem estruturado.
    A estrutura do documento pode variar. Você deve ser flexível para encontrar os dados, seja em tabelas, listas ou texto corrido.
    **Aprenda com as correções anteriores do usuário, elas são a regra mais importante.**

    ${feedbackPrompt}

    **Instruções de Extração Conceitual (Encontre a ideia, não apenas o texto exato):**

    1.  **Informações Globais (Faturamento e Título):**
        -   **title**: Identifique o título principal do documento. Geralmente está no topo e pode incluir "Requisição de Compra", "Solicitação de Viagem" e um nome ou número de projeto.
        -   **billing.costCenter**: Encontre o centro de custo. Procure por termos como "CENTRO DE CUSTO", "Cost Center", "CC". Se não encontrar, pode estar associado ao número do projeto.
        -   **billing.account**: Encontre o número da conta do projeto. Procure por "NUMERO DO PROJETO", "Conta do Projeto", "Project ID", "CONT".
        -   **billing.cc**: Extraia a conta corrente do projeto, que pode vir como "CC", "Conta Corrente", "C/C".
        -   **billing.webId**: Extraia o número de identificação da solicitação, frequentemente associado a termos como "Número da Solicitação", "WEB ID", "Request ID", "WEB".
        -   **billing.description**: Obtenha a justificativa ou finalidade da viagem. Procure por campos como "JUSTIFICATIVA", "FINALIDADE", "OBJETIVO", "DESCRIÇÃO".

    2.  **Passageiros (Array de objetos):** O documento pode conter um ou mais passageiros. Identifique cada um. Eles podem ser chamados de "Passageiro", "Beneficiário", "Viajante", "Servidor" ou estarem em seções como "DADOS DO ITEM", "DADOS DO PASSAGEIRO".
        -   **name**: O nome completo do passageiro. Geralmente está próximo ao CPF. **Padronize o nome para MAIÚSCULAS.**
        -   **cpf**: O número do CPF (formato: 000.000.000-00 ou apenas números).
        -   **birthDate**: A data de nascimento, no formato DD/MM/AAAA.
        -   **email**: O endereço de e-mail.
        -   **phone**: O número de telefone ou celular.
        -   **itinerary (Array de objetos)**: Para cada passageiro, extraia seus trechos de viagem. Um passageiro pode ter múltiplos trechos (ida, volta, conexões).
            -   **origin**: A cidade de origem do trecho. **Padronize para MAIÚSCULAS e sem acentos (ex: 'São Paulo' -> 'SAO PAULO').**
            -   **destination**: A cidade de destino do trecho. **Padronize para MAIÚSCULAS e sem acentos (ex: 'CUIABÁ' -> 'CUIABA').**
            -   **departureDate**: A data de partida do trecho, no formato DD/MM/AAAA.
            -   **returnDate**: A data de retorno do trecho, no formato DD/MM/AAAA. Se o trecho for apenas de ida, este campo deve ser nulo.
            -   **isRoundTrip**: Se houver menção explícita a "ida e volta" para o trecho, marque como true.
            -   **tripType**: Determine se é "Aéreo" ou "Terrestre" com base no contexto (ex: menção a "Voo", "Cia Aérea", "Avião" = Aéreo; "Ônibus", "Van", "Carro" = Terrestre). Padrão: "Aéreo".
            -   **ciaAerea**: Nome da companhia aérea ou empresa de transporte.
            -   **voo**: O número do voo ou identificador do transporte.
            -   **horarios**: Os horários de partida e chegada (formato livre).
            -   **baggage**: Verifique se há menção a bagagens. Pode ser "Com Bagagem", "Sem Bagagem", "Bagagem incluída", "1PC", "2PC", etc. Se não houver menção, defina como "Não especificado".
            -   **quantity**: A quantidade de passagens para este trecho. Se não for especificado, o padrão é 1.
            -   **unitPrice**: O valor unitário do trecho. Deve ser um número. Se não for especificado, o padrão é 0.

    **IMPORTANTE**: 
    - Seja extremamente cuidadoso ao identificar datas. Procure por padrões DD/MM/AAAA ou variações.
    - Para valores monetários, remova símbolos como R$, pontos de milhar e converta vírgulas em pontos.
    - Se encontrar múltiplos passageiros, certifique-se de associar corretamente os itinerários a cada um.
    - Trechos de ida e volta devem ser identificados como itens separados no array de itinerários.

    **Formato de Saída JSON Esperado:**
    {
      "title": "string or null",
      "billing": {
        "costCenter": "string or null",
        "account": "string or null",
        "cc": "string or null",
        "webId": "string or null",
        "description": "string or null"
      },
      "passengers": [
        {
          "name": "string (TUDO MAIÚSCULO)",
          "cpf": "string (formato: 000.000.000-00)",
          "birthDate": "string (DD/MM/AAAA)",
          "email": "string or null",
          "phone": "string or null",
          "itinerary": [
            {
              "origin": "string (TUDO MAIÚSCULO, SEM ACENTOS)",
              "destination": "string (TUDO MAIÚSCULO, SEM ACENTOS)",
              "departureDate": "string (DD/MM/AAAA)",
              "returnDate": "string (DD/MM/AAAA) or null",
              "isRoundTrip": boolean,
              "tripType": "Aéreo" | "Terrestre",
              "ciaAerea": "string or null",
              "voo": "string or null",
              "horarios": "string or null",
              "baggage": "Com Bagagem" | "Sem Bagagem" | "Não especificado",
              "quantity": number,
              "unitPrice": number
            }
          ]
        }
      ]
    }

    **Instruções Cruciais:**
    - Se um campo não for encontrado, retorne null ou o valor padrão especificado.
    - **Suas regras mais importantes vêm do feedback do usuário. Aplique essas correções rigorosamente.**
    - **Sempre padronize os nomes de passageiros e cidades como instruído.**
    - Retorne apenas o objeto JSON, sem nenhum texto adicional ou formatação markdown.
    - Não use backticks ou blocos de código markdown no início ou fim da resposta.

    **Documento para análise:**
    ---
    ${text}
    ---
  `;

    // Realiza a requisição com retry
    const result = await requestWithRetry(model, prompt);
    
    if (onProgress) onProgress('Processando resposta da IA...');
    
    const response = await result.response;
    const jsonText = response.text();
    
    // Limpeza robusta para garantir que apenas o JSON seja processado
    const cleanJson = jsonText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .replace(/^[^{]*/, '') // Remove tudo antes do primeiro {
      .replace(/[^}]*$/, '') // Remove tudo depois do último }
      .trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', cleanJson);
      throw new Error(`A IA retornou uma resposta em formato inválido. Por favor, tente novamente.`);
    }

    // Validação básica da estrutura
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('A resposta da IA não contém dados válidos.');
    }

    // Garante que passengers seja sempre um array
    if (!parsedData.passengers) {
      parsedData.passengers = [];
    } else if (!Array.isArray(parsedData.passengers)) {
      parsedData.passengers = [parsedData.passengers];
    }

    // Garante que billing exista
    if (!parsedData.billing) {
      parsedData.billing = {};
    }

    // Salva no cache se habilitado
    if (useCache) {
      const cacheKey = generateCacheKey(text);
      requestCache.set(cacheKey, {
        data: parsedData,
        timestamp: Date.now()
      });
    }

    if (onProgress) onProgress('Análise concluída com sucesso!');
    
    return parsedData;
    
  } catch (error) {
    console.error('Erro ao processar com a API Gemini:', error);
    
    // Tratamento específico de erros
    if (error.message?.includes('API key not valid')) {
      throw new Error('Erro de Configuração: A chave da API é inválida. Por favor, verifique suas configurações.');
    }
    
    if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      throw new Error('O serviço de IA está temporariamente sobrecarregado. Por favor, aguarde alguns segundos e tente novamente.');
    }
    
    if (error.message?.includes('429')) {
      throw new Error('Limite de requisições excedido. Por favor, aguarde um momento e tente novamente.');
    }
    
    if (error.message?.includes('timeout')) {
      throw new Error('A requisição demorou muito para ser processada. Por favor, tente novamente.');
    }
    
    if (error instanceof SyntaxError || error.message?.includes('formato inválido')) {
      throw error; // Repassa erros de parse
    }
    
    // Erro genérico
    throw new Error(`Falha ao extrair dados do PDF: ${error.message || 'Erro desconhecido'}`);
  }
};

/**
 * Limpa o cache de requisições
 */
export const clearCache = () => {
  requestCache.clear();
  console.log('Cache de requisições limpo.');
};

/**
 * Retorna o status do cache
 */
export const getCacheStatus = () => {
  cleanCache();
  return {
    size: requestCache.size,
    entries: Array.from(requestCache.keys())
  };
};