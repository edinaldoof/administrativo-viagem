// src/components/FadexTravelSystem.js
import React, { useState, useRef, useEffect } from 'react';

// Seus componentes existentes
import Header from '@/components/Header';
import SuccessMessage from '@/components/SuccessMessage';
import AddPassengerButton from '@/components/AddPassengerButton';
import PassengerForm from '@/components/PassengerForm';
import BillingForm from '@/components/BillingForm';
import PassengerList from '@/components/PassengerList';
import Preview from '@/components/Preview';
import AIProcessorModal from '@/components/AIProcessorModal';

// Suas funções de utilidade
import {
  generateId,
  formatCPF,
  validarCPF,
  validarDataNascimento,
  validarDataViagem,
  formatDateToYYYYMMDD,
  formatDateToDDMMYYYY
} from '@/utils/utils.js';

// Suas funções de exportação
import { generateSolicitacaoPDF } from '@/utils/pdfGenerator.js';
import { exportDataToExcel } from '@/utils/excelExporter.js';
import { exportPreviewToPNG } from '@/utils/pngExporter.js';

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
  const initialPassageiroState = { id: '', nome: '', cpf: '', dataNascimento: '', itinerarios: [], anexos: [] };
  const [currentPassageiro, setCurrentPassageiro] = useState(initialPassageiroState);
  const initialItinerarioState = { id: '', origem: '', destino: '', dataSaida: '', ciaAerea: '', voo: '', horarios: '' };
  const [currentItinerario, setCurrentItinerario] = useState(initialItinerarioState);
  const [errors, setErrors] = useState({});
  const [successInfo, setSuccessInfo] = useState({ show: false, message: '' });
  const previewRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const newErrors = { ...errors };
    delete newErrors.origem;
    delete newErrors.destino;
    delete newErrors.dataSaida;
    delete newErrors.dataVolta;
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
    if (errors[fieldName] && (['origem', 'destino', 'dataSaida'].includes(fieldName))) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateItinerarioFields = () => {
    const newItinerarioErrors = {};
    if (!currentItinerario.origem.trim()) newItinerarioErrors.origem = 'Origem é obrigatória';
    if (!currentItinerario.destino.trim()) newItinerarioErrors.destino = 'Destino é obrigatório';
    if (!currentItinerario.dataSaida) {
      newItinerarioErrors.dataSaida = 'Data de saída é obrigatória';
    } else if (!validarDataViagem(currentItinerario.dataSaida)) {
      newItinerarioErrors.dataSaida = 'Data de saída não pode ser no passado';
    }
    return newItinerarioErrors;
  };
  
  const handleAddItinerarioToPassageiro = (incluirVoltaFlag, dataVoltaParam) => {
    const itinerarioErrors = validateItinerarioFields();
    
    // Validar a data de volta se a opção estiver marcada
    if (incluirVoltaFlag && !dataVoltaParam) {
      itinerarioErrors.dataVolta = 'Data de volta é obrigatória';
    } else if (incluirVoltaFlag && new Date(dataVoltaParam) < new Date(currentItinerario.dataSaida)) {
      itinerarioErrors.dataVolta = 'Data de volta não pode ser anterior à data de saída';
    }

    if (Object.keys(itinerarioErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...itinerarioErrors }));
      return;
    }
    
    // Adicionar o trecho de ida
    const newItinerarioIda = { ...currentItinerario, id: generateId() };
    let itinerariosToAdd = [newItinerarioIda];

    // Se incluir volta, cria o trecho de volta
    if (incluirVoltaFlag) {
      const newItinerarioVolta = {
        ...currentItinerario,
        id: generateId(),
        origem: currentItinerario.destino,
        destino: currentItinerario.origem,
        dataSaida: dataVoltaParam, // Usa a data de volta fornecida
        ciaAerea: '', // Limpa campos específicos da volta, se desejado
        voo: '',
        horarios: ''
      };
      itinerariosToAdd.push(newItinerarioVolta);
    }

    setCurrentPassageiro(prev => ({
      ...prev,
      itinerarios: [...prev.itinerarios, ...itinerariosToAdd]
    }));

    resetCurrentItinerario();
    showSuccessMessageHandler(incluirVoltaFlag ? 'Trechos de ida e volta adicionados!' : 'Trecho adicionado!');
  };
  

  const handleRemoveItinerarioFromPassageiroForm = (itinerarioId) => {
    setCurrentPassageiro(prev => ({
      ...prev,
      itinerarios: prev.itinerarios.filter(it => it.id !== itinerarioId)
    }));
    showSuccessMessageHandler('Trecho removido!');
  };

  const validatePassageiroForm = () => {
    const newFormErrors = {};
    if (!currentPassageiro.nome.trim()) newFormErrors.nome = 'Nome é obrigatório';
    else if (currentPassageiro.nome.trim().length < 3) newFormErrors.nome = 'Nome deve ter pelo menos 3 caracteres';

    if (!currentPassageiro.cpf) newFormErrors.cpf = 'CPF é obrigatório';
    else if (!validarCPF(currentPassageiro.cpf)) newFormErrors.cpf = 'CPF inválido';
    
    if (!currentPassageiro.dataNascimento) newFormErrors.dataNascimento = 'Data de nascimento é obrigatória';
    else if (!validarDataNascimento(currentPassageiro.dataNascimento)) newFormErrors.dataNascimento = 'Data inválida (deve ter entre 16 e 120 anos)';
    
    if (!currentPassageiro.itinerarios || currentPassageiro.itinerarios.length === 0) {
      newFormErrors.itinerarios = 'Pelo menos um itinerário é obrigatório';
    }

    setErrors(newFormErrors);
    return Object.keys(newFormErrors).length === 0;
  };
  
  const handleSavePassageiro = () => {
    if (!validatePassageiroForm()) {
      return;
    }

    if (editingPassageiro) {
      // Editar
      setPassageiros(prev => prev.map(p => p.id === editingPassageiro.id ? currentPassageiro : p));
      showSuccessMessageHandler('Passageiro atualizado com sucesso!');
    } else {
      // Adicionar novo
      setPassageiros(prev => [...prev, { ...currentPassageiro, id: generateId() }]);
      showSuccessMessageHandler('Passageiro adicionado com sucesso!');
    }
    
    setActiveForm(null);
    resetCurrentPassageiro();
  };
  
  const handleEditPassageiro = (passageiroToEdit) => {
    setCurrentPassageiro({ ...passageiroToEdit });
    setEditingPassageiro(passageiroToEdit);
    setActiveForm('passageiro');
    setErrors({});
  };
  
  const handleDuplicatePassageiro = (passageiroToDuplicate) => {
    // Prepara um novo passageiro para o formulário, sem ID e com IDs de itinerário novos
    setCurrentPassageiro({
      ...initialPassageiroState,
      nome: passageiroToDuplicate.nome,
      cpf: '', // Limpar o CPF para evitar duplicatas
      dataNascimento: passageiroToDuplicate.dataNascimento,
      itinerarios: passageiroToDuplicate.itinerarios.map(it => ({ ...it, id: generateId() })),
      anexos: passageiroToDuplicate.anexos ? [...passageiroToDuplicate.anexos] : [] // Copia os anexos
    });
    setEditingPassageiro(null); // Garante que estamos no modo "adicionar novo"
    setActiveForm('passageiro');
    setErrors({});
  };
  

  const handleRemovePassageiroFromList = (passageiroId) => {
    setPassageiros(prevPassageiros => prevPassageiros.filter(p => p.id !== passageiroId));
    showSuccessMessageHandler('Passageiro removido da lista!');
  };

  const handleExportPNG = async () => {
    try {
      await exportPreviewToPNG(previewRef.current, `solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.png`);
      showSuccessMessageHandler('PNG exportado com sucesso!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      await generateSolicitacaoPDF(passageiros, faturamento);
      showSuccessMessageHandler('PDF exportado com sucesso!');
    } catch (error) {
      alert(`Erro ao gerar PDF: ${error.message}`);
    }
  };

  const handleExportExcel = () => {
    try {
      exportDataToExcel(passageiros, faturamento, `solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`);
      showSuccessMessageHandler('Excel exportado com sucesso!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleImportPDF = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmImport = (dataFromAI) => {
    if (dataFromAI) {
      // Converte os dados da IA para o formato do estado do formulário
      const novoPassageiro = {
        id: generateId(),
        nome: dataFromAI.passengers[0].name || '',
        cpf: formatCPF(dataFromAI.passengers[0].cpf || ''),
        dataNascimento: formatDateToDDMMYYYY(new Date(dataFromAI.passengers[0].birthDate)),
        itinerarios: (dataFromAI.passengers[0].itinerary || []).map(it => ({
            id: generateId(),
            origem: it.origin || '',
            destino: it.destination || '',
            dataSaida: formatDateToYYYYMMDD(new Date(it.departureDate)),
            ciaAerea: it.ciaAerea || '',
            voo: it.voo || '',
            horarios: it.horarios || ''
        })),
        anexos: [] // Começa sem anexos
      };

      const novoFaturamento = {
          contaProjeto: dataFromAI.billing.account || '',
          descricao: dataFromAI.billing.description || '',
          cc: dataFromAI.billing.costCenter || '',
          webId: dataFromAI.billing.webId || ''
      };

      // Adiciona o novo passageiro e atualiza o faturamento
      setPassageiros(prev => [...prev, novoPassageiro]);
      setFaturamento(novoFaturamento);
      
      showSuccessMessageHandler(`Dados importados do PDF para ${novoPassageiro.nome}!`);
    }
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SuccessMessage
        show={successInfo.show}
        message={successInfo.message}
        onClose={handleSuccessClose}
      />
      <AIProcessorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmImport}
      />
      <Header
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onImportPDF={handleImportPDF}
        isExportDisabled={passageiros.length === 0}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {activeForm !== 'passageiro' && (
              <AddPassengerButton onClick={handleOpenPassengerForm} />
            )}
            {activeForm === 'passageiro' && (
              <PassengerForm
                currentPassageiro={currentPassageiro}
                onPassageiroFieldChange={handlePassageiroFieldChange}
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
            <BillingForm
              faturamento={faturamento}
              onFaturamentoChange={setFaturamento}
            />
          </div>
          <div className="space-y-6">
            <PassengerList
              passageiros={passageiros}
              onEditPassageiro={handleEditPassageiro}
              onDuplicatePassageiro={handleDuplicatePassageiro}
              onRemovePassageiro={handleRemovePassageiroFromList}
            />
            <Preview
              ref={previewRef}
              passageiros={passageiros}
              faturamento={faturamento}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FadexTravelSystem;
