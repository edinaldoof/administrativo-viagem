// src/utils/excelExporter.js

// 1. A biblioteca é importada corretamente no topo do arquivo.
import * as XLSX from 'xlsx';
import { formatCPF, formatCurrency } from './utils'; // Garanta que suas funções de formatação estejam neste arquivo.

/**
 * Configurações de estilo para as planilhas Excel, mantendo seu template.
 */
const EXCEL_STYLES = {
    header: {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
        fill: { fgColor: { rgb: "4F46E5" } }, // Azul
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
            top: { style: "thin" }, bottom: { style: "thin" },
            left: { style: "thin" }, right: { style: "thin" }
        }
    },
    title: {
        font: { bold: true, sz: 16, color: { rgb: "1F2937" } },
        alignment: { horizontal: "center", vertical: "center" }
    },
    currency: {
        numFmt: '"R$" #,##0.00'
    },
    date: {
        numFmt: 'dd/mm/yyyy',
        alignment: { horizontal: "center" }
    },
    total: {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "D1FAE5" } }, // Verde claro
        alignment: { horizontal: "right" },
        numFmt: '"R$" #,##0.00'
    },
    totalLabel: {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "D1FAE5" } },
        alignment: { horizontal: "left" }
    }
};

/**
 * Calcula a largura ideal para cada coluna com base no conteúdo.
 * @param {Array<Array<any>>} data - A matriz de dados (incluindo o cabeçalho).
 * @returns {Array<{wch: number}>} - Um array de objetos de largura para o xlsx.
 */
const getAutoFitColumnWidths = (data) => {
    const objectMaxLength = [];
    data.forEach(row => {
        row.forEach((cell, i) => {
            let cellValue = cell ? String(cell) : '';
            if (typeof cell === 'object' && cell !== null && cell.v) {
                cellValue = String(cell.v);
            }
            if (typeof cell === 'object' && cell !== null && cell.z && cell.z.includes('R$')) {
                cellValue = formatCurrency(cell.v);
            }
            objectMaxLength[i] = Math.max(objectMaxLength[i] || 0, cellValue.length);
        });
    });
    // Adiciona um preenchimento extra para não ficar muito apertado
    return objectMaxLength.map(wch => ({ wch: wch + 2 }));
};

/**
 * Função principal que gera e baixa o arquivo Excel com a tabela unificada.
 */
export const exportDataToExcel = (passageiros, faturamento, fileName = 'solicitacao-viagem') => {
    if (!passageiros || passageiros.length === 0) {
        alert('Não há dados de passageiros para exportar.');
        throw new Error('Não há dados de passageiros para exportar.');
    }

    try {
        const header = [
            'Nome Completo', 'CPF', 'Data de Nascimento', 'Email', 'Telefone',
            'Origem', 'Destino', 'Data de Saída', 'Horário Ida', 'Data de Volta', 'Horário Volta',
            'Cia Aérea', 'Nº Voo',
            'Tipo Viagem', 'Bagagem', 'Anexos',
            'Qtd', 'Valor Unit.', 'Valor Total'
        ];
        
        const data = [header];
        
        passageiros.forEach(p => {
            const anexosNomes = (p.anexos || []).map(a => a.name).join('; ');

            if (p.itinerarios && p.itinerarios.length > 0) {
                p.itinerarios.forEach(it => {
                    const valorUnitario = parseFloat(it.valorUnitario) || 0;
                    const quantidade = parseInt(it.quantidade) || 1;
                    const totalValue = valorUnitario * quantidade;
                    const dataSaida = it.dataSaida ? new Date(it.dataSaida + 'T03:00:00Z') : null;
                    const dataVolta = it.dataVolta ? new Date(it.dataVolta + 'T03:00:00Z') : null;

                    data.push([
                        p.nome, p.cpf, p.dataNascimento, p.email, p.phone || '',
                        it.origem, it.destino, dataSaida, it.departureTime || '', dataVolta, it.returnTime || '',
                        it.ciaAerea || '', it.voo || '',
                        it.tripType || 'Aéreo', it.baggage || 'Não especificado', anexosNomes,
                        quantidade, valorUnitario, totalValue
                    ]);
                });
            } else {
                data.push([
                    p.nome, p.cpf, p.dataNascimento, p.email, p.phone || '',
                    '-', '-', null, '', null, '', '-', '-', '-', '-', anexosNomes, 0, 0, 0
                ]);
            }
        });

        const totalGeral = data.slice(1).reduce((acc, row) => acc + (row[18] || 0), 0);
        data.push([]); 
        data.push(['TOTAL GERAL', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', totalGeral]);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data, { cellDates: true });

        ws['!cols'] = getAutoFitColumnWidths(data);

        header.forEach((_, C) => {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
            if (ws[cellRef]) ws[cellRef].s = EXCEL_STYLES.header;
        });

        for (let R = 1; R < data.length - 2; ++R) {
            const dateCell = ws[XLSX.utils.encode_cell({ r: R, c: 7 })];
            if (dateCell && dateCell.v) dateCell.s = EXCEL_STYLES.date;

            const dateReturnCell = ws[XLSX.utils.encode_cell({ r: R, c: 9 })];
            if (dateReturnCell && dateReturnCell.v) dateReturnCell.s = EXCEL_STYLES.date;
            
            const cpfCell = ws[XLSX.utils.encode_cell({ r: R, c: 1 })];
            if (cpfCell && cpfCell.v) {
                cpfCell.t = 's';
                cpfCell.v = formatCPF(String(cpfCell.v));
            }
            const unitCell = ws[XLSX.utils.encode_cell({ r: R, c: 17 })];
            if (unitCell) unitCell.s = EXCEL_STYLES.currency;

            const totalCell = ws[XLSX.utils.encode_cell({ r: R, c: 18 })];
            if (totalCell) totalCell.s = EXCEL_STYLES.currency;
        }
        
        const totalRowIndex = data.length - 1;
        const totalValueCell = ws[XLSX.utils.encode_cell({ r: totalRowIndex, c: 18 })];
        if(totalValueCell) totalValueCell.s = EXCEL_STYLES.total;
        
        const totalLabelCell = ws[XLSX.utils.encode_cell({ r: totalRowIndex, c: 0 })];
        if(totalLabelCell) totalLabelCell.s = EXCEL_STYLES.totalLabel;

        wb.Props = {
            Title: "Relatório Detalhado de Solicitação de Viagens",
            Author: "Sistema Fadex Viagens",
            CreatedDate: new Date()
        };
        XLSX.utils.book_append_sheet(wb, ws, 'Relatório Detalhado');
        
        const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        XLSX.writeFile(wb, `${fileName}-${date}.xlsx`);
        
    } catch (error) {
        console.error('Erro ao exportar para Excel:', error);
        alert(`Falha ao gerar arquivo Excel: ${error.message}`);
    }
};

/**
 * Exporta os dados do painel de relatórios para Excel.
 */
export const exportReportsToExcel = (stats, allRequests, fileName = 'relatorio-gerencial-fadex') => {
    if (!allRequests || allRequests.length === 0) {
        throw new Error('Não há dados de requisições para exportar.');
    }
    try {
        const wb = XLSX.utils.book_new();
        wb.Props = {
            Title: "Relatório de Viagens - Fadex",
            Author: "Sistema Fadex Viagens",
            CreatedDate: new Date()
        };

        // --- Aba de Dashboard ---
        const dashboardData = [
            ['PAINEL DE RELATÓRIOS - FADEX VIAGENS'], [], [`Gerado em: ${new Date().toLocaleString('pt-BR')}`], [],
            ['INDICADORES PRINCIPAIS'], [],
            ['Métrica', 'Valor', 'Observações'],
            ['Total de Requisições', stats.totalRequests, 'Todas as requisições cadastradas'],
            ['Valor Total Processado', stats.totalValue, 'Soma de todos os trechos'],
            ['Total de Trechos', stats.totalTrips, 'Quantidade total de viagens'],
            ['Média por Requisição', stats.totalRequests > 0 ? stats.totalValue / stats.totalRequests : 0, 'Valor médio por requisição'],
            ['Média por Trecho', stats.totalTrips > 0 ? stats.totalValue / stats.totalTrips : 0, 'Valor médio por trecho'],
        ];
        const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);
        if (wsDashboard['A1']) wsDashboard['A1'].s = EXCEL_STYLES.title;
        if (wsDashboard['A5']) wsDashboard['A5'].s = EXCEL_STYLES.subHeader;
        if (wsDashboard['A7']) wsDashboard['A7'].s = EXCEL_STYLES.header;
        if (wsDashboard['B7']) wsDashboard['B7'].s = EXCEL_STYLES.header;
        if (wsDashboard['C7']) wsDashboard['C7'].s = EXCEL_STYLES.header;
        if (wsDashboard['B9']) { wsDashboard['B9'].t = 'n'; wsDashboard['B9'].v = stats.totalValue; wsDashboard['B9'].s = EXCEL_STYLES.currency; }
        if (wsDashboard['B11']) { wsDashboard['B11'].t = 'n'; wsDashboard['B11'].v = stats.totalRequests > 0 ? stats.totalValue / stats.totalRequests : 0; wsDashboard['B11'].s = EXCEL_STYLES.currency; }
        if (wsDashboard['B12']) { wsDashboard['B12'].t = 'n'; wsDashboard['B12'].v = stats.totalTrips > 0 ? stats.totalValue / stats.totalTrips : 0; wsDashboard['B12'].s = EXCEL_STYLES.currency; }
        wsDashboard['!cols'] = [{ wch: 30 }, { wch: 25 }, { wch: 40 }];
        wsDashboard['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
        XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard');

        // --- Aba de Dados Detalhados ---
        const headerDetailed = [
            'WEB ID', 'Data Requisição', 'Projeto', 'Descrição', 'Passageiro', 'CPF', 'Origem',
            'Destino', 'Data Saída', 'Horário Ida', 'Data Volta', 'Horário Volta', 'Cia Aérea', 'Voo',
            'Tipo Viagem', 'Bagagem',
            'Quantidade', 'Valor Unitário', 'Valor Total'
        ];
        const detailedData = [headerDetailed];
        allRequests.forEach(req => {
            const requestDate = req.savedAt?.toDate();
            (req.passengersData || []).forEach(p => {
                if (p.itinerarios && p.itinerarios.length > 0) {
                    p.itinerarios.forEach(it => {
                        detailedData.push([
                            req.webId || 'N/A', requestDate, req.contaProjeto || 'N/A', req.descricao || 'N/A',
                            p.nome || 'N/A', formatCPF(p.cpf) || 'N/A', it.origem || 'N/A', it.destino || 'N/A',
                            it.dataSaida ? new Date(it.dataSaida + 'T03:00:00Z') : null,
                            it.departureTime || '',
                            it.dataVolta ? new Date(it.dataVolta + 'T03:00:00Z') : null,
                            it.returnTime || '',
                            it.ciaAerea || 'N/A', it.voo || 'N/A', 
                            it.tripType || 'Aéreo',
                            it.baggage || 'Não especificado', it.quantidade || 1,
                            parseFloat(it.valorUnitario) || 0,
                            (parseFloat(it.quantidade) || 1) * (parseFloat(it.valorUnitario) || 0)
                        ]);
                    });
                }
            });
        });
        const wsDetailed = XLSX.utils.aoa_to_sheet(detailedData, { cellDates: true });
        wsDetailed['!cols'] = getAutoFitColumnWidths(detailedData);
        headerDetailed.forEach((_, C) => wsDetailed[XLSX.utils.encode_cell({r:0,c:C})].s = EXCEL_STYLES.header);
        for (let R = 1; R < detailedData.length; R++) {
            const dateReqCell = wsDetailed[XLSX.utils.encode_cell({r:R, c:1})];
            if(dateReqCell && dateReqCell.v) dateReqCell.s = EXCEL_STYLES.date;
            const dateSaiCell = wsDetailed[XLSX.utils.encode_cell({r:R, c:8})];
            if(dateSaiCell && dateSaiCell.v) dateSaiCell.s = EXCEL_STYLES.date;
            const dateVoltaCell = wsDetailed[XLSX.utils.encode_cell({r:R, c:10})];
            if(dateVoltaCell && dateVoltaCell.v) dateVoltaCell.s = EXCEL_STYLES.date;
            const valUnitCell = wsDetailed[XLSX.utils.encode_cell({r:R, c:17})];
            if(valUnitCell) valUnitCell.s = EXCEL_STYLES.currency;
            const valTotCell = wsDetailed[XLSX.utils.encode_cell({r:R, c:18})];
            if(valTotCell) valTotCell.s = EXCEL_STYLES.currency;
        }
        XLSX.utils.book_append_sheet(wb, wsDetailed, 'Dados Detalhados');

        const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        XLSX.writeFile(wb, `${fileName}-${date}.xlsx`);
    } catch (error) {
        console.error('Erro ao exportar relatórios:', error);
        throw new Error(`Falha ao gerar arquivo de relatório: ${error.message}`);
    }
};
