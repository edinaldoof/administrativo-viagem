// src/utils/excelExporter.js
import { formatCPF, formatCurrency } from './utils'; // Ajuste o caminho se o seu utils.js estiver em outro local

/**
 * Exporta os dados dos passageiros e faturamento para um arquivo Excel (XLSX) ou CSV.
 * @param {Array} passageiros - Array de objetos de passageiros.
 * @param {Object} faturamento - Objeto com informações de faturamento.
 * @param {string} fileName - O nome base para o arquivo (sem extensão).
 * @throws {Error} Se não houver passageiros ou a exportação falhar.
 */
export const exportDataToExcel = (passageiros, faturamento, fileName = 'solicitacao') => {
    if (!passageiros || passageiros.length === 0) {
        throw new Error('Não há dados de passageiros para exportar.');
    }

    try {
        // Verifica se a biblioteca XLSX (SheetJS) está disponível globalmente
        if (window.XLSX) {
            const XLSX = window.XLSX;
            const dadosExcel = [];
            dadosExcel.push(['ADMINISTRATIVO FADEX - SOLICITAÇÃO DE PASSAGENS AÉREAS']);
            dadosExcel.push([`Data da Emissão: ${new Date().toLocaleDateString('pt-BR')}`]);
            dadosExcel.push([]); // Linha em branco
            dadosExcel.push(['Nome Completo', 'CPF', 'Data de Nascimento', 'Email', 'Data Contato', 'Origem', 'Destino', 'Data de Saída', 'Cia Aérea', 'Nº Voo', 'Horários Estimados', 'Anexos do Passageiro', 'Valor Unitário', 'Quantidade', 'Total Trecho']);

            passageiros.forEach(passageiro => {
                const anexosNomes = (passageiro.anexos && passageiro.anexos.length > 0)
                    ? passageiro.anexos.map(a => a.name).join('; ')
                    : '';

                if (passageiro.itinerarios && passageiro.itinerarios.length > 0) {
                    passageiro.itinerarios.forEach((itinerario, index) => {
                        const dataSaidaFormatada = itinerario.dataSaida ? new Date(itinerario.dataSaida + 'T00:00:00-03:00').toLocaleDateString('pt-BR') : 'N/A';
                        const valorUnitario = parseFloat(itinerario.valorUnitario) || 0;
                        const quantidade = parseInt(itinerario.quantidade) || 1;
                        const totalTrecho = valorUnitario * quantidade;

                        dadosExcel.push([
                            index === 0 ? passageiro.nome : '',
                            index === 0 ? formatCPF(passageiro.cpf) : '',
                            index === 0 ? passageiro.dataNascimento : '',
                            index === 0 ? passageiro.email : '',
                            index === 0 ? passageiro.contactDate : '',
                            itinerario.origem,
                            itinerario.destino,
                            dataSaidaFormatada,
                            itinerario.ciaAerea || '',
                            itinerario.voo || '',
                            itinerario.horarios || '',
                            index === 0 ? anexosNomes : '',
                            { t: 'n', v: valorUnitario, z: '"R$"#,##0.00' }, // Formato moeda
                            quantidade,
                            { t: 'n', v: totalTrecho, z: '"R$"#,##0.00' } // Formato moeda
                        ]);
                    });
                } else {
                    // Passageiro sem itinerários
                    dadosExcel.push([
                        passageiro.nome,
                        formatCPF(passageiro.cpf),
                        passageiro.dataNascimento,
                        passageiro.email,
                        passageiro.contactDate,
                        '-', '-', '-', '-', '-', '-', // Colunas de itinerário vazias
                        anexosNomes,
                         '', '', '' // Colunas de custo vazias
                    ]);
                }
            });

            if (faturamento.contaProjeto || faturamento.descricao || faturamento.cc || faturamento.webId) {
                dadosExcel.push([]); // Linha em branco
                dadosExcel.push(['INFORMAÇÕES DE FATURAMENTO']);
                if (faturamento.contaProjeto) dadosExcel.push(['Conta do Projeto:', faturamento.contaProjeto]);
                if (faturamento.descricao) dadosExcel.push(['Descrição:', faturamento.descricao]);
                if (faturamento.cc) dadosExcel.push(['CC:', faturamento.cc]);
                if (faturamento.webId) dadosExcel.push(['WEB ID:', faturamento.webId]);
            }

            const ws = XLSX.utils.aoa_to_sheet(dadosExcel);
            // Definir larguras das colunas (opcional, mas melhora a visualização)
            ws['!cols'] = [
                { wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 25 }, { wch: 15 },
                { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 20 }, { wch: 30 },
                { wch: 15 }, { wch: 12 }, { wch: 15 } // Colunas de custo
            ];

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Solicitação de Viagem');
            XLSX.writeFile(wb, `${fileName}.xlsx`);
        } else {
            // Fallback para CSV se XLSX (SheetJS) não estiver disponível
            console.warn('Biblioteca XLSX não encontrada. Usando fallback para CSV.');
            let csvContent = "data:text/csv;charset=utf-8,";
            // Adiciona BOM para melhor compatibilidade com Excel em alguns casos
            // csvContent += "\uFEFF"; 
            csvContent += "ADMINISTRATIVO FADEX - SOLICITAÇÃO DE PASSAGENS AÉREAS\n";
            csvContent += `Data da Emissão:,"${new Date().toLocaleDateString('pt-BR')}"\n\n`;
            csvContent += "Nome Completo,CPF,Data de Nascimento,Email,Data Contato,Origem,Destino,Data de Saída,Cia Aérea,Nº Voo,Horários Estimados,Anexos do Passageiro,Valor Unitario,Quantidade,Total Trecho\n";

            const escapeCSV = (field) => field ? `"${String(field).replace(/"/g, '""')}"` : '';

            passageiros.forEach(passageiro => {
                const anexosNomes = (passageiro.anexos && passageiro.anexos.length > 0)
                    ? passageiro.anexos.map(a => a.name).join('; ')
                    : '';
                if (passageiro.itinerarios && passageiro.itinerarios.length > 0) {
                    passageiro.itinerarios.forEach((itinerario, index) => {
                        const dataSaidaFormatada = itinerario.dataSaida ? new Date(itinerario.dataSaida + 'T00:00:00-03:00').toLocaleDateString('pt-BR') : 'N/A';
                        const valorUnitario = parseFloat(itinerario.valorUnitario) || 0;
                        const quantidade = parseInt(itinerario.quantidade) || 1;
                        const totalTrecho = valorUnitario * quantidade;

                        csvContent += `${index === 0 ? escapeCSV(passageiro.nome) : ''},${index === 0 ? escapeCSV(formatCPF(passageiro.cpf)) : ''},${index === 0 ? escapeCSV(passageiro.dataNascimento) : ''},${index === 0 ? escapeCSV(passageiro.email) : ''},${index === 0 ? escapeCSV(passageiro.contactDate) : ''},${escapeCSV(itinerario.origem)},${escapeCSV(itinerario.destino)},${escapeCSV(dataSaidaFormatada)},${escapeCSV(itinerario.ciaAerea)},${escapeCSV(itinerario.voo)},${escapeCSV(itinerario.horarios)},${index === 0 ? escapeCSV(anexosNomes) : ''},${escapeCSV(formatCurrency(valorUnitario))},${escapeCSV(quantidade)},${escapeCSV(formatCurrency(totalTrecho))}\n`;
                    });
                } else {
                    csvContent += `${escapeCSV(passageiro.nome)},${escapeCSV(formatCPF(passageiro.cpf))},${escapeCSV(passageiro.dataNascimento)},${escapeCSV(passageiro.email)},${escapeCSV(passageiro.contactDate)},"","","","","","","",${escapeCSV(anexosNomes)},"","",""\n`;
                }
            });

            if (faturamento.contaProjeto || faturamento.descricao || faturamento.cc || faturamento.webId) {
                csvContent += "\nINFORMAÇÕES DE FATURAMENTO\n";
                if (faturamento.contaProjeto) csvContent += `Conta do Projeto:,${escapeCSV(faturamento.contaProjeto)}\n`;
                if (faturamento.descricao) csvContent += `Descrição:,${escapeCSV(faturamento.descricao)}\n`;
                if (faturamento.cc) csvContent += `CC:,${escapeCSV(faturamento.cc)}\n`;
                if (faturamento.webId) csvContent += `WEB ID:,${escapeCSV(faturamento.webId)}\n`;
            }

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${fileName}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (error) {
        console.error('Falha ao exportar para Excel/CSV:', error);
        throw new Error(`Falha ao gerar arquivo Excel/CSV: ${error.message}`);
    }
};

/**
 * Exporta os dados do painel de relatórios para um arquivo Excel (XLSX).
 * @param {object} stats - Objeto contendo as estatísticas processadas.
 * @param {string} fileName - O nome base para o arquivo (sem extensão).
 */
export const exportReportsToExcel = (stats, fileName = 'relatorio-viagens-fadex') => {
    if (!window.XLSX) {
        throw new Error('A biblioteca XLSX não está disponível.');
    }

    const XLSX = window.XLSX;
    const wb = XLSX.utils.book_new();

    // --- Aba de Resumo ---
    const summaryData = [
        ['Painel de Relatórios - Fadex Viagens'],
        [`Data da Emissão: ${new Date().toLocaleDateString('pt-BR')}`],
        [],
        ['Métrica', 'Valor'],
        ['Total de Requisições', stats.totalRequests],
        ['Valor Total', { t: 'n', v: stats.totalValue, z: '"R$"#,##0.00' }],
        ['Total de Trechos de Viagem', stats.totalTrips],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

    // --- Aba de Destinos ---
    const topDestinationsData = [
        ['Destinos Mais Solicitados'],
        ['Destino', 'Nº de Solicitações'],
        ...stats.topDestinations.map(([dest, count]) => [dest, count])
    ];
    const wsDestinations = XLSX.utils.aoa_to_sheet(topDestinationsData);
    wsDestinations['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsDestinations, 'Top Destinos');

    // --- Aba de Projetos ---
    const requestsByProjectData = [
        ['Requisições por Projeto'],
        ['Projeto', 'Nº de Requisições'],
        ...stats.requestsByProject.map(([project, count]) => [project, count])
    ];
    const wsProjects = XLSX.utils.aoa_to_sheet(requestsByProjectData);
    wsProjects['!cols'] = [{ wch: 40 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsProjects, 'Reqs por Projeto');

    // --- Aba de Passageiros ---
    const topPassengersData = [
        ['Passageiros Mais Frequentes'],
        ['Passageiro', 'Nº de Trechos'],
        ...stats.topPassengers.map(([name, count]) => [name, count])
    ];
    const wsPassengers = XLSX.utils.aoa_to_sheet(topPassengersData);
    wsPassengers['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsPassengers, 'Top Passageiros');

    // Escreve o arquivo final
    XLSX.writeFile(wb, `${fileName}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`);
};
