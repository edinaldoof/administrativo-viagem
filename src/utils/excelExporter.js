// src/utils/excelExporter.js
import * as XLSX from 'xlsx';

/**
 * Exporta os dados dos passageiros e faturamento para um arquivo Excel.
 * @param {Array<object>} passageiros - A lista de passageiros.
 * @param {object} faturamento - As informações de faturamento.
 * @param {string} fileName - O nome do arquivo a ser salvo (sem extensão).
 */
export const exportDataToExcel = (passageiros, faturamento, fileName) => {
  if (!passageiros || passageiros.length === 0) {
    throw new Error('Não há passageiros para exportar.');
  }

  // Prepara os dados dos passageiros
  const passageirosData = passageiros.flatMap((p, index) => 
    p.itinerarios.map(it => ({
      '#': index + 1,
      'Nome Passageiro': p.nome,
      'CPF': p.cpf,
      'Data de Nascimento': p.dataNascimento,
      'Origem': it.origem,
      'Destino': it.destino,
      'Data Saída': it.dataSaida,
      'Cia Aérea': it.ciaAerea,
      'Voo': it.voo,
      'Horários': it.horarios,
    }))
  );
  
  const passageirosSheet = XLSX.utils.json_to_sheet(passageirosData);

  // Prepara os dados de faturamento
  const faturamentoData = [
    { 'Campo': 'Conta do Projeto', 'Valor': faturamento.contaProjeto },
    { 'Campo': 'Descrição', 'Valor': faturamento.descricao },
    { 'Campo': 'Centro de Custo (CC)', 'Valor': faturamento.cc },
    { 'Campo': 'WEB ID', 'Valor': faturamento.webId },
  ];
  const faturamentoSheet = XLSX.utils.json_to_sheet(faturamentoData, { skipHeader: true });

  // Cria o workbook e adiciona as planilhas
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, passageirosSheet, 'Passageiros e Itinerários');
  XLSX.utils.book_append_sheet(wb, faturamentoSheet, 'Faturamento');

  // Faz o download do arquivo
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};
