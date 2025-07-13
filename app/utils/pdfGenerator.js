// src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatDateToDDMMYYYY } from '@/utils/utils.js';

export const generateSolicitacaoPDF = (passageiros, faturamento) => {
  const doc = new jsPDF();
  const currentDate = new Date().toLocaleDateString('pt-BR');

  // Cabeçalho
  doc.setFontSize(18);
  doc.text('Solicitação de Passagens Aéreas - Administrativo Fadex', 14, 22);
  doc.setFontSize(11);
  doc.text(`Data de Emissão: ${currentDate}`, 14, 30);

  // Informações de Faturamento
  if (faturamento && Object.values(faturamento).some(v => v)) {
    doc.setFontSize(14);
    doc.text('Informações de Faturamento', 14, 45);
    const billingYStart = 52;
    let billingY = billingYStart;
    const billingData = [
      ['Conta do Projeto', faturamento.contaProjeto],
      ['Descrição', faturamento.descricao],
      ['CC', faturamento.cc],
      ['WEB ID', faturamento.webId],
    ].filter(row => row[1]); // Filtra linhas sem valor

    doc.autoTable({
        startY: billingY,
        head: [['Campo', 'Valor']],
        body: billingData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
    });
  }

  let finalY = doc.lastAutoTable.finalY || 40;

  // Tabela de Passageiros e Itinerários
  if (passageiros && passageiros.length > 0) {
    doc.setFontSize(14);
    doc.text('Passageiros e Itinerários', 14, finalY + 15);
    
    const tableData = passageiros.flatMap(p => {
        const passageiroInfo = [
            { content: p.nome, colSpan: 6, styles: { fontStyle: 'bold', fillColor: '#d3d3d3' } }
        ];

        const itinerariosRows = p.itinerarios.map(it => [
            it.origem,
            it.destino,
            it.dataSaida ? new Date(it.dataSaida + 'T00:00:00-03:00').toLocaleDateString('pt-BR') : 'N/A',
            it.ciaAerea || 'N/A',
            it.voo || 'N/A',
            it.horarios || 'N/A',
        ]);
        
        return [passageiroInfo, ...itinerariosRows];
    });

    doc.autoTable({
      startY: finalY + 22,
      head: [['Origem', 'Destino', 'Data', 'Cia Aérea', 'Voo', 'Horários']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 },
    });
  }


  // Salva o PDF
  doc.save(`solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
};
