// src/utils/excelExporter.js
import { utils, writeFile } from 'xlsx';

export const exportDataToExcel = (passageiros, faturamento, fileName) => {
    const wb = utils.book_new();

    // Planilha de Faturamento
    const faturamentoData = [
        ["Conta do Projeto", faturamento.contaProjeto || "N/A"],
        ["Descrição", faturamento.descricao || "N/A"],
        ["Centro de Custo (CC)", faturamento.cc || "N/A"],
        ["WEB ID", faturamento.webId || "N/A"],
    ];
    const wsFaturamento = utils.aoa_to_sheet(faturamentoData);
    utils.book_append_sheet(wb, wsFaturamento, "Faturamento");

    // Planilha de Passageiros e Itinerários
    const data = [];
    // Cabeçalho
    data.push([
        "Passageiro", 
        "CPF", 
        "Data de Nascimento", 
        "Origem", 
        "Destino", 
        "Data de Saída",
        "Cia Aérea",
        "Voo",
        "Horários",
        "Anexos"
    ]);

    // Dados
    passageiros.forEach(passageiro => {
        if (passageiro.itinerarios && passageiro.itinerarios.length > 0) {
            passageiro.itinerarios.forEach(itinerario => {
                data.push([
                    passageiro.nome,
                    passageiro.cpf,
                    passageiro.dataNascimento,
                    itinerario.origem,
                    itinerario.destino,
                    itinerario.dataSaida,
                    itinerario.ciaAerea,
                    itinerario.voo,
                    itinerario.horarios,
                    passageiro.anexos.map(a => a.name).join(', ')
                ]);
            });
        } else {
            // Adiciona o passageiro mesmo sem itinerário
            data.push([
                passageiro.nome,
                passageiro.cpf,
                passageiro.dataNascimento,
                "Nenhum", "Nenhum", "Nenhum", "", "", "",
                passageiro.anexos.map(a => a.name).join(', ')
            ]);
        }
    });

    const wsPassageiros = utils.aoa_to_sheet(data);
    utils.book_append_sheet(wb, wsPassageiros, "Passageiros e Itinerários");

    // Salva o arquivo
    writeFile(wb, `${fileName}.xlsx`);
};
