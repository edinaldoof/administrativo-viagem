// src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';
import { formatCPF, formatCurrency } from './utils';

const COLORS = {
  PRIMARY: '#0cd73bff', // Removido 'ff' extra para compatibilidade
  SECONDARY: '#10B981',
  DARK_TEXT: '#1F2937',
  MEDIUM_TEXT: '#6B7280',
  LIGHT_GRAY_BORDER: '#E5E7EB',
  BACKGROUND_SECTION: '#F9FAFB',
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  GREEN: '#10B981',
};

const FONTS = {
  DEFAULT: 'helvetica', // Usar minúsculo para melhor compatibilidade
};

const PAGE_MARGIN = 15;
const GRADIENT_WIDTH = 3;
const FOOTER_HEIGHT = 20;
const HEADER_HEIGHT_FIRST_PAGE = 40;
const HEADER_HEIGHT_OTHER_PAGES = 25;

const FOOTER_TEXT_CONTENT = "FUNDAÇÃO CULTURAL E DE FOMENTO À PESQUISA, ENSINO, EXTENSÃO E INOVAÇÃO\nRua Hugo Napoleão, 2891 - Ininga - Teresina/PI - CEP 64048-440 - CNPJ: 07.501.328/0001-30";
const LOGO_URL = '/logo.png';

// Função auxiliar para converter cor hex para RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const drawSideGradient = (doc, pageHeight) => {
  const steps = 20; // Reduzido para melhor performance e compatibilidade
  const initialColor = hexToRgb('#4F46E5'); // Indigo-600
  const finalColor = hexToRgb('#10B981'); // Emerald-500

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const r = Math.round(initialColor.r + (finalColor.r - initialColor.r) * ratio);
    const g = Math.round(initialColor.g + (finalColor.g - initialColor.g) * ratio);
    const b = Math.round(initialColor.b + (finalColor.b - initialColor.b) * ratio);
    
    doc.setFillColor(r, g, b);
    const stepHeight = pageHeight / steps;
    doc.rect(0, stepHeight * i, GRADIENT_WIDTH, stepHeight + 0.1, 'F'); // Pequena sobreposição para evitar gaps
  }
};

const addHeaderFooter = (doc, pageNumber, totalPages, logoImgData, isFirstPage) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Desenhar gradiente lateral
  drawSideGradient(doc, pageHeight);

  // Header
  if (isFirstPage && logoImgData) {
    try {
      const imgProps = doc.getImageProperties(logoImgData);
      const aspectRatio = imgProps.width / imgProps.height;
      const logoDisplayHeight = 13;
      const logoDisplayWidth = logoDisplayHeight * aspectRatio; // Proporção real da imagem
      const logoX = (pageWidth - logoDisplayWidth) / 2;
      const logoY = 12;
      
      doc.addImage(logoImgData, imgProps.fileType || 'PNG', logoX, logoY, logoDisplayWidth, logoDisplayHeight);
      
      // Linha separadora
      const lineY = logoY + logoDisplayHeight + 5;
      const rgb = hexToRgb(COLORS.LIGHT_GRAY_BORDER);
      doc.setDrawColor(rgb.r, rgb.g, rgb.b);
      doc.setLineWidth(0.5);
      const lineLength = pageWidth * 0.8;
      const lineXStart = (pageWidth - lineLength) / 2;
      doc.line(lineXStart, lineY, lineXStart + lineLength, lineY);
    } catch (e) {
      console.error("Erro ao adicionar logo (primeira página):", e);
    }
  } else if (!isFirstPage) {
    if (logoImgData) {
      try {
        const imgProps = doc.getImageProperties(logoImgData);
        const aspectRatio = imgProps.width / imgProps.height;
        const logoDisplayHeight = 5;
        const logoDisplayWidth = logoDisplayHeight * aspectRatio; // Proporção real da imagem
        doc.addImage(logoImgData, imgProps.fileType || 'PNG', GRADIENT_WIDTH + PAGE_MARGIN, 10, logoDisplayWidth, logoDisplayHeight);
      } catch (e) {
        console.error("Erro ao adicionar logo (outras páginas):", e);
      }
    }
    
    doc.setFont(FONTS.DEFAULT, 'bold');
    doc.setFontSize(10);
    const rgb = hexToRgb(COLORS.DARK_TEXT);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text('Solicitação de Passagens', pageWidth - PAGE_MARGIN, 13, { align: 'right' });
  }

  // Footer
  const footerStartY = pageHeight - FOOTER_HEIGHT - 5;
  
  // Linha do footer
  const borderRgb = hexToRgb(COLORS.LIGHT_GRAY_BORDER);
  doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
  doc.setLineWidth(0.3);
  doc.line(GRADIENT_WIDTH, footerStartY, pageWidth, footerStartY);
  
  // Texto do footer
  doc.setFont(FONTS.DEFAULT, 'normal');
  doc.setFontSize(7);
  const mediumRgb = hexToRgb(COLORS.MEDIUM_TEXT);
  doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
  
  const footerLines = FOOTER_TEXT_CONTENT.split('\n');
  let footerTextY = footerStartY + 6;
  footerLines.forEach(line => {
    doc.text(line, pageWidth / 2, footerTextY, { align: 'center' });
    footerTextY += 3.5;
  });
  
  // Número da página
  doc.setFontSize(8);
  doc.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - PAGE_MARGIN, footerStartY + 8, { align: 'right' });
};

const addSectionTitle = (doc, title, yPos) => {
  doc.setFont(FONTS.DEFAULT, 'bold');
  doc.setFontSize(14);
  const darkRgb = hexToRgb(COLORS.DARK_TEXT);
  doc.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
  doc.text(title, GRADIENT_WIDTH + PAGE_MARGIN, yPos);
  
  yPos += 2;
  const primaryRgb = hexToRgb(COLORS.PRIMARY);
  doc.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.setLineWidth(0.7);
  doc.line(GRADIENT_WIDTH + PAGE_MARGIN, yPos, GRADIENT_WIDTH + PAGE_MARGIN + 15, yPos);
  
  return yPos + 8;
};

const addAttachmentPage = async (doc, passageiro, anexo, logoImgData) => {
  doc.addPage();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN;

  // Título do anexo
  doc.setFont(FONTS.DEFAULT, 'bold');
  doc.setFontSize(16);
  const darkRgb = hexToRgb(COLORS.DARK_TEXT);
  doc.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
  doc.text('ANEXO', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  
  // Informações do anexo
  doc.setFont(FONTS.DEFAULT, 'normal');
  doc.setFontSize(10);
  const mediumRgb = hexToRgb(COLORS.MEDIUM_TEXT);
  doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
  doc.text(`Passageiro: ${passageiro.nome}`, GRADIENT_WIDTH + PAGE_MARGIN, yPos);
  yPos += 6;
  doc.text(`Arquivo: ${anexo.name}`, GRADIENT_WIDTH + PAGE_MARGIN, yPos);
  yPos += 6;
  doc.text(`Tipo: ${anexo.type} | Tamanho: ${(anexo.size / 1024).toFixed(2)} KB`, GRADIENT_WIDTH + PAGE_MARGIN, yPos);
  yPos += 15;

  // Área do anexo
  const attachmentAreaX = GRADIENT_WIDTH + PAGE_MARGIN;
  const attachmentAreaY = yPos;
  const attachmentAreaWidth = pageWidth - (GRADIENT_WIDTH + PAGE_MARGIN * 2);
  const attachmentAreaHeight = pageHeight - yPos - FOOTER_HEIGHT - PAGE_MARGIN - 10;
  
  const borderRgb = hexToRgb(COLORS.LIGHT_GRAY_BORDER);
  doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
  doc.setLineWidth(0.3);
  doc.rect(attachmentAreaX, attachmentAreaY, attachmentAreaWidth, attachmentAreaHeight, 'S');

  if (anexo.type && anexo.type.startsWith('image/')) {
    try {
      const imageDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(anexo);
      });
      
      // Obter propriedades da imagem para manter proporção
      const imgProps = doc.getImageProperties(imageDataUrl);
      const originalWidth = imgProps.width;
      const originalHeight = imgProps.height;
      const aspectRatio = originalWidth / originalHeight;
      
      // Calcular dimensões mantendo a proporção
      const maxWidth = attachmentAreaWidth - 10;
      const maxHeight = attachmentAreaHeight - 10;
      
      let imgWidth = originalWidth;
      let imgHeight = originalHeight;
      
      // Ajustar ao tamanho máximo mantendo proporção
      if (imgWidth > maxWidth) {
        imgWidth = maxWidth;
        imgHeight = imgWidth / aspectRatio;
      }
      
      if (imgHeight > maxHeight) {
        imgHeight = maxHeight;
        imgWidth = imgHeight * aspectRatio;
      }
      
      // Centralizar imagem
      const imgX = attachmentAreaX + (attachmentAreaWidth - imgWidth) / 2;
      const imgY = attachmentAreaY + (attachmentAreaHeight - imgHeight) / 2;
      
      // Detectar tipo de imagem correto
      const imageType = imgProps.fileType || 'JPEG';
      doc.addImage(imageDataUrl, imageType, imgX, imgY, imgWidth, imgHeight);
    } catch (error) {
      console.error("Erro ao adicionar imagem anexa:", error);
      doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
      doc.setFontSize(12);
      doc.text('Erro ao carregar imagem.', attachmentAreaX + 10, attachmentAreaY + 20);
    }
  } else {
    // Placeholder para outros tipos de arquivo
    doc.setFont(FONTS.DEFAULT, 'bold');
    doc.setFontSize(40);
    const lightRgb = hexToRgb(COLORS.LIGHT_GRAY_BORDER);
    doc.setTextColor(lightRgb.r, lightRgb.g, lightRgb.b);
    
    let fileTypeLabel = "ARQUIVO";
    if (anexo.name) {
      const parts = anexo.name.split('.');
      if (parts.length > 1) {
        const extension = parts[parts.length - 1].toUpperCase();
        if (extension.length <= 4) {
          fileTypeLabel = extension;
        }
      }
    }
    
    const centerX = attachmentAreaX + (attachmentAreaWidth / 2);
    const centerY = attachmentAreaY + (attachmentAreaHeight / 2);
    
    doc.text(fileTypeLabel, centerX, centerY, { align: 'center' });
    
    doc.setFont(FONTS.DEFAULT, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
    doc.text('Documento Anexado', centerX, centerY + 20, { align: 'center' });
    doc.text('(Conteúdo em arquivo separado)', centerX, centerY + 30, { align: 'center' });
  }
};

async function loadImageData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => {
        console.error(`Erro ao ler imagem ${url}`);
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Erro ao carregar imagem:', url, error);
    return null;
  }
}

function drawDirectionalIcon(doc, x, y, size, color, isReturn = false) {
  const rgb = hexToRgb(color);
  doc.setTextColor(rgb.r, rgb.g, rgb.b);
  doc.setFont(FONTS.DEFAULT, 'normal');
  doc.setFontSize(size);
  
  // Usar seta Unicode compatível
  const arrow = isReturn ? '<' : '>';
  doc.text(arrow, x, y);
}

export const generateSolicitacaoPDF = async (passageiros, faturamento) => {
  // Configuração inicial do PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true // Ativar compressão para melhor compatibilidade
  });
  
  // Configurar metadata do PDF
  doc.setProperties({
    title: 'Solicitação de Passagens FADEX',
    subject: 'Requisição de Passagens',
    author: 'Sistema FADEX',
    keywords: 'passagens, requisição, fadex',
    creator: 'FADEX System'
  });

  let logoImgData = null;
  try {
    logoImgData = await loadImageData(LOGO_URL);
  } catch(e) {
    console.error("Falha ao carregar logo:", e);
  }

  let yPosition = HEADER_HEIGHT_FIRST_PAGE + 10;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentMarginBottomForPageBreak = FOOTER_HEIGHT + PAGE_MARGIN + 10;

  const checkAndAddPage = (neededHeight = 20) => {
    if (yPosition + neededHeight > pageHeight - contentMarginBottomForPageBreak) {
      doc.addPage();
      yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN;
      return true;
    }
    return false;
  };

  // Título principal
  doc.setFont(FONTS.DEFAULT, 'bold');
  doc.setFontSize(18);
  const darkRgb = hexToRgb(COLORS.DARK_TEXT);
  doc.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
  doc.text('Solicitação de Passagens', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  
  // Data de emissão
  doc.setFont(FONTS.DEFAULT, 'normal');
  doc.setFontSize(10);
  const mediumRgb = hexToRgb(COLORS.MEDIUM_TEXT);
  doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  doc.text(`Data da Emissão: ${dataEmissao}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 12;

  // Calcular total geral
  const totalGeral = passageiros.reduce((totalReq, passageiro) => {
    const totalPassageiro = (passageiro.itinerarios || []).reduce((totalIt, it) => {
      const quantidade = parseFloat(it.quantidade) || 0;
      const valorUnitario = parseFloat(it.valorUnitario) || 0;
      return totalIt + (quantidade * valorUnitario);
    }, 0);
    return totalReq + totalPassageiro;
  }, 0);
  
  // Seção de Faturamento
  if (faturamento && (faturamento.contaProjeto || faturamento.descricao || faturamento.costCenter || faturamento.webId)) {
    if (checkAndAddPage(30)) yPosition += 10;
    yPosition = addSectionTitle(doc, 'Informações de Faturamento', yPosition);
    
    const bgRgb = hexToRgb(COLORS.BACKGROUND_SECTION);
    doc.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
    
    const faturamentoStartX = GRADIENT_WIDTH + PAGE_MARGIN;
    const faturamentoStartY = yPosition;
    const faturamentoWidth = pageWidth - (GRADIENT_WIDTH + PAGE_MARGIN) * 2;
    
    // Preparar campos
    const fields = [];
    if (faturamento.contaProjeto) fields.push({ label: 'Número da Conta:', value: faturamento.contaProjeto });
    if (faturamento.descricao) fields.push({ label: 'Descrição:', value: faturamento.descricao });
    if (faturamento.costCenter) fields.push({ label: 'Conta corrente do projeto:', value: faturamento.costCenter });
    if (faturamento.webId) fields.push({ label: 'WEB ID:', value: faturamento.webId });
    if (faturamento.observacoes) fields.push({ label: 'Observações:', value: faturamento.observacoes });
    
    // Calcular altura necessária e renderizar
    let totalHeight = 5; // Start with padding
    fields.forEach(field => {
        const textLines = doc.splitTextToSize(field.value || '', faturamentoWidth - 10);
        totalHeight += 4 + (textLines.length * 4); // Label height + text height
    });
    totalHeight += 5; // Bottom padding

    // Desenhar background
    doc.rect(faturamentoStartX, faturamentoStartY, faturamentoWidth, totalHeight, 'F');
    
    let currentY = faturamentoStartY + 5; // Start inside the box with padding

    fields.forEach(field => {
      if (checkAndAddPage(15)) {
        currentY = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN;
      }
      
      const xPos = faturamentoStartX + 5;
      
      doc.setFont(FONTS.DEFAULT, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
      doc.text(field.label, xPos, currentY);
      
      currentY += 4; // Move down for the value

      doc.setFont(FONTS.DEFAULT, 'normal');
      doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
      const textLines = doc.splitTextToSize(field.value || '', faturamentoWidth - 10);
      doc.text(textLines, xPos, currentY);
      
      currentY += (textLines.length * 4) + 4; // Add space for next field
    });

    yPosition = faturamentoStartY + totalHeight + 5;
  }

  // Seção de Passageiros e Itinerários
  if (passageiros && passageiros.length > 0) {
    if (checkAndAddPage(30)) yPosition += 10;
    yPosition = addSectionTitle(doc, 'Passageiros e Itinerários', yPosition);

    passageiros.forEach((passageiro, index) => {
      const totalPassageiro = (passageiro.itinerarios || []).reduce((acc, it) => {
        const quantidade = parseFloat(it.quantidade) || 0;
        const valorUnitario = parseFloat(it.valorUnitario) || 0;
        return acc + (quantidade * valorUnitario);
      }, 0);

      const passengerCardHeight = 25 + (passageiro.itinerarios || []).length * 20;
      if (checkAndAddPage(passengerCardHeight)) {
        yPosition = addSectionTitle(doc, 'Passageiros e Itinerários (Continuação)', HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN);
      }

      const passengerCardStartX = GRADIENT_WIDTH + PAGE_MARGIN;
      const passengerCardStartY = yPosition;
      const cardWidth = pageWidth - (GRADIENT_WIDTH + PAGE_MARGIN) * 2;
      
      // Header do Card
      const headerHeight = passageiro.email ? 20 : 15;
      const bgRgb = hexToRgb(COLORS.BACKGROUND_SECTION);
      doc.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
      doc.rect(passengerCardStartX, passengerCardStartY, cardWidth, headerHeight, 'F');
      
      // Nome do passageiro
      doc.setFont(FONTS.DEFAULT, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
      doc.text(`${index + 1}. ${passageiro.nome}`, passengerCardStartX + 3, yPosition + 5);
      
      // CPF e Data de Nascimento
      let infoY = yPosition + 10;
      doc.setFont(FONTS.DEFAULT, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
      doc.text(`CPF: ${formatCPF(passageiro.cpf)} | Nasc: ${passageiro.dataNascimento}`, passengerCardStartX + 3, infoY);
      
      // Email do Passageiro (se existir)
      if (passageiro.email) {
        infoY += 5;
        doc.text(`Email: ${passageiro.email}`, passengerCardStartX + 3, infoY);
      }

      // Total do passageiro
      doc.setFont(FONTS.DEFAULT, 'bold');
      doc.setFontSize(10);
      const greenRgb = hexToRgb(COLORS.GREEN);
      doc.setTextColor(greenRgb.r, greenRgb.g, greenRgb.b);
      doc.text(formatCurrency(totalPassageiro), pageWidth - PAGE_MARGIN - 3, yPosition + 8, { align: 'right' });
      
      yPosition += headerHeight + 2;

      // Itinerários
      if (passageiro.itinerarios && passageiro.itinerarios.length > 0) {
        const primeiroItinerario = passageiro.itinerarios[0];
        
        passageiro.itinerarios.forEach((itinerario) => {
          if (checkAndAddPage(25)) {
            yPosition = HEADER_HEIGHT_OTHER_PAGES + PAGE_MARGIN;
            doc.setFont(FONTS.DEFAULT, 'italic');
            doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
            doc.setFontSize(9);
            doc.text(`Continuação - Itinerários para: ${passageiro.nome}`, GRADIENT_WIDTH + PAGE_MARGIN, yPosition);
            yPosition += 8;
          }
          
          const itinerarioStartX = passengerCardStartX + 3;
          doc.setFont(FONTS.DEFAULT, 'normal');
          doc.setFontSize(10);
          doc.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
          
          // Origem e Destino
          const originText = itinerario.origem || 'N/I';
          const destinationText = itinerario.destino || 'N/I';
          const isReturn = itinerario.origem === primeiroItinerario.destino && 
                          itinerario.destino === primeiroItinerario.origem;

          doc.text(originText, itinerarioStartX, yPosition + 4);
          const originWidth = doc.getTextWidth(originText);
          
          // Seta direcional
          const arrowX = itinerarioStartX + originWidth + 3;
          drawDirectionalIcon(doc, arrowX, yPosition + 4, 12, COLORS.PRIMARY, isReturn);
          
          const destinationX = arrowX + 6; // Ajustado para dar espaço ao caracter
          doc.text(destinationText, destinationX, yPosition + 4);
          
          // Valor do trecho
          const totalTrecho = (parseFloat(itinerario.quantidade) || 0) * (parseFloat(itinerario.valorUnitario) || 0);
          doc.setFont(FONTS.DEFAULT, 'bold');
          doc.text(formatCurrency(totalTrecho), pageWidth - PAGE_MARGIN - 3, yPosition + 4, { align: 'right' });
          
          yPosition += 6;
          
          // Detalhes do voo
          doc.setFont(FONTS.DEFAULT, 'normal');
          doc.setFontSize(8);
          doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
          
          let dataSaidaFormatada = 'N/A';
          if (itinerario.dataSaida) {
            try {
              const data = new Date(itinerario.dataSaida + 'T00:00:00');
              dataSaidaFormatada = data.toLocaleDateString('pt-BR');
            } catch (e) {
              dataSaidaFormatada = itinerario.dataSaida;
            }
          }
          
          doc.text(`Data: ${dataSaidaFormatada} | Cia: ${itinerario.ciaAerea || 'N/I'} | Voo: ${itinerario.voo || 'N/I'}`, 
                   itinerarioStartX, yPosition + 2);
          
          yPosition += 5;
          doc.text(`Tipo: ${itinerario.tripType || 'N/A'} | Bagagem: ${itinerario.baggage || 'N/A'}`, 
                   itinerarioStartX, yPosition + 2);
          
          yPosition += 8;
        });
      }
      
      yPosition += 5;
    });
  }

  // Total Geral
  if (totalGeral > 0) {
    if (checkAndAddPage(20)) yPosition += 5;
    
    // Linha separadora
    doc.setDrawColor(darkRgb.r, darkRgb.g, darkRgb.b);
    doc.setLineWidth(0.5);
    doc.line(GRADIENT_WIDTH + PAGE_MARGIN, yPosition, pageWidth - PAGE_MARGIN, yPosition);
    
    yPosition += 7;
    
    // Texto do total
    doc.setFont(FONTS.DEFAULT, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(darkRgb.r, darkRgb.g, darkRgb.b);
    doc.text('Total Geral da Requisição:', GRADIENT_WIDTH + PAGE_MARGIN, yPosition);
    
    // Valor total
    doc.setFont(FONTS.DEFAULT, 'bold');
    doc.setFontSize(16);
    const primaryRgb = hexToRgb(COLORS.PRIMARY);
    doc.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.text(formatCurrency(totalGeral), pageWidth - PAGE_MARGIN, yPosition, { align: 'right' });
    
    yPosition += 10;
  }

  // Observação sobre valores
  const observationText = "Observação: Os valores apresentados são sugestões do coordenador com base em pesquisas realizadas e estão sujeitos a alterações.";
  const maxTextWidth = pageWidth - (GRADIENT_WIDTH + PAGE_MARGIN) * 2;
  const observationLines = doc.splitTextToSize(observationText, maxTextWidth);
  const observationHeight = observationLines.length * 4 + 4;
  
  if (checkAndAddPage(observationHeight)) {
    yPosition += 5;
  }
  
  doc.setFont(FONTS.DEFAULT, 'italic');
  doc.setFontSize(8);
  doc.setTextColor(mediumRgb.r, mediumRgb.g, mediumRgb.b);
  doc.text(observationLines, GRADIENT_WIDTH + PAGE_MARGIN, yPosition);
  yPosition += observationHeight;

  // Processar anexos
  if (passageiros) {
    for (const passageiro of passageiros) {
      const anexos = passageiro.anexos || [];
      for (const anexo of anexos) {
        await addAttachmentPage(doc, passageiro, anexo, logoImgData);
      }
    }
  }

  // Adicionar header e footer em todas as páginas
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(doc, i, totalPages, logoImgData, i === 1);
  }

  // Salvar o PDF
  const fileName = `solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
