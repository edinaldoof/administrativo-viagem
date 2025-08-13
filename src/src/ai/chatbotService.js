
import { GoogleGenerativeAI } from '@google/generative-ai';

// A chave da API é lida das variáveis de ambiente
const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;

/**
 * Obtém uma resposta do chatbot de ajuda com base no histórico da conversa.
 * @param {Array<object>} chatHistory - O histórico da conversa, ex: [{ from: 'user', text: '...' }]
 * @returns {Promise<string>} - A resposta de texto gerada pela IA.
 */
export const getChatbotResponse = async (chatHistory) => {
  if (!apiKey) {
    console.error("Chave da API do Google não encontrada para o chatbot.");
    throw new Error("A chave da API não foi configurada.");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // O prompt ensina a IA sobre o sistema e seu papel
  const prompt = `
    Você é um chatbot de ajuda para um sistema de gestão de viagens chamado "Fadex Viagens". 
    Sua única função é responder perguntas sobre como usar o sistema. 
    Seja conciso, amigável e responda em português do Brasil.

    Funcionalidades do sistema que você pode explicar:
    - Cadastro de Passageiros: O usuário pode adicionar passageiros, informando nome, CPF e data de nascimento.
    - Gestão de Itinerários: Para cada passageiro, é possível adicionar múltiplos trechos de viagem (ida, volta, etc.).
    - Faturamento: Existe uma seção para preencher os dados de faturamento do projeto (conta, descrição, centro de custo).
    - Exportação: O sistema permite exportar os dados para PDF, PNG e Excel usando os botões no cabeçalho.
    - Importação de Requisições por PDF: Há um botão de "Importar" (ícone de nuvem com seta) no cabeçalho. Ao clicar, o usuário seleciona um arquivo PDF de uma requisição. A IA lê o arquivo, exibe os dados em uma tela de confirmação, e o usuário pode aprovar para preencher o formulário automaticamente.

    Histórico da Conversa Atual:
    ${chatHistory.map(msg => `${msg.from === 'bot' ? 'Assistente' : 'Usuário'}: ${msg.text}`).join('\n')}

    Responda a última pergunta do "Usuário". Se a pergunta não for sobre o sistema, gentilmente diga que você só pode ajudar com funcionalidades do Fadex Viagens.
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro ao contatar a API do Gemini para o chatbot:", error);
    return "Desculpe, ocorreu um erro ao tentar obter uma resposta. Tente novamente mais tarde.";
  }
};
