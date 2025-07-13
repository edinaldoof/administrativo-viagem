// src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';
import { formatCPF } from './utils'; //

const COLORS = {
  PRIMARY: '#c4ff00',
  DARK_TEXT: '#333333',
  MEDIUM_TEXT: '#555555',
  LIGHT_GRAY_BORDER: '#dddddd',
  BACKGROUND_SECTION: '#f7f7f7',
  WHITE: '#ffffff',
  FOOTER_BACKGROUND: '#2c2c2c',
  FOOTER_TEXT: '#e0e0e0',
  BLACK: '#000000',
}; //

const FONTS = {
  DEFAULT: 'Helvetica',
}; //

const PAGE_MARGIN = 15; //
const GRADIENT_WIDTH = 3; //
const FOOTER_HEIGHT = 20; //
const HEADER_HEIGHT_FIRST_PAGE = 40; //
const HEADER_HEIGHT_OTHER_PAGES = 25; //

const FOOTER_TEXT_CONTENT = " \nFUNDAÇÃO CULTURAL E DE FOMENTO À PESQUISA, ENSINO, EXTENSÃO E INOVAÇÃO\nRua Hugo Napoleão, 2891 - Ininga - Teresina/PI - CEP 64048-440 - CNPJ: 07.501.328/0001-30"; //
const LOGO_URL = '/logo.png'; //


const drawSideGradient = (doc, pageHeight) => {
  const steps = 50;
  const initialColor = { r: 51, g: 51, b: 51 };
  const finalColor = { r: 196, g: 255, b: 0 };

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(initialColor.r + (finalColor.r - initialColor.r) * ratio);
    const g = Math.round(initialColor.g + (finalColor.g - initialColor.g) * ratio);
    const b = Math.round(initialColor.b + (finalColor.b - initialColor.b) * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(0, (pageHeight / steps) * i, GRADIENT_WIDTH, pageHeight / steps + 0.5, 'F');
  }
}; //

const addHeaderFooter = (doc, pageNumber, totalPages, logoImgData, isFirstPage) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  drawSideGradient(doc, pageHeight);
  if (isFirstPage) {
    if (logoImgData) {
      try {
        const imgProps = doc.getImageProperties(logoImgData);
        const aspectRatio = imgProps.width / imgProps.height;
        const logoDisplayHeight = 13;
        const logoDisplayWidth = logoDisplayHeight * aspectRatio;
        const logoX = (pageWidth - logoDisplayWidth) / 1.95;
        const logoY = 12;
        doc.addImage(logoImgData, imgProps.fileType || 'PNG', logoX, logoY, logoDisplayWidth, logoDisplayHeight); //
        const lineY = logoY + logoDisplayHeight + 5;
        doc.setDrawColor(COLORS.BLACK); doc.setLineWidth(1.2);
        const lineLength = pageWidth * 0.8;
        const lineXStart = (pageWidth - lineLength) / 2;
        doc.line(lineXStart, lineY, lineXStart + lineLength, lineY); //
      } catch (e) { console.error("Erro ao adicionar logo (primeira página):", e); }
    }
  } else {
    if (logoImgData) {
      try {
        const imgProps = doc.getImageProperties(logoImgData);
        const aspectRatio = imgProps.width / imgProps.height;
        const logoDisplayHeight = 5;
        const logoDisplayWidth = logoDisplayHeight * aspectRatio;
        doc.addImage(logoImgData, imgProps.fileType || 'PNG', GRADIENT_WIDTH + PAGE_MARGIN, 10, logoDisplayWidth, logoDisplayHeight); //
      } catch (e) { console.error("Erro ao adicionar logo (outras páginas):", e); }
    }
    doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(10); doc.setTextColor(COLORS.DARK_TEXT);
    doc.text('Solicitação de Passagens Aéreas', pageWidth - PAGE_MARGIN, 13, { align: 'right' }); //
  }
  doc.setFillColor(COLORS.FOOTER_BACKGROUND);
  doc.rect(GRADIENT_WIDTH, pageHeight - FOOTER_HEIGHT - 5, pageWidth - GRADIENT_WIDTH, FOOTER_HEIGHT + 5, 'F'); //
  doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(7); doc.setTextColor(COLORS.FOOTER_TEXT);
  const footerLines = doc.splitTextToSize(FOOTER_TEXT_CONTENT, pageWidth - (GRADIENT_WIDTH + PAGE_MARGIN * 2)); //
  let footerTextY = pageHeight - FOOTER_HEIGHT + 2;
  footerLines.forEach(line => { doc.text(line, (pageWidth + GRADIENT_WIDTH) / 2, footerTextY, { align: 'center' }); footerTextY += 3.5; }); //
  doc.setFontSize(8); doc.setTextColor(COLORS.FOOTER_TEXT);
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - PAGE_MARGIN, pageHeight - FOOTER_HEIGHT + 8, { align: 'right' }); //
  doc.setDrawColor(COLORS.PRIMARY); doc.setLineWidth(0.3);
  doc.line(GRADIENT_WIDTH, pageHeight - FOOTER_HEIGHT - 5, pageWidth, pageHeight - FOOTER_HEIGHT - 5); //
};

const addSectionTitle = (doc, title, yPos) => {
  doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(14); doc.setTextColor(COLORS.DARK_TEXT);
  doc.text(title, GRADIENT_WIDTH + PAGE_MARGIN, yPos); //
  yPos += 6;
  doc.setDrawColor(COLORS.PRIMARY); doc.setLineWidth(0.5);
  doc.line(GRADIENT_WIDTH + PAGE_MARGIN, yPos, doc.internal.pageSize.getWidth() - PAGE_MARGIN, yPos); //
  return yPos + 8;
}; //

const addAttachmentPage = (doc, passageiro, anexo, logoImgData) => {
  doc.addPage();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN;
  doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(16); doc.setTextColor(COLORS.DARK_TEXT);
  doc.text('ANEXO', (pageWidth + GRADIENT_WIDTH) / 2, yPos, { align: 'center' }); //
  yPos += 10;
  doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(10); doc.setTextColor(COLORS.MEDIUM_TEXT);
  doc.text(`Passageiro: ${passageiro.nome}`, GRADIENT_WIDTH + PAGE_MARGIN, yPos); //
  yPos += 6;
  doc.text(`Arquivo: ${anexo.name}`, GRADIENT_WIDTH + PAGE_MARGIN, yPos); //
  yPos += 6;
  doc.text(`Tipo: ${anexo.type} | Tamanho: ${(anexo.size / 1024).toFixed(2)} KB`, GRADIENT_WIDTH + PAGE_MARGIN, yPos); //
  yPos += 15;
  const attachmentAreaX = GRADIENT_WIDTH + PAGE_MARGIN;
  const attachmentAreaY = yPos;
  const attachmentAreaWidth = pageWidth - (GRADIENT_WIDTH + PAGE_MARGIN * 2);
  const attachmentAreaHeight = pageHeight - yPos - FOOTER_HEIGHT - PAGE_MARGIN - 10;
  doc.setDrawColor(COLORS.LIGHT_GRAY_BORDER); doc.setLineWidth(0.3);
  doc.rect(attachmentAreaX, attachmentAreaY, attachmentAreaWidth, attachmentAreaHeight, 'S'); //
  return new Promise(async (resolve) => {
    if (anexo.type.startsWith('image/')) {
      try {
        const imageDataUrl = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target.result);
          reader.onerror = (err) => rej(err);
          reader.readAsDataURL(anexo);
        }); //
        const imgProps = doc.getImageProperties(imageDataUrl);
        let imgWidth = imgProps.width; let imgHeight = imgProps.height;
        const aspectRatio = imgWidth / imgHeight;
        if (imgWidth > attachmentAreaWidth) { imgWidth = attachmentAreaWidth; imgHeight = imgWidth / aspectRatio; }
        if (imgHeight > attachmentAreaHeight) { imgHeight = attachmentAreaHeight; imgWidth = imgHeight * aspectRatio; }
        const imgX = attachmentAreaX + (attachmentAreaWidth - imgWidth) / 2;
        const imgY = attachmentAreaY + (attachmentAreaHeight - imgHeight) / 2;
        doc.addImage(imageDataUrl, imgProps.fileType, imgX, imgY, imgWidth, imgHeight); //
      } catch (error) {
        console.error("Erro ao adicionar imagem anexa:", error);
        doc.setTextColor(COLORS.MEDIUM_TEXT); doc.setFontSize(12);
        doc.text('Erro ao carregar imagem.', attachmentAreaX + 10, attachmentAreaY + 20); //
      }
    } else if (anexo.type === 'application/pdf') {
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(40); doc.setTextColor(COLORS.PRIMARY);
      doc.text('PDF', attachmentAreaX + (attachmentAreaWidth / 2), attachmentAreaY + (attachmentAreaHeight / 2) - 10, { align: 'center' }); //
      doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(10); doc.setTextColor(COLORS.MEDIUM_TEXT);
      doc.text('Documento PDF Anexado', attachmentAreaX + (attachmentAreaWidth / 2), attachmentAreaY + (attachmentAreaHeight / 2) + 10, { align: 'center' }); //
      doc.text('(Conteúdo em arquivo separado)', attachmentAreaX + (attachmentAreaWidth / 2), attachmentAreaY + (attachmentAreaHeight / 2) + 20, { align: 'center' }); //
    } else {
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(40); doc.setTextColor(COLORS.MEDIUM_TEXT);
      let fileTypeLabel = "ARQUIVO";
      if (anexo.name) { const extension = anexo.name.split('.').pop().toUpperCase(); if (extension.length <= 4 && extension.length > 0) { fileTypeLabel = extension; }}
      doc.text(fileTypeLabel, attachmentAreaX + (attachmentAreaWidth / 2), attachmentAreaY + (attachmentAreaHeight / 2) -10, { align: 'center' }); //
      doc.setDrawColor(COLORS.MEDIUM_TEXT); doc.setLineWidth(0.5);
      const iconSize = 40; const iconX = attachmentAreaX + (attachmentAreaWidth / 2) - (iconSize / 2); const iconYBase = attachmentAreaY + (attachmentAreaHeight / 2) - (iconSize / 2) - 15;
      doc.rect(iconX, iconYBase, iconSize, iconSize * 1.2, 'S'); //
      doc.line(iconX + (iconSize*0.2), iconYBase + (iconSize*0.2), iconX + (iconSize*0.8), iconYBase + (iconSize*0.2) ); //
      doc.line(iconX + (iconSize*0.2), iconYBase + (iconSize*0.4), iconX + (iconSize*0.8), iconYBase + (iconSize*0.4) ); //
      doc.line(iconX + (iconSize*0.2), iconYBase + (iconSize*0.6), iconX + (iconSize*0.5), iconYBase + (iconSize*0.6) ); //
      doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(10); doc.setTextColor(COLORS.MEDIUM_TEXT);
      doc.text('Documento Anexado', attachmentAreaX + (attachmentAreaWidth / 2), attachmentAreaY + (attachmentAreaHeight / 2) + 25, { align: 'center' }); //
      doc.text('(Conteúdo em arquivo separado)', attachmentAreaX + (attachmentAreaWidth / 2), attachmentAreaY + (attachmentAreaHeight / 2) + 35, { align: 'center' }); //
    }
    resolve();
  });
}; //

async function loadImageData(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = (err) => { console.error(`Erro ao ler blob da imagem ${url}:`, err); reject(err); };
                reader.readAsDataURL(blob);
            });
        }
        // console.warn('Imagem não encontrada:', url); // Silenciado para não poluir se logo não for essencial
        return null;
    } catch (error) { console.error('Erro de rede ao carregar imagem:', url, error); return null; }
}

// Função para desenhar um pino de localização simples
function drawPinIcon(doc, centerX, visualCenterY, totalHeight, color) {
    const headRadius = totalHeight * 0.30;
    // Ajusta o Y da cabeça para que o centro visual do pino alinhe com visualCenterY
    const headCenterY = visualCenterY - (totalHeight * 0.5 - headRadius); // Centro da cabeça do pino
    const pointY = visualCenterY + totalHeight * 0.5;    // Ponta inferior do pino
    const neckWidthRatio = 0.35; // Largura do "pescoço" em relação à altura total

    doc.setFillColor(color);
    doc.setDrawColor(color);
    doc.setLineWidth(0.2);

    // Cabeça do pino
    doc.ellipse(centerX, headCenterY, headRadius, headRadius, 'FD');
    // Corpo/Ponta do pino (triângulo)
    doc.triangle(
        centerX - (totalHeight * neckWidthRatio / 2), headCenterY + headRadius * 0.7, // Ponto esquerdo da base do "pescoço"
        centerX + (totalHeight * neckWidthRatio / 2), headCenterY + headRadius * 0.7, // Ponto direito da base do "pescoço"
        centerX, pointY,                                      // Ponta inferior
        'FD'
    );
    // Opcional: Círculo branco no centro da cabeça para detalhe
    // doc.setFillColor(COLORS.WHITE); // Certifique-se que COLORS.WHITE está definido
    // doc.ellipse(centerX, headCenterY, headRadius * 0.4, headRadius * 0.4, 'FD');
}


// Função para desenhar uma seta simples para a direita
function drawRightArrowIcon(doc, tipX, tipY, size, color) { // tipY é o centro vertical da seta
    doc.setFillColor(color);
    doc.setDrawColor(color);
    doc.setLineWidth(0.3);
    doc.triangle(
        tipX - size, tipY - size * 0.4,  // Ponto traseiro superior
        tipX - size, tipY + size * 0.4,  // Ponto traseiro inferior
        tipX, tipY,                      // Ponta da seta
        'FD'
    );
}


export const generateSolicitacaoPDF = async (passageiros, faturamento) => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  let logoImgData = null;
  try {
      logoImgData = await loadImageData(LOGO_URL);
  } catch(e) { console.error("Falha ao carregar logo principal:", e)}

  let yPosition = HEADER_HEIGHT_FIRST_PAGE + 10;
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentMarginBottomForPageBreak = FOOTER_HEIGHT + PAGE_MARGIN + 10;

  const checkAndAddPage = (neededHeight = 20) => {
    if (yPosition + neededHeight > pageHeight - contentMarginBottomForPageBreak) {
      doc.addPage(); yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN; return true;
    }
    return false;
  }; //

  doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(18); doc.setTextColor(COLORS.DARK_TEXT);
  doc.text('Solicitação de Passagens Aéreas', (doc.internal.pageSize.getWidth() + GRADIENT_WIDTH) / 2 , yPosition, { align: 'center'}); //
  yPosition += doc.internal.getLineHeight() * 0.8;
  doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(10); doc.setTextColor(COLORS.MEDIUM_TEXT);
  doc.text(`Data da Emissão: ${new Date().toLocaleDateString('pt-BR')}`, (doc.internal.pageSize.getWidth() + GRADIENT_WIDTH) / 2, yPosition, { align: 'center' }); //
  yPosition += doc.internal.getLineHeight() * 1.5;

  if (passageiros && passageiros.length > 0) {
    if(checkAndAddPage(30)) yPosition += 10;
    yPosition = addSectionTitle(doc, 'Passageiros e Itinerários', yPosition); //

    passageiros.forEach((passageiro, index) => {
      if(checkAndAddPage(40)) {
         yPosition = addSectionTitle(doc, 'Passageiros e Itinerários (Continuação)', HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN); //
      }
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(11); doc.setTextColor(COLORS.DARK_TEXT);
      doc.text(`${index + 1}. ${passageiro.nome}`, GRADIENT_WIDTH + PAGE_MARGIN, yPosition); //
      yPosition += doc.internal.getLineHeight() * 0.8;
      doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(9); doc.setTextColor(COLORS.MEDIUM_TEXT);
      
      let infoLine = `CPF: ${formatCPF(passageiro.cpf)} | Nascimento: ${passageiro.dataNascimento}`;
      if (passageiro.email) infoLine += ` | Email: ${passageiro.email}`;
      if (passageiro.dataContato) infoLine += ` | Contato: ${passageiro.dataContato}`;

      doc.text(infoLine, GRADIENT_WIDTH + PAGE_MARGIN + 5, yPosition); //
      yPosition += doc.internal.getLineHeight() * 1.5;

      if (passageiro.itinerarios && passageiro.itinerarios.length > 0) {
        passageiro.itinerarios.forEach((itinerario) => {
            if(checkAndAddPage(30)) {
                 yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN;
                 doc.setFont(FONTS.DEFAULT, 'italic', 'normal'); doc.setTextColor(COLORS.MEDIUM_TEXT); doc.setFontSize(9);
                 doc.text(`Continuação Itinerários para: ${passageiro.nome}`, GRADIENT_WIDTH + PAGE_MARGIN, yPosition); //
                 yPosition += doc.internal.getLineHeight() * 1.2;
            }

            const MARGIN_LEFT_ITINERARIO_BASE = GRADIENT_WIDTH + PAGE_MARGIN + 5;
            const FONT_SIZE_TRECHO_PT = 10;
            const FONT_SIZE_DETALHES_PT = 8;
            const ICON_DRAW_COLOR = COLORS.DARK_TEXT;

            doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(FONT_SIZE_TRECHO_PT); doc.setTextColor(COLORS.DARK_TEXT);
            const currentLineHeight = doc.internal.getLineHeight();
            const textBaseY = yPosition;
            // Y para o centro visual dos ícones e da linha tracejada
            // Ajuste o fator 0.3 -> 0.4 ou 0.5 para descer mais, ou 0.2 para subir, conforme necessário
            const iconVisualCenterY = textBaseY - currentLineHeight * 0.4;
            const iconDrawHeight = 3; // mm - Altura total para os ícones desenhados
            const arrowSize = iconDrawHeight * 0.9; // Tamanho da seta (comprimento da base do triângulo)

            let currentX = MARGIN_LEFT_ITINERARIO_BASE;
            const spaceBetweenElements = 2; // mm

            // 1. Desenhar Pino de Localização
            const pinDrawWidth = iconDrawHeight * 0.7; // Largura efetiva do pino
            drawPinIcon(doc, currentX + pinDrawWidth / 2, iconVisualCenterY, iconDrawHeight, ICON_DRAW_COLOR);
            currentX += pinDrawWidth + spaceBetweenElements / 2;

            // 2. Texto Origem
            const origemText = itinerario.origem || 'N/Informada';
            doc.text(origemText, currentX, textBaseY);
            currentX += doc.getTextWidth(origemText) + spaceBetweenElements;

            // 3. Calcular posições do lado direito (Destino e Seta)
            const destinoText = itinerario.destino || 'N/Informado';
            const destinoTextWidth = doc.getTextWidth(destinoText);
            
            const pageContentEndX = doc.internal.pageSize.getWidth() - PAGE_MARGIN - GRADIENT_WIDTH;
            const destinoTextX = pageContentEndX - destinoTextWidth;
            // A ponta da seta estará antes do texto do destino
            const arrowTipX = destinoTextX - spaceBetweenElements;
            
            // 4. Linha Tracejada (do currentX até antes da base da seta)
            const arrowBaseX = arrowTipX - arrowSize; // X onde a base da seta começa
            const lineTracejadaEndX = arrowBaseX - spaceBetweenElements / 2;
            
            if (lineTracejadaEndX > currentX) { 
                doc.setLineDashPattern([1.5, 1], 0); 
                doc.setLineWidth(0.25);
                doc.setDrawColor(COLORS.MEDIUM_TEXT);
                doc.line(currentX, iconVisualCenterY, lineTracejadaEndX, iconVisualCenterY);
                doc.setLineDashPattern([], 0); 
            }

            // 5. Desenhar Seta (representando o avião)
            drawRightArrowIcon(doc, arrowTipX, iconVisualCenterY, arrowSize, ICON_DRAW_COLOR);

            // 6. Texto Destino
            doc.text(destinoText, destinoTextX, textBaseY);
            yPosition += currentLineHeight;
            
            // Detalhes do trecho
            doc.setFontSize(FONT_SIZE_DETALHES_PT);
            const currentLineHeightDetalhes = doc.internal.getLineHeight();
            doc.setTextColor(COLORS.MEDIUM_TEXT);
            // Indentação dos detalhes alinhada com o início do texto da origem (após o pino)
            const indentDetalhes = MARGIN_LEFT_ITINERARIO_BASE + pinDrawWidth + spaceBetweenElements / 2;
            const availableWidthForDetalhes = doc.internal.pageSize.getWidth() - indentDetalhes - PAGE_MARGIN - GRADIENT_WIDTH;
            let detalhes = [];
            const dataSaidaFormatada = itinerario.dataSaida ? new Date(itinerario.dataSaida + 'T00:00:00-03:00').toLocaleDateString('pt-BR') : 'N/A'; //
            if (dataSaidaFormatada !== 'N/A') detalhes.push(`Data: ${dataSaidaFormatada}`);
            if (itinerario.ciaAerea) detalhes.push(`Cia: ${itinerario.ciaAerea}`); //
            if (itinerario.voo) detalhes.push(`Voo: ${itinerario.voo}`); //
            if (itinerario.horarios) detalhes.push(`Horário: ${itinerario.horarios}`); //

            if (detalhes.length > 0) {
                const detalhesString = detalhes.join('  |  ');
                const splitDetalhes = doc.splitTextToSize(detalhesString, availableWidthForDetalhes);
                doc.text(splitDetalhes, indentDetalhes, yPosition);
                yPosition += splitDetalhes.length * currentLineHeightDetalhes;
            }
            yPosition += currentLineHeight * 0.4;
        });
      } else {
         doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(9); doc.setTextColor(COLORS.MEDIUM_TEXT);
         doc.text("  • Nenhum itinerário cadastrado.", MARGIN_LEFT_ITINERARIO_BASE, yPosition); //
         yPosition += doc.internal.getLineHeight();
      }
      yPosition += doc.internal.getLineHeight() * 0.8;
    });
  }

  // Seção de Faturamento (mantida como antes)
  if (faturamento.contaProjeto || faturamento.descricao || faturamento.cc || faturamento.webId) { //
    if(checkAndAddPage(40)) yPosition +=10;
    yPosition = addSectionTitle(doc, 'Informações de Faturamento', yPosition); //
    doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(9); doc.setTextColor(COLORS.MEDIUM_TEXT);
    const fieldIndent = GRADIENT_WIDTH + PAGE_MARGIN + 5;
    if (faturamento.contaProjeto) {
      if(checkAndAddPage(6)) yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN + 15;
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.text('Projeto:', GRADIENT_WIDTH + PAGE_MARGIN, yPosition); //
      doc.setFont(FONTS.DEFAULT, 'normal'); doc.text(faturamento.contaProjeto, fieldIndent + 15, yPosition); //
      yPosition += 6;
    }
    if (faturamento.descricao) {
      if(checkAndAddPage(6)) yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN + 15;
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.text('Descrição:', GRADIENT_WIDTH + PAGE_MARGIN, yPosition); //
      doc.setFont(FONTS.DEFAULT, 'normal'); doc.text(faturamento.descricao, fieldIndent + 15, yPosition); //
      yPosition += 6;
    }
    // ... (restante do faturamento mantido)
    if (faturamento.cc) { //
      if(checkAndAddPage(6)) yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN + 15;
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.text('CC:', GRADIENT_WIDTH + PAGE_MARGIN, yPosition); //
      doc.setFont(FONTS.DEFAULT, 'normal'); doc.text(faturamento.cc, fieldIndent + 15, yPosition); //
      yPosition += 6;
    }
    if (faturamento.webId) { //
      if(checkAndAddPage(6)) yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN + 15;
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.text('WEB ID:', GRADIENT_WIDTH + PAGE_MARGIN, yPosition); //
      doc.setFont(FONTS.DEFAULT, 'normal'); doc.text(faturamento.webId, fieldIndent + 15, yPosition); //
      yPosition += 6;
    }
  }

  // Seção de Anexos (mantida como antes)
  const attachmentPromises = [];
  if (passageiros) {
      for (const passageiro of passageiros) {
          const anexosDoPassageiro = passageiro.anexos || []; //
          for (const anexo of anexosDoPassageiro) {
              attachmentPromises.push(() => addAttachmentPage(doc, passageiro, anexo, logoImgData)); //
          }
      }
  }
  for (const promiseFn of attachmentPromises) { await promiseFn(); }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(doc, i, totalPages, logoImgData, i === 1); //
  }
  doc.save(`solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`); //
};
