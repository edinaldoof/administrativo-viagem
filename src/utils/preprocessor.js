// src/utils/preprocessor.js

/**
 * Usa Regex para encontrar um valor único no texto com base em um padrão.
 * @param {string} text - O texto completo do PDF.
 * @param {RegExp} regex - A expressão regular para encontrar o dado.
 * @returns {string|null} - O valor encontrado ou null.
 */
const extractWithRegex = (text, regex) => {
    const match = text.match(regex);
    // Se encontrou, retorna o primeiro grupo de captura (o que está entre parênteses).
    return match ? match[1].trim() : null;
  };
  
  /**
   * Analisa o texto bruto de uma requisição e extrai dados estruturados usando Regex.
   * @param {string} text - O texto completo do PDF.
   * @returns {object} - Um objeto com os dados pré-processados.
   */
  export const preprocessText = (text) => {
    // Normaliza o texto para facilitar a busca (remove espaços múltiplos, etc.)
    const normalizedText = text.replace(/\s+/g, ' ').trim();
  
    const preprocessedData = {
      requisicao_numero: extractWithRegex(normalizedText, /Nº\.:\s*(\d+)/),
      data_emissao: extractWithRegex(normalizedText, /Data:\s*(\d{2}\/\d{2}\/\d{4})/),
      solicitante: extractWithRegex(normalizedText, /Solicitante:\s*([A-Z\s-]+)/),
      centro_custo: extractWithRegex(normalizedText, /Centro de Custo:\s*([A-Z\s-]+)/),
      total_geral_requisicao: extractWithRegex(normalizedText, /Total da Requisição\s*R\$\s*([\d.,]+)/)
    };
  
    // Filtra quaisquer valores nulos para não enviar chaves vazias para a IA
    Object.keys(preprocessedData).forEach(key => {
      if (preprocessedData[key] === null) {
        delete preprocessedData[key];
      }
    });
  
    return preprocessedData;
  };