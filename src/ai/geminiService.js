import { GoogleGenerativeAI } from '@google/generative-ai';

// A chave da API é lida das variáveis de ambiente
const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

/**
 * Processa o texto de um PDF usando uma abordagem híbrida (Regex + IA).
 * @param {string} text - O conteúdo de texto bruto extraído do PDF.
 * @param {object} preprocessedData - Dados já extraídos via Regex para dar contexto à IA.
 * @returns {Promise<object>} - Uma promessa que resolve para o objeto JSON final.
 */
export const extractDataFromPdfWithGemini = async (text, preprocessedData = {}) => {
  if (!apiKey) {
    throw new Error('Erro de Configuração: A chave da API do Google não foi encontrada.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // ALTERAÇÃO: O prompt foi aprimorado para extrair mais detalhes relevantes.
  const prompt = `
    Você é um assistente especialista em extração de dados de "Requisições de Compra de Passagens".
    Sua tarefa é analisar o texto, validar os dados pré-extraídos e extrair informações adicionais, retornando um único objeto JSON.

    **Dados Pré-Extraídos (Gabarito):**
    Use estes dados como ponto de partida.
    \`\`\`json
    ${JSON.stringify(preprocessedData, null, 2)}
    \`\`\`

    **Sua Tarefa Detalhada:**
    1.  **Validar e Completar:** Confirme os dados do gabarito com o texto completo. Se algo estiver faltando, extraia do texto.
    2.  **Extrair Tabela de Itens:** Extraia a tabela de itens para o array "itens".
    3.  **Extrair Dados do Beneficiário:** Encontre a seção "DADOS DO BENEFICIÁRIO" e extraia os campos "NOME", "CPF" e "DATA DE NASCIMENTO" para um objeto aninhado chamado "dados_beneficiario".
    4.  **Extrair Dados da Viagem:** Encontre a seção "DADOS DA VIAGEM" e extraia "TIPO DA VIAGEM", "CIDADE DE ORIGEM", "CIDADE DE DESTINO", "DATA DE SAÍDA", "DATA DE RETORNO" e "BAGAGENS" para um objeto aninhado chamado "dados_viagem".
    5.  **Gerar JSON Final:** Combine todas as informações no formato JSON especificado abaixo.

    **Formato JSON de Saída Esperado:**
    {
      "requisicao_numero": "string",
      "data_emissao": "string",
      "centro_custo": "string",
      "solicitante": "string",
      "observacao": "string",
      "total_geral_requisicao": "string",
      "itens": [
        {
          "codigo": "string",
          "produto": "string",
          "unidade": "string",
          "quantidade": "string",
          "valor_unitario": "string",
          "valor_total": "string"
        }
      ],
      "dados_beneficiario": {
        "nome": "string",
        "cpf": "string",
        "data_nascimento": "string"
      },
      "dados_viagem": {
        "tipo_viagem": "string",
        "cidade_origem": "string",
        "cidade_destino": "string",
        "data_saida": "string",
        "data_retorno": "string",
        "bagagens": "string"
      }
    }

    Retorne **APENAS e SOMENTE** o objeto JSON final.

    **Texto Completo do Documento para Análise:**
    ---
    ${text}
    ---
  `;

  try {
    // A chamada para a API agora envia o prompt como uma única parte de texto.
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonText = response.text();
    
    // Limpeza para garantir que a resposta seja um JSON válido
    const cleanJson = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Erro ao processar com a API Gemini:', error);
    // Log detalhado para futuros problemas
    if (error.message.includes('API key not valid')) {
        throw new Error("Erro de Configuração: A chave da API é inválida. Por favor, contate o administrador do sistema.");
    }
    if (error instanceof SyntaxError) {
        throw new Error("A IA retornou uma resposta em um formato inesperado. Por favor, tente novamente ou com outro arquivo.");
    }
    throw new Error('Falha ao extrair dados do PDF com a IA.');
  }
};
