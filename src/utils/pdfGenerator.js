// src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';
import { formatCPF, formatCurrency } from './utils';

const COLORS = {
  PRIMARY: '#4F46E5', // Indigo-600 from Tailwind
  SECONDARY: '#10B981', // Emerald-500 from Tailwind
  DARK_TEXT: '#1F2937', // Gray-800
  MEDIUM_TEXT: '#6B7280', // Gray-500
  LIGHT_GRAY_BORDER: '#E5E7EB', // Gray-200
  BACKGROUND_SECTION: '#F9FAFB', // Gray-50
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GREEN: '#10B981', // Emerald-500
};

const FONTS = {
  DEFAULT: 'Helvetica',
};

const PAGE_MARGIN = 15;
const GRADIENT_WIDTH = 3;
const FOOTER_HEIGHT = 20;
const HEADER_HEIGHT_FIRST_PAGE = 40;
const HEADER_HEIGHT_OTHER_PAGES = 25;

const FOOTER_TEXT_CONTENT = "FUNDAÇÃO CULTURAL E DE FOMENTO À PESQUISA, ENSINO, EXTENSÃO E INOVAÇÃO\nRua Hugo Napoleão, 2891 - Ininga - Teresina/PI - CEP 64048-440 - CNPJ: 07.501.328/0001-30";
const LOGO_URL = '/logo.png';
const AIRPLANE_ICON_URL = '/aviao.png';


const drawSideGradient = (doc, pageHeight) => {
  const steps = 50;
  const initialColor = { r: 79, g: 70, b: 229 }; // Indigo-600
  const finalColor = { r: 16, g: 185, b: 129 }; // Emerald-500

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(initialColor.r + (finalColor.r - initialColor.r) * ratio);
    const g = Math.round(initialColor.g + (finalColor.g - initialColor.g) * ratio);
    const b = Math.round(initialColor.b + (finalColor.b - finalColor.b) * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(0, (pageHeight / steps) * i, GRADIENT_WIDTH, pageHeight / steps + 0.5, 'F');
  }
};

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
        doc.addImage(logoImgData, imgProps.fileType || 'PNG', logoX, logoY, logoDisplayWidth, logoDisplayHeight);
        const lineY = logoY + logoDisplayHeight + 5;
        doc.setDrawColor(COLORS.LIGHT_GRAY_BORDER);
        doc.setLineWidth(0.5);
        const lineLength = pageWidth * 0.8;
        const lineXStart = (pageWidth - lineLength) / 2;
        doc.line(lineXStart, lineY, lineXStart + lineLength, lineY);
      } catch (e) { console.error("Erro ao adicionar logo (primeira página):", e); }
    }
  } else {
    if (logoImgData) {
      try {
        const imgProps = doc.getImageProperties(logoImgData);
        const aspectRatio = imgProps.width / imgProps.height;
        const logoDisplayHeight = 5;
        const logoDisplayWidth = logoDisplayHeight * aspectRatio;
        doc.addImage(logoImgData, imgProps.fileType || 'PNG', GRADIENT_WIDTH + PAGE_MARGIN, 10, logoDisplayWidth, logoDisplayHeight);
      } catch (e) { console.error("Erro ao adicionar logo (outras páginas):", e); }
    }
    doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(10); doc.setTextColor(COLORS.DARK_TEXT);
    doc.text('Solicitação de Passagens', pageWidth - PAGE_MARGIN, 13, { align: 'right' });
  }

  // Footer
  const footerStartY = pageHeight - FOOTER_HEIGHT - 5;
  doc.setFillColor(COLORS.WHITE); // White background for footer text area
  doc.rect(GRADIENT_WIDTH, footerStartY, pageWidth - GRADIENT_WIDTH, FOOTER_HEIGHT + 5, 'F');
  
  doc.setDrawColor(COLORS.LIGHT_GRAY_BORDER);
  doc.setLineWidth(0.3);
  doc.line(GRADIENT_WIDTH, footerStartY, pageWidth, footerStartY);
  
  doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(7); doc.setTextColor(COLORS.MEDIUM_TEXT);
  const footerLines = doc.splitTextToSize(FOOTER_TEXT_CONTENT, pageWidth - (GRADIENT_WIDTH + PAGE_MARGIN * 2));
  let footerTextY = footerStartY + 6;
  footerLines.forEach(line => { doc.text(line, (pageWidth + GRADIENT_WIDTH) / 2, footerTextY, { align: 'center' }); footerTextY += 3.5; });
  doc.setFontSize(8); doc.setTextColor(COLORS.MEDIUM_TEXT);
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - PAGE_MARGIN, footerStartY + 8, { align: 'right' });
};

const addSectionTitle = (doc, title, yPos) => {
  doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(14); doc.setTextColor(COLORS.DARK_TEXT);
  doc.text(title, GRADIENT_WIDTH + PAGE_MARGIN, yPos);
  yPos += 2;
  doc.setDrawColor(COLORS.PRIMARY); doc.setLineWidth(0.7);
  doc.line(GRADIENT_WIDTH + PAGE_MARGIN, yPos, GRADIENT_WIDTH + PAGE_MARGIN + 15, yPos); // Shorter accent line
  return yPos + 8;
};

const addAttachmentPage = async (doc, passageiro, anexo, logoImgData) => {
  doc.addPage();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN;

  doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(16); doc.setTextColor(COLORS.DARK_TEXT);
  doc.text('ANEXO', (pageWidth + GRADIENT_WIDTH) / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(10); doc.setTextColor(COLORS.MEDIUM_TEXT);
  doc.text(`Passageiro: ${passageiro.nome}`, GRADIENT_WIDTH + PAGE_MARGIN, yPos);
  yPos += 6;
  doc.text(`Arquivo: ${anexo.name}`, GRADIENT_WIDTH + PAGE_MARGIN, yPos);
  yPos += 6;
  doc.text(`Tipo: ${anexo.type} | Tamanho: ${(anexo.size / 1024).toFixed(2)} KB`, GRADIENT_WIDTH + PAGE_MARGIN, yPos);
  yPos += 15;

  const attachmentAreaX = GRADIENT_WIDTH + PAGE_MARGIN;
  const attachmentAreaY = yPos;
  const attachmentAreaWidth = pageWidth - (GRADIENT_WIDTH + PAGE_MARGIN * 2);
  const attachmentAreaHeight = pageHeight - yPos - FOOTER_HEIGHT - PAGE_MARGIN - 10;
  
  doc.setDrawColor(COLORS.LIGHT_GRAY_BORDER);
  doc.setLineWidth(0.3);
  doc.rect(attachmentAreaX, attachmentAreaY, attachmentAreaWidth, attachmentAreaHeight, 'S');

  if (anexo.type.startsWith('image/')) {
    try {
      const imageDataUrl = await new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target.result);
        reader.onerror = (err) => rej(err);
        reader.readAsDataURL(anexo);
      });
      const imgProps = doc.getImageProperties(imageDataUrl);
      let imgWidth = imgProps.width; let imgHeight = imgProps.height;
      const aspectRatio = imgWidth / imgHeight;
      if (imgWidth > attachmentAreaWidth) { imgWidth = attachmentAreaWidth; imgHeight = imgWidth / aspectRatio; }
      if (imgHeight > attachmentAreaHeight) { imgHeight = attachmentAreaHeight; imgWidth = imgHeight * aspectRatio; }
      const imgX = attachmentAreaX + (attachmentAreaWidth - imgWidth) / 2;
      const imgY = attachmentAreaY + (attachmentAreaHeight - imgHeight) / 2;
      doc.addImage(imageDataUrl, imgProps.fileType, imgX, imgY, imgWidth, imgHeight);
    } catch (error) {
      console.error("Erro ao adicionar imagem anexa:", error);
      doc.setTextColor(COLORS.MEDIUM_TEXT); doc.setFontSize(12);
      doc.text('Erro ao carregar imagem.', attachmentAreaX + 10, attachmentAreaY + 20);
    }
  } else {
    doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(40); doc.setTextColor(COLORS.LIGHT_GRAY_BORDER);
    let fileTypeLabel = "ARQUIVO";
    if (anexo.name) { const extension = anexo.name.split('.').pop().toUpperCase(); if (extension.length <= 4 && extension.length > 0) { fileTypeLabel = extension; }}
    doc.text(fileTypeLabel, attachmentAreaX + (attachmentAreaWidth / 2), attachmentAreaY + (attachmentAreaHeight / 2), { align: 'center', baseline: 'middle' });
    
    doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(10); doc.setTextColor(COLORS.MEDIUM_TEXT);
    doc.text('Documento Anexado', attachmentAreaX + (attachmentAreaWidth / 2), attachmentAreaY + (attachmentAreaHeight / 2) + 20, { align: 'center' });
    doc.text('(Conteúdo em arquivo separado)', attachmentAreaX + (attachmentAreaWidth / 2), attachmentAreaY + (attachmentAreaHeight / 2) + 30, { align: 'center' });
  }
};

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
        return null;
    } catch (error) { console.error('Erro de rede ao carregar imagem:', url, error); return null; }
}


export const generateSolicitacaoPDF = async (passageiros, faturamento) => {
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const [logoImgData, airplaneIconData] = await Promise.all([
    loadImageData(LOGO_URL),
    loadImageData(AIRPLANE_ICON_URL)
  ]).catch(err => {
    console.error("Falha ao carregar uma das imagens para o PDF:", err);
    return [null, null];
  });


  let yPosition = HEADER_HEIGHT_FIRST_PAGE + 10;
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentMarginBottomForPageBreak = FOOTER_HEIGHT + PAGE_MARGIN + 10;

  const checkAndAddPage = (neededHeight = 20) => {
    if (yPosition + neededHeight > pageHeight - contentMarginBottomForPageBreak) {
      doc.addPage(); yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN; return true;
    }
    return false;
  };

  doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(18); doc.setTextColor(COLORS.DARK_TEXT);
  doc.text('Solicitação de Passagens', (doc.internal.pageSize.getWidth() + GRADIENT_WIDTH) / 2 , yPosition, { align: 'center'});
  yPosition += doc.internal.getLineHeight() * 0.8;
  doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(10); doc.setTextColor(COLORS.MEDIUM_TEXT);
  doc.text(`Data da Emissão: ${new Date().toLocaleDateString('pt-BR')}`, (doc.internal.pageSize.getWidth() + GRADIENT_WIDTH) / 2, yPosition, { align: 'center' });
  yPosition += doc.internal.getLineHeight() * 1.5;

  const totalGeral = passageiros.reduce((totalReq, passageiro) => {
    const totalPassageiro = (passageiro.itinerarios || []).reduce((totalIt, it) => {
        return totalIt + ((parseFloat(it.quantidade) || 0) * (parseFloat(it.valorUnitario) || 0));
    }, 0);
    return totalReq + totalPassageiro;
  }, 0);
  
  // Faturamento
  if (faturamento && (faturamento.contaProjeto || faturamento.descricao || faturamento.costCenter || faturamento.webId)) {
    if(checkAndAddPage(30)) yPosition += 10;
    yPosition = addSectionTitle(doc, 'Informações de Faturamento', yPosition);
    doc.setFillColor(COLORS.BACKGROUND_SECTION);
    const faturamentoStartX = GRADIENT_WIDTH + PAGE_MARGIN;
    const faturamentoStartY = yPosition;
    
    doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(9); doc.setTextColor(COLORS.MEDIUM_TEXT);
    
    const fields = [];
    if(faturamento.contaProjeto) fields.push({label: 'Projeto', value: faturamento.contaProjeto, fullWidth: true});
    if(faturamento.descricao) fields.push({label: 'Descrição', value: faturamento.descricao, fullWidth: true});
    if(faturamento.costCenter) fields.push({label: 'Conta corrente do projeto', value: faturamento.costCenter});
    if(faturamento.webId) fields.push({label: 'WEB ID', value: faturamento.webId});
    
    let faturamentoHeight = 10;
    fields.forEach(field => {
        if(field.fullWidth) {
           const splitText = doc.splitTextToSize(field.value, doc.internal.pageSize.getWidth() - faturamentoStartX * 2 - 10);
           faturamentoHeight += 4 + splitText.length * 4;
        } else {
           faturamentoHeight += 4;
        }
    });
    faturamentoHeight = Math.max(faturamentoHeight, 20);

    doc.rect(faturamentoStartX, faturamentoStartY, doc.internal.pageSize.getWidth() - faturamentoStartX * 2, faturamentoHeight, 'F');
    yPosition += 5;

    let col1Y = yPosition, col2Y = yPosition;
    fields.forEach((field, i) => {
        if(checkAndAddPage(10)) yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN;
        
        let currentY = field.fullWidth || i % 2 === 0 ? col1Y : col2Y;
        let currentX = field.fullWidth || i % 2 === 0 ? faturamentoStartX + 5 : doc.internal.pageSize.getWidth() / 2 + 5;
        
        doc.setFont(FONTS.DEFAULT, 'bold');
        doc.text(field.label, currentX, currentY);
        
        doc.setFont(FONTS.DEFAULT, 'normal');
        const textMaxWidth = field.fullWidth ? doc.internal.pageSize.getWidth() - faturamentoStartX * 2 - 10 : doc.internal.pageSize.getWidth() / 2 - faturamentoStartX;
        const splitText = doc.splitTextToSize(field.value, textMaxWidth);
        doc.text(splitText, currentX, currentY + 4);
        const textHeight = splitText.length * 4;
        
        if(field.fullWidth || i % 2 === 0) { col1Y += textHeight + 6; } else { col2Y += textHeight + 6; }
    });

    yPosition = Math.max(col1Y, col2Y) + 5;
  }

  if (passageiros && passageiros.length > 0) {
    if(checkAndAddPage(30)) yPosition += 10;
    yPosition = addSectionTitle(doc, 'Passageiros e Itinerários', yPosition);

    passageiros.forEach((passageiro, index) => {
      const totalPassageiro = (passageiro.itinerarios || []).reduce((acc, it) => acc + ((parseFloat(it.quantidade) || 0) * (parseFloat(it.valorUnitario) || 0)), 0);

      const passengerCardHeight = 20 + (passageiro.itinerarios || []).length * 20; // Increased height per itinerary
      if(checkAndAddPage(passengerCardHeight)) {
         yPosition = addSectionTitle(doc, 'Passageiros e Itinerários (Continuação)', HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN);
      }

      const passengerCardStartX = GRADIENT_WIDTH + PAGE_MARGIN;
      const passengerCardStartY = yPosition;
      
      // Header do Card do Passageiro
      doc.setFillColor(COLORS.BACKGROUND_SECTION);
      doc.rect(passengerCardStartX, passengerCardStartY, doc.internal.pageSize.getWidth() - passengerCardStartX * 2, 15, 'F');
      
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(11); doc.setTextColor(COLORS.DARK_TEXT);
      doc.text(`${index + 1}. ${passageiro.nome}`, passengerCardStartX + 3, yPosition + 5);
      doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(9); doc.setTextColor(COLORS.MEDIUM_TEXT);
      doc.text(`CPF: ${formatCPF(passageiro.cpf)} | Nasc: ${passageiro.dataNascimento}`, passengerCardStartX + 3, yPosition + 10);
      
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(10); doc.setTextColor(COLORS.GREEN);
      doc.text(formatCurrency(totalPassageiro), doc.internal.pageSize.getWidth() - PAGE_MARGIN - 3, yPosition + 8, { align: 'right' });
      
      yPosition += 17; // Pula o header do card

      // Itinerarios
      if (passageiro.itinerarios && passageiro.itinerarios.length > 0) {
        passageiro.itinerarios.forEach((itinerario) => {
            if(checkAndAddPage(25)) {
                 yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN;
                 doc.setFont(FONTS.DEFAULT, 'italic', 'normal'); doc.setTextColor(COLORS.MEDIUM_TEXT); doc.setFontSize(9);
                 doc.text(`Continuação Itinerários para: ${passageiro.nome}`, GRADIENT_WIDTH + PAGE_MARGIN, yPosition);
                 yPosition += doc.internal.getLineHeight() * 1.2;
            }
            
            const itinerarioStartX = passengerCardStartX + 3;
            doc.setFont(FONTS.DEFAULT, 'normal'); doc.setFontSize(10); doc.setTextColor(COLORS.DARK_TEXT);
            const textBaseY = yPosition + 4;
            
            const originText = itinerario.origem || 'N/I';
            const destinationText = itinerario.destino || 'N/I';

            // Draw origin
            doc.text(originText, itinerarioStartX, textBaseY, {baseline: 'middle'});

            // Draw icon
            const originWidth = doc.getTextWidth(originText);
            const iconX = itinerarioStartX + originWidth + 3;
            const iconSize = 4;
            if (airplaneIconData) {
              try {
                const imgProps = doc.getImageProperties(airplaneIconData);
                doc.addImage(airplaneIconData, imgProps.fileType, iconX, textBaseY - (iconSize/2), iconSize, iconSize);
              } catch(e) { console.error("Error adding airplane icon", e) }
            } else {
              const arrowSymbol = '\u2192'; // Fallback arrow
              doc.text(arrowSymbol, iconX, textBaseY, {baseline: 'middle'});
            }
            
            // Draw destination
            const destinationX = iconX + iconSize + 3;
            doc.text(destinationText, destinationX, textBaseY, {baseline: 'middle'});

            const totalTrecho = (parseFloat(itinerario.quantidade) || 0) * (parseFloat(itinerario.valorUnitario) || 0);
            doc.setFont(FONTS.DEFAULT, 'bold');
            doc.text(formatCurrency(totalTrecho), doc.internal.pageSize.getWidth() - PAGE_MARGIN - 3, textBaseY, { align: 'right', baseline: 'middle'});
            
            yPosition += 6;
            doc.setFontSize(8); doc.setTextColor(COLORS.MEDIUM_TEXT);
            const dataSaidaFormatada = itinerario.dataSaida ? new Date(itinerario.dataSaida + 'T00:00:00-03:00').toLocaleDateString('pt-BR') : 'N/A';
            doc.text(`Data: ${dataSaidaFormatada} | Cia: ${itinerario.ciaAerea || 'N/I'} | Voo: ${itinerario.voo || 'N/I'}`, itinerarioStartX, yPosition + 2, {baseline: 'middle'});

            yPosition += 5;
            doc.text(`Tipo: ${itinerario.tripType || 'N/A'} | Bagagem: ${itinerario.baggage || 'N/A'}`, itinerarioStartX, yPosition + 2, {baseline: 'middle'});

            yPosition += 8;
        });
      }
      yPosition += 5; // Espaço após cada passageiro
    });
  }

  // Total Geral
  if (totalGeral > 0) {
      if(checkAndAddPage(20)) yPosition = pageHeight - contentMarginBottomForPageBreak - 20;
      yPosition += 5;
      doc.setDrawColor(COLORS.DARK_TEXT); doc.setLineWidth(0.5);
      doc.line(GRADIENT_WIDTH + PAGE_MARGIN, yPosition, doc.internal.pageSize.getWidth() - PAGE_MARGIN, yPosition);
      yPosition += 7;
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(14); doc.setTextColor(COLORS.DARK_TEXT);
      doc.text(`Total Geral da Requisição:`, GRADIENT_WIDTH + PAGE_MARGIN, yPosition);
      doc.setFont(FONTS.DEFAULT, 'bold'); doc.setFontSize(16); doc.setTextColor(COLORS.PRIMARY);
      doc.text(formatCurrency(totalGeral), doc.internal.pageSize.getWidth() - PAGE_MARGIN, yPosition, {align: 'right'});
      yPosition += 10;
  }

  // Observação sobre os valores
  const observationText = "Observação: Os valores apresentados são sugestões do coordenador com base em pesquisas realizadas e estão sujeitos a alterações.";
  const splitObservation = doc.splitTextToSize(observationText, doc.internal.pageSize.getWidth() - (GRADIENT_WIDTH + PAGE_MARGIN) * 2);
  const observationHeight = splitObservation.length * 4 + 4; // Add some padding
  
  if (checkAndAddPage(observationHeight)) {
    yPosition = pageHeight - contentMarginBottomForPageBreak - observationHeight;
  }

  if (!checkAndAddPage(observationHeight)) {
     yPosition = pageHeight - contentMarginBottomForPageBreak - observationHeight;
  }
  
  doc.setFont(FONTS.DEFAULT, 'italic');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.MEDIUM_TEXT);
  doc.text(splitObservation, GRADIENT_WIDTH + PAGE_MARGIN, yPosition);


  const attachmentPromises = [];
  if (passageiros) {
      for (const passageiro of passageiros) {
          const anexosDoPassageiro = passageiro.anexos || [];
          for (const anexo of anexosDoPassageiro) {
              attachmentPromises.push(() => addAttachmentPage(doc, passageiro, anexo, logoImgData));
          }
      }
  }
  for (const promiseFn of attachmentPromises) { await promiseFn(); }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(doc, i, totalPages, logoImgData, i === 1);
  }
  doc.save(`solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
};
