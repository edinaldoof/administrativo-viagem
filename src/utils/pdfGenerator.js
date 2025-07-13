// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Importa o plugin autoTable

/**
 * Gera um PDF com os detalhes da solicitação de viagem.
 * @param {Array<object>} passageiros - A lista de passageiros.
 * @param {object} faturamento - As informações de faturamento.
 */
export const generateSolicitacaoPDF = (passageiros, faturamento) => {
  if (!passageiros || passageiros.length === 0) {
    throw new Error('Não há passageiros para gerar o PDF.');
  }

  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('pt-BR');
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.text('Solicitação de Passagens Aéreas - Fadex', 105, yPos, { align: 'center' });
  yPos += 8;
  doc.setFontSize(10);
  doc.text(`Data de Emissão: ${currentDate}`, 105, yPos, { align: 'center' });
  yPos += 15;

  // Seção de Passageiros e Itinerários
  doc.setFontSize(14);
  doc.text('Passageiros e Itinerários', 14, yPos);
  yPos += 8;

  const tableData = passageiros.flatMap(p => 
    p.itinerarios.map(it => ([
      p.nome,
      p.cpf,
      `${it.origem} -> ${it.destino}`,
      it.dataSaida,
      it.ciaAerea || 'N/A'
    ]))
  );

  doc.autoTable({
    startY: yPos,
    head: [['Passageiro', 'CPF', 'Trecho', 'Data', 'Cia Aérea']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  yPos = doc.autoTable.previous.finalY + 15;

  // Seção de Faturamento
  doc.setFontSize(14);
  doc.text('Informações de Faturamento', 14, yPos);
  yPos += 8;
  doc.setFontSize(10);
  doc.text(`Conta do Projeto: ${faturamento.contaProjeto || 'Não informado'}`, 14, yPos);
  yPos += 6;
  doc.text(`Descrição: ${faturamento.descricao || 'Não informado'}`, 14, yPos);
  yPos += 6;
  doc.text(`Centro de Custo (CC): ${faturamento.cc || 'Não informado'}`, 14, yPos);
  yPos += 6;
  doc.text(`WEB ID: ${faturamento.webId || 'Não informado'}`, 14, yPos);

  // Salva o PDF
  const fileName = `solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
