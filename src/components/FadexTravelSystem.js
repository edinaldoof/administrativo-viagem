// src/components/FadexTravelSystem.js
import React, { useState, useRef } from 'react';

// Importar Componentes Filhos
import Header from './Header'; //
import SuccessMessage from './SuccessMessage'; //
import AddPassengerButton from './AddPassengerButton'; //
import PassengerForm from './PassengerForm'; //
import BillingForm from './BillingForm'; //
import PassengerList from './PassengerList'; //
import Preview from './Preview'; //

// Importar Utilitários e Validadores
import {
  generateId, //
  formatCPF, //
  validarCPF, //
  validarDataNascimento, //
  validarDataViagem //
} from '../utils/utils.js'; //

// Importar Gerador de PDF
import { generateSolicitacaoPDF } from '../utils/pdfGenerator.js'; //

const FadexTravelSystem = () => {
  const [passageiros, setPassageiros] = useState([]);
  const [faturamento, setFaturamento] = useState({
    contaProjeto: '',
    descricao: '',
    cc: '',
    webId: ''
  });
  const [activeForm, setActiveForm] = useState(null);
  const [editingPassageiro, setEditingPassageiro] = useState(null);

  const initialPassageiroState = {
    id: '',
    nome: '',
    cpf: '',
    dataNascimento: '',
    itinerarios: [],
    anexos: [] //
  };
  const [currentPassageiro, setCurrentPassageiro] = useState(initialPassageiroState);

  const initialItinerarioState = {
    id: '',
    origem: '',
    destino: '',
    dataSaida: '',
    ciaAerea: '',
    voo: '',
    horarios: ''
  };
  const [currentItinerario, setCurrentItinerario] = useState(initialItinerarioState);

  const [errors, setErrors] = useState({});
  const [successInfo, setSuccessInfo] = useState({ show: false, message: '' });

  const previewRef = useRef(null);

  const showSuccessMessageHandler = (message) => {
    setSuccessInfo({ show: true, message });
  };

  const handleSuccessClose = () => {
    setSuccessInfo({ show: false, message: '' });
  };

  const resetCurrentPassageiro = () => {
    setCurrentPassageiro(initialPassageiroState);
    setEditingPassageiro(null);
    setErrors({});
  };

  const resetCurrentItinerario = () => {
    setCurrentItinerario(initialItinerarioState);
    // Não limpar erros de dataVolta aqui, será feito no handleAddItinerarioToPassageiro
    const newErrors = { ...errors };
    delete newErrors.origem;
    delete newErrors.destino;
    delete newErrors.dataSaida;
    // delete newErrors.dataVolta; // Removido daqui
    setErrors(newErrors);
  };

  const handleOpenPassengerForm = () => {
    resetCurrentPassageiro();
    setActiveForm('passageiro');
  };

  const handleCancelPassengerForm = () => {
    resetCurrentPassageiro();
    setActiveForm(null);
  };

  const handlePassageiroFieldChange = (fieldName, value) => {
    setCurrentPassageiro(prev => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleItinerarioFieldChange = (fieldName, value) => {
    setCurrentItinerario(prev => ({ ...prev, [fieldName]: value }));
     if (errors[fieldName] && (['origem', 'destino', 'dataSaida'].includes(fieldName))) { //
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };
  
  const validateItinerarioFields = () => {
    const newItinerarioErrors = {};
    if (!currentItinerario.origem.trim()) newItinerarioErrors.origem = 'Origem é obrigatória'; //
    if (!currentItinerario.destino.trim()) newItinerarioErrors.destino = 'Destino é obrigatório'; //
    if (!currentItinerario.dataSaida) { //
      newItinerarioErrors.dataSaida = 'Data de saída é obrigatória'; //
    } else if (!validarDataViagem(currentItinerario.dataSaida)) { //
      newItinerarioErrors.dataSaida = 'Data de saída não pode ser no passado'; //
    }
    // Não definir erros globais aqui diretamente, apenas retornar as validações locais
    // setErrors(prev => ({ ...prev, ...newItinerarioErrors })); // Removido daqui
    return newItinerarioErrors;
  };
  
  const validatePassageiroForm = () => {
    const newFormErrors = {};
    if (!currentPassageiro.nome.trim()) newFormErrors.nome = 'Nome é obrigatório'; //
    else if (currentPassageiro.nome.trim().length < 3) newFormErrors.nome = 'Nome deve ter pelo menos 3 caracteres'; //

    if (!currentPassageiro.cpf) newFormErrors.cpf = 'CPF é obrigatório'; //
    else if (!validarCPF(currentPassageiro.cpf)) newFormErrors.cpf = 'CPF inválido'; //
    
    if (!currentPassageiro.dataNascimento) newFormErrors.dataNascimento = 'Data de nascimento é obrigatória'; //
    else if (!validarDataNascimento(currentPassageiro.dataNascimento)) newFormErrors.dataNascimento = 'Data inválida (deve ter entre 16 e 120 anos)'; //

    if (!currentPassageiro.itinerarios || currentPassageiro.itinerarios.length === 0) { //
      newFormErrors.itinerarios = 'Pelo menos um itinerário é obrigatório'; //
    }
    setErrors(newFormErrors);
    return Object.keys(newFormErrors).length === 0;
  };

  // UPDATED: Agora aceita incluirVoltaFlag e dataVoltaParam
  const handleAddItinerarioToPassageiro = (incluirVoltaFlag, dataVoltaParam) => {
    const mainItineraryErrors = validateItinerarioFields();
    let allValidationErrors = { ...mainItineraryErrors };

    const newItinerariesToAdd = [{ ...currentItinerario, id: generateId() }]; //

    if (incluirVoltaFlag) {
      if (!dataVoltaParam) {
        allValidationErrors.dataVolta = 'Data da volta é obrigatória.';
      } else if (!validarDataViagem(dataVoltaParam)) { //
        allValidationErrors.dataVolta = 'Data da volta inválida (não pode ser no passado).';
      } else {
        // Adicionar 'T00:00:00' para evitar problemas de fuso horário na comparação de datas
        const departureDateMainLeg = new Date(currentItinerario.dataSaida + 'T00:00:00');
        const returnDateLeg = new Date(dataVoltaParam + 'T00:00:00');

        if (currentItinerario.dataSaida && returnDateLeg < departureDateMainLeg) {
          allValidationErrors.dataVolta = 'Data da volta não pode ser anterior à data de saída.';
        }
      }
    }

    if (Object.keys(allValidationErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...allValidationErrors }));
      return; 
    }
    
    // Se chegou aqui, a validação principal e da data de volta (se aplicável) passaram
    if (incluirVoltaFlag) { // Certifique-se de que dataVoltaParam é usado aqui
        const returnItinerario = {
            ...initialItinerarioState, 
            id: generateId(), //
            origem: currentItinerario.destino,
            destino: currentItinerario.origem,
            dataSaida: dataVoltaParam, // Usar a data da volta fornecida
        };
        newItinerariesToAdd.push(returnItinerario);
    }

    setCurrentPassageiro(prev => ({
      ...prev,
      itinerarios: [...prev.itinerarios, ...newItinerariesToAdd]
    }));
    
    resetCurrentItinerario(); // Reseta os campos do formulário principal do itinerário

    // Limpa erros específicos do formulário de itinerário que foram tratados
    const newErrorsState = { ...errors };
    delete newErrorsState.origem;
    delete newErrorsState.destino;
    delete newErrorsState.dataSaida;
    delete newErrorsState.dataVolta; // Limpa o erro da data de volta também
    if (newErrorsState.itinerarios && (currentPassageiro.itinerarios.length + newItinerariesToAdd.length > 0)) { //
        delete newErrorsState.itinerarios;
    }
    setErrors(newErrorsState);

    if (newItinerariesToAdd.length > 1) {
      showSuccessMessageHandler('Trechos de ida e volta adicionados!');
    } else {
      showSuccessMessageHandler('Trecho adicionado com sucesso!'); //
    }
  };

  const handleRemoveItinerarioFromPassageiroForm = (itinerarioId) => {
    setCurrentPassageiro(prev => ({
      ...prev,
      itinerarios: prev.itinerarios.filter(it => it.id !== itinerarioId)
    }));
    showSuccessMessageHandler('Trecho removido!'); //
  };

  const handleSavePassageiro = () => {
    if (validatePassageiroForm()) {
      const passageiroData = { 
        ...currentPassageiro, 
        cpf: currentPassageiro.cpf.replace(/\D/g, '') //
      };

      if (editingPassageiro) {
        setPassageiros(prevPassageiros => 
          prevPassageiros.map(p => p.id === editingPassageiro.id ? { ...passageiroData, id: editingPassageiro.id } : p)
        );
        showSuccessMessageHandler('Passageiro atualizado com sucesso!'); //
      } else {
        const cpfExiste = passageiros.some(p => p.cpf === passageiroData.cpf); //
        if (cpfExiste) {
          setErrors({ cpf: 'CPF já cadastrado na lista de passageiros' }); //
          return;
        }
        setPassageiros(prevPassageiros => [...prevPassageiros, { ...passageiroData, id: generateId() }]); //
        showSuccessMessageHandler('Passageiro adicionado com sucesso!'); //
      }
      resetCurrentPassageiro();
      setActiveForm(null);
    }
  };

  const handleEditPassageiro = (passageiroToEdit) => {
    setCurrentPassageiro({
        ...passageiroToEdit,
    });
    setEditingPassageiro(passageiroToEdit);
    setActiveForm('passageiro');
    setErrors({});
  };

  const handleDuplicatePassageiro = (passageiroToDuplicate) => {
    setCurrentPassageiro({
      ...initialPassageiroState,
      nome: passageiroToDuplicate.nome,
      dataNascimento: passageiroToDuplicate.dataNascimento,
      itinerarios: passageiroToDuplicate.itinerarios.map(it => ({ ...it, id: generateId() })), //
      anexos: passageiroToDuplicate.anexos ? [...passageiroToDuplicate.anexos] : [] //
    });
    setEditingPassageiro(null);
    setActiveForm('passageiro');
    setErrors({});
  };

  const handleRemovePassageiroFromList = (passageiroId) => {
    setPassageiros(prevPassageiros => prevPassageiros.filter(p => p.id !== passageiroId));
    showSuccessMessageHandler('Passageiro removido da lista!'); //
  };

  const exportToPNG = async () => {
    try {
      const element = previewRef.current;
      if (!element) {
        alert('Erro: Referência do preview não encontrada.'); //
        return;
      }
      if (window.html2canvas) { //
        const canvas = await window.html2canvas(element, { backgroundColor: '#ffffff', scale: 2, useCORS: true }); //
        const dataURL = canvas.toDataURL('image/png'); //
        const link = document.createElement('a'); //
        link.href = dataURL; //
        link.download = `solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.png`; //
        document.body.appendChild(link); //
        link.click(); //
        document.body.removeChild(link); //
        showSuccessMessageHandler('PNG exportado com sucesso!'); //
      } else {
        const printWindow = window.open('', '_blank'); //
        printWindow.document.write(`<html><head><title>Solicitação Fadex</title><style>body { font-family: Arial, sans-serif; padding: 20px; } .header { text-align: center; margin-bottom: 30px; } .content { max-width: 800px; margin: 0 auto; }</style></head><body><div class="content">${element.innerHTML}</div></body></html>`); //
        printWindow.document.close(); //
        printWindow.print(); //
        showSuccessMessageHandler('Documento preparado para impressão!'); //
      }
    } catch (error) {
      console.error('Erro ao exportar PNG:', error); //
      alert('Erro ao exportar PNG. Verifique o console para mais detalhes.'); //
    }
  };

  const exportToPDF = async () => {
    const hasContent = passageiros.some(p => p.nome || (p.anexos && p.anexos.length > 0)); //
    if (!hasContent && passageiros.length === 0) { //
        alert('Adicione passageiros para gerar o PDF.'); //
        return;
    }
    try {
      await generateSolicitacaoPDF(passageiros, faturamento); //
      showSuccessMessageHandler('PDF exportado com sucesso!'); //
    } catch (error) {
      console.error('Erro ao gerar PDF:', error); //
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.'); //
    }
  };

  const exportToExcel = () => {
    try {
        if (passageiros.length === 0) { //
            alert('Adicione passageiros para gerar o Excel/CSV.'); //
            return;
        }
        if (window.XLSX) { //
            const XLSX = window.XLSX; //
            const dadosExcel = []; //
            dadosExcel.push(['ADMINISTRATIVO FADEX - SOLICITAÇÃO DE PASSAGENS AÉREAS']); //
            dadosExcel.push([`Data: ${new Date().toLocaleDateString('pt-BR')}`]); //
            dadosExcel.push([]); //
            dadosExcel.push(['Nome', 'CPF', 'Data Nascimento', 'Origem', 'Destino', 'Data Saída', 'Cia Aérea', 'Voo', 'Horários', 'Anexos do Passageiro']); //
            
            passageiros.forEach(passageiro => { //
                const anexosNomes = passageiro.anexos && passageiro.anexos.length > 0  //
                    ? passageiro.anexos.map(a => a.name).join('; ')  //
                    : ''; //

                if (passageiro.itinerarios && passageiro.itinerarios.length > 0) { //
                    passageiro.itinerarios.forEach((itinerario, index) => { //
                        const dataSaidaFormatada = itinerario.dataSaida ? new Date(itinerario.dataSaida + 'T00:00:00-03:00').toLocaleDateString('pt-BR') : 'N/A'; //
                        dadosExcel.push([ //
                            index === 0 ? passageiro.nome : '', //
                            index === 0 ? formatCPF(passageiro.cpf) : '', //
                            index === 0 ? passageiro.dataNascimento : '', //
                            itinerario.origem, //
                            itinerario.destino, //
                            dataSaidaFormatada, //
                            itinerario.ciaAerea || '', //
                            itinerario.voo || '', //
                            itinerario.horarios || '', //
                            index === 0 ? anexosNomes : '' //
                        ]);
                    });
                } else {
                     dadosExcel.push([ //
                         passageiro.nome,  //
                         formatCPF(passageiro.cpf), //
                         passageiro.dataNascimento,  //
                         '-', '-', '-', '-', '-', '-',  //
                         anexosNomes //
                    ]);
                }
            });
            
            if (faturamento.contaProjeto || faturamento.descricao || faturamento.cc || faturamento.webId) { //
                dadosExcel.push([]); //
                dadosExcel.push(['FATURAMENTO']); //
                if(faturamento.contaProjeto) dadosExcel.push(['Projeto:', faturamento.contaProjeto]); //
                if(faturamento.descricao) dadosExcel.push(['Descrição:', faturamento.descricao]); //
                if(faturamento.cc) dadosExcel.push(['CC:', faturamento.cc]); //
                if(faturamento.webId) dadosExcel.push(['WEB ID:', faturamento.webId]); //
            }
            
            const ws = XLSX.utils.aoa_to_sheet(dadosExcel); //
            const colWidths = [{wch:30}, {wch:15}, {wch:15}, {wch:20}, {wch:20}, {wch:15}, {wch:15}, {wch:10}, {wch:15}, {wch:30}]; //
            ws['!cols'] = colWidths; //

            const wb = XLSX.utils.book_new(); //
            XLSX.utils.book_append_sheet(wb, ws, 'Solicitação'); //
            XLSX.writeFile(wb, `solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`); //
            showSuccessMessageHandler('Excel exportado com sucesso!'); //
        } else { 
            let csvContent = "data:text/csv;charset=utf-8,"; 
            csvContent += `ADMINISTRATIVO FADEX - SOLICITAÇÃO DE PASSAGENS AÉREAS\n`;
            csvContent += `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`; //
            csvContent += "Nome,CPF,Data Nascimento,Origem,Destino,Data Saída,Cia Aérea,Voo,Horários,Anexos do Passageiro\n"; //
            
            passageiros.forEach(passageiro => { //
                const anexosNomes = passageiro.anexos && passageiro.anexos.length > 0  //
                    ? passageiro.anexos.map(a => a.name).join('; ')  //
                    : ''; //
                if (passageiro.itinerarios && passageiro.itinerarios.length > 0) { //
                    passageiro.itinerarios.forEach((itinerario, index) => { //
                        const dataSaidaFormatada = itinerario.dataSaida ? new Date(itinerario.dataSaida + 'T00:00:00-03:00').toLocaleDateString('pt-BR') : 'N/A'; //
                        csvContent += `${index === 0 ? `"${passageiro.nome}"` : ''},${index === 0 ? `"${formatCPF(passageiro.cpf)}"` : ''},${index === 0 ? `"${passageiro.dataNascimento}"` : ''},"${itinerario.origem}","${itinerario.destino}","${dataSaidaFormatada}","${itinerario.ciaAerea || ''}","${itinerario.voo || ''}","${itinerario.horarios || ''}","${index === 0 ? anexosNomes.replace(/"/g, '""') : ''}"\n`; //
                    });
                } else {
                     csvContent += `"${passageiro.nome}","${formatCPF(passageiro.cpf)}","${passageiro.dataNascimento}","-","-","-","-","-","","${anexosNomes.replace(/"/g, '""')}"\n`; //
                }
            });
             if (faturamento.contaProjeto || faturamento.descricao || faturamento.cc || faturamento.webId) { //
                csvContent += "\nFATURAMENTO\n"; //
                if(faturamento.contaProjeto) csvContent += `Projeto:,"${faturamento.contaProjeto}"\n`; //
                if(faturamento.descricao) csvContent += `Descrição:,"${faturamento.descricao}"\n`; //
                if(faturamento.cc) csvContent += `CC:,"${faturamento.cc}"\n`; //
                if(faturamento.webId) csvContent += `WEB ID:,"${faturamento.webId}"\n`; //
            }
            
            const encodedUri = encodeURI(csvContent); //
            const link = document.createElement("a"); //
            link.setAttribute("href", encodedUri); //
            link.setAttribute("download", `solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`); //
            document.body.appendChild(link); //
            link.click(); //
            document.body.removeChild(link); //
            showSuccessMessageHandler('CSV exportado com sucesso!'); //
        }
    } catch (error) {
        console.error('Erro ao exportar Excel/CSV:', error); //
        alert('Erro ao exportar Excel/CSV. Verifique o console para mais detalhes.'); //
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SuccessMessage
        show={successInfo.show}
        message={successInfo.message}
        onClose={handleSuccessClose}
      />
      <Header //
        onExportPNG={exportToPNG}
        onExportPDF={exportToPDF} //
        onExportExcel={exportToExcel}
        isExportDisabled={passageiros.length === 0} //
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activeForm !== 'passageiro' && (
              <AddPassengerButton onClick={handleOpenPassengerForm} /> //
            )}

            {activeForm === 'passageiro' && (
              <PassengerForm //
                currentPassageiro={currentPassageiro}
                onPassageiroFieldChange={handlePassageiroFieldChange} //
                currentItinerario={currentItinerario}
                onItinerarioFieldChange={handleItinerarioFieldChange}
                onAddItinerario={handleAddItinerarioToPassageiro}
                onRemoveItinerario={handleRemoveItinerarioFromPassageiroForm}
                onSavePassageiro={handleSavePassageiro}
                onCancel={handleCancelPassengerForm}
                errors={errors}
                isEditing={!!editingPassageiro}
              />
            )}

            <BillingForm //
              faturamento={faturamento}
              onFaturamentoChange={setFaturamento}
            />
            
          </div>

          <div className="space-y-6">
            <PassengerList //
              passageiros={passageiros}
              onEditPassageiro={handleEditPassageiro}
              onDuplicatePassageiro={handleDuplicatePassageiro}
              onRemovePassageiro={handleRemovePassageiroFromList}
            />
            <Preview //
              ref={previewRef}
              passageiros={passageiros} //
              faturamento={faturamento}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FadexTravelSystem;