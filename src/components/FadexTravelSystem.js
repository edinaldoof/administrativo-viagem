// src/components/FadexTravelSystem.js
import React, { useState, useRef } from 'react';

import Header from './Header';
import SuccessMessage from './SuccessMessage';
import AddPassengerButton from './AddPassengerButton';
import PassengerForm from './PassengerForm';
import BillingForm from './BillingForm';
import PassengerList from './PassengerList';
import Preview from './Preview';
import AIProcessorModal from './AIProcessorModal';

import {
  generateId,
  formatCPF,
  validarCPF,
  validarDataNascimento,
  validarDataViagem
} from '../utils/utils.js';

import { generateSolicitacaoPDF } from '../utils/pdfGenerator.js';
import { exportDataToExcel } from '../utils/excelExporter.js';
import { exportPreviewToPNG } from '../utils/pngExporter.js';

const formatDateToYYYYMMDD = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateToDDMMYYYY = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};


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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const initialPassageiroState = {
    id: '',
    nome: '',
    cpf: '',
    dataNascimento: '',
    itinerarios: [],
    anexos: []
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

  const handleAddItinerarioToPassageiro = (incluirVoltaFlag, dataVoltaParam) => {
    const mainItineraryErrors = validateItinerarioFields();
    let allValidationErrors = { ...mainItineraryErrors };

    if (incluirVoltaFlag) {
      if (!dataVoltaParam) {
        allValidationErrors.dataVolta = 'Data da volta é obrigatória.';
      } else if (!validarDataViagem(dataVoltaParam)) {
        allValidationErrors.dataVolta = 'Data da volta inválida (não pode ser no passado).';
      } else {
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
    
    const newItinerariesToAdd = [{ ...currentItinerario, id: generateId() }];
    
    if (incluirVoltaFlag) {
        const returnItinerario = {
            ...initialItinerarioState, 
            id: generateId(),
            origem: currentItinerario.destino,
            destino: currentItinerario.origem,
            dataSaida: dataVoltaParam,
        };
        newItinerariesToAdd.push(returnItinerario);
    }

    setCurrentPassageiro(prev => ({
      ...prev,
      itinerarios: [...prev.itinerarios, ...newItinerariesToAdd]
    }));
    
    resetCurrentItinerario();

    const newErrorsState = { ...errors };
    delete newErrorsState.origem;
    delete newErrorsState.destino;
    delete newErrorsState.dataSaida;
    delete newErrorsState.dataVolta;
    if (newErrorsState.itinerarios && (currentPassageiro.itinerarios.length + newItinerariesToAdd.length > 0)) {
        delete newErrorsState.itinerarios;
    }
    setErrors(newErrorsState);

    if (newItinerariesToAdd.length > 1) {
      showSuccessMessageHandler('Trechos de ida e volta adicionados!');
    } else {
      showSuccessMessageHandler('Trecho adicionado com sucesso!');
    }
  };

  const handleRemoveItinerarioFromPassageiroForm = (itinerarioId) => {
    setCurrentPassageiro(prev => ({
      ...prev,
      itinerarios: prev.itinerarios.filter(it => it.id !== itinerarioId)
    }));
    showSuccessMessageHandler('Trecho removido!');
  };

  const handleSavePassageiro = () => {
    if (validatePassageiroForm()) {
      const passageiroData = { 
        ...currentPassageiro, 
        cpf: currentPassageiro.cpf.replace(/\D/g, '')
      };

      if (editingPassageiro) {
        setPassageiros(prevPassageiros => 
          prevPassageiros.map(p => p.id === editingPassageiro.id ? { ...passageiroData, id: editingPassageiro.id } : p)
        );
        showSuccessMessageHandler('Passageiro atualizado com sucesso!');
      } else {
        const cpfExiste = passageiros.some(p => p.cpf === passageiroData.cpf);
        if (cpfExiste) {
          setErrors({ cpf: 'CPF já cadastrado na lista de passageiros' });
          return;
        }
        setPassageiros(prevPassageiros => [...prevPassageiros, { ...passageiroData, id: generateId() }]);
        showSuccessMessageHandler('Passageiro adicionado com sucesso!');
      }
      resetCurrentPassageiro();
      setActiveForm(null);
    }
  };

  const handleEditPassageiro = (passageiroToEdit) => {
    setCurrentPassageiro({ ...passageiroToEdit });
    setEditingPassageiro(passageiroToEdit);
    setActiveForm('passageiro');
    setErrors({});
  };

  const handleDuplicatePassageiro = (passageiroToDuplicate) => {
    setCurrentPassageiro({
      ...initialPassageiroState,
      nome: passageiroToDuplicate.nome,
      dataNascimento: passageiroToDuplicate.dataNascimento,
      itinerarios: passageiroToDuplicate.itinerarios.map(it => ({ ...it, id: generateId() })),
      anexos: passageiroToDuplicate.anexos ? [...passageiroToDuplicate.anexos] : []
    });
    setEditingPassageiro(null);
    setActiveForm('passageiro');
    setErrors({});
  };

  const handleRemovePassageiroFromList = (passageiroId) => {
    setPassageiros(prevPassageiros => prevPassageiros.filter(p => p.id !== passageiroId));
    showSuccessMessageHandler('Passageiro removido da lista!');
  };

  const handleImportPDF = () => {
    setIsModalOpen(true);
  };
  
  const handleConfirmImport = (dataFromAI) => {
    if (dataFromAI) {
      const novosPassageiros = dataFromAI.passengers.map(p => ({
        id: generateId(),
        nome: p.name || '',
        cpf: formatCPF(p.cpf || ''),
        dataNascimento: formatDateToDDMMYYYY(p.birthDate),
        anexos: [],
        itinerarios: (p.itinerary || []).map(it => ({
          id: generateId(),
          origem: it.origin || '',
          destino: it.destination || '',
          dataSaida: formatDateToYYYYMMDD(it.departureDate),
          ciaAerea: it.ciaAerea || '',
          voo: it.voo || '',
          horarios: it.horarios || '',
        }))
      }));

      const passageirosFiltrados = novosPassageiros.filter(
        pIA => !passageiros.some(pExistente => pExistente.cpf === pIA.cpf)
      );

      setPassageiros(prev => [...prev, ...passageirosFiltrados]);

      if (dataFromAI.billing) {
        setFaturamento({
            contaProjeto: dataFromAI.billing.account || '',
            descricao: dataFromAI.billing.description || '',
            cc: dataFromAI.billing.costCenter || '',
            webId: dataFromAI.billing.webId || '',
        });
      }
      
      showSuccessMessageHandler(`${passageirosFiltrados.length} passageiro(s) e dados de faturamento importados com sucesso!`);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <SuccessMessage
        show={successInfo.show}
        message={successInfo.message}
        onClose={handleSuccessClose}
      />
      <Header
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onImportPDF={handleImportPDF}
        isExportDisabled={passageiros.length === 0}
      />
      
      <AIProcessorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmImport}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
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
      </div>
    </div>
  );
};

export default FadexTravelSystem;