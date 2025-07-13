// src/utils/pngExporter.js
import html2canvas from 'html2canvas';

/**
 * Exporta um elemento DOM para um arquivo PNG.
 * @param {HTMLElement} element - O elemento DOM a ser capturado.
 * @param {string} fileName - O nome do arquivo a ser salvo (com extensão).
 */
export const exportPreviewToPNG = async (element, fileName) => {
  if (!element) {
    throw new Error('O elemento para exportação não foi encontrado.');
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Aumenta a resolução para melhor qualidade
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    
    const image = canvas.toDataURL('image/png', 1.0);
    
    // Cria um link temporário para fazer o download da imagem
    const link = document.createElement('a');
    link.href = image;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erro ao exportar para PNG:', error);
    throw new Error('Falha ao gerar o arquivo PNG. Verifique o console para mais detalhes.');
  }
};
