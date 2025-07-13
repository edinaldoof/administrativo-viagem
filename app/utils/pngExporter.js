// src/utils/pngExporter.js
import html2canvas from 'html2canvas';

export const exportPreviewToPNG = async (element, fileName) => {
  if (!element) {
    throw new Error('Elemento de preview não encontrado para exportar para PNG.');
  }

  const canvas = await html2canvas(element, {
    scale: 2, // Aumenta a resolução para melhor qualidade
    useCORS: true, // Permite carregar imagens de outras origens, se houver
    backgroundColor: '#ffffff' // Define um fundo branco para evitar transparência
  });
  
  const image = canvas.toDataURL('image/png', 1.0); // Qualidade máxima

  // Cria um link temporário para download
  const link = document.createElement('a');
  link.href = image;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
