// src/utils/pngExporter.js
/**
 * Exporta um elemento HTML para uma imagem PNG.
 * @param {HTMLElement} element - O elemento HTML a ser capturado.
 * @param {string} fileName - O nome do arquivo para download.
 * @throws {Error} Se o elemento não for fornecido ou a exportação falhar.
 */
export const exportPreviewToPNG = async (element, fileName = 'solicitacao.png') => {
    if (!element) {
        throw new Error('Elemento para captura não foi fornecido.');
    }

    try {
        // Verifica se html2canvas está disponível globalmente
        // (deve ser importado no seu projeto e estar disponível em window ou ser importado diretamente aqui se for modular)
        if (window.html2canvas) {
            const canvas = await window.html2canvas(element, {
                backgroundColor: '#ffffff', // Fundo branco para a imagem
                scale: 2, // Aumenta a resolução da imagem para melhor qualidade
                useCORS: true, // Necessário se o preview carregar imagens de outras origens
                logging: false, // Desabilita logs do html2canvas no console
            });
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // A mensagem de sucesso será tratada pelo componente que chama esta função
        } else {
            // Fallback: Tenta usar a funcionalidade de impressão do navegador
            console.warn('html2canvas não encontrado. Usando fallback de impressão.');
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`<html><head><title>${fileName.replace('.png', '')}</title><style>body { font-family: Arial, sans-serif; padding: 20px; } img { max-width: 100%; } @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style></head><body><h3>Preview da Solicitação (para Impressão ou Salvar como PDF)</h3><hr><div>${element.innerHTML}</div></body></html>`);
            printWindow.document.close();
            // Adiciona um pequeno delay para garantir que o conteúdo foi carregado antes de imprimir
            setTimeout(() => {
                printWindow.print();
                // printWindow.close(); // Pode fechar automaticamente após a impressão, se desejado
            }, 500);
            // Lança um tipo de erro/status específico para o fallback, se necessário, para o chamador tratar a mensagem.
            // Por ora, consideramos que a ação de abrir a janela de impressão foi "bem-sucedida".
        }
    } catch (error) {
        console.error('Falha ao exportar para PNG:', error);
        throw new Error(`Falha ao gerar imagem PNG: ${error.message}`);
    }
};