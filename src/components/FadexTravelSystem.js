// src/components/FadexTravelSystem.js
import React, { useState, useRef } from 'react';

// Seus componentes existentes
import Header from './Header';
import SuccessMessage from './SuccessMessage';
import AddPassengerButton from './AddPassengerButton';
import PassengerForm from './PassengerForm';
import BillingForm from './BillingForm';
import PassengerList from './PassengerList';
import Preview from './Preview';

// --- NOVOS COMPONENTES ADICIONADOS ---
import ConfirmationScreen from './ConfirmationScreen';
import HelpChatbot from './HelpChatbot';
import AIProcessorModal from './AIProcessorModal';
// -------------------------------------

// --- Importações movidas para um arquivo central de utilitários ---
import {
  generateId,
  validarCPF,
  validarDataNascimento,
  validarDataViagem
} from '../utils/utils.js';

// Suas funções de exportação (sem alteração)
import { generateSolicitacaoPDF } from '../utils/pdfGenerator.js';
import { exportDataToExcel } from '../utils/excelExporter.js';
import { exportPreviewToPNG } from '../utils/pngExporter.js';

// --- Imports para a nova tela de importação ---
import { extractDataFromPdfWithGemini } from '../ai/geminiService';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';

// ALTERAÇÃO: Corrigido o caminho do worker do pdf.js para usar a URL correta
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
// ---------------------------------------------

const FadexTravelSystem = () => {
  // --- SEUS ESTADOS EXISTENTES (SEM ALTERAÇÃO) ---
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
  
  // --- ESTADO PARA CONTROLE DE VISUALIZAÇÃO (ALTERAÇÃO) ---
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  // --------------------------------------------------------

  // --- SUAS FUNÇÕES DE LÓGICA (COM PEQUENAS ALTERAÇÕES) ---
  const showSuccessMessageHandler = (message) => { setSuccessInfo({ show: true, message }); };
  const handleSuccessClose = () => { setSuccessInfo({ show: false, message: '' }); };
  const resetCurrentPassageiro = () => { setCurrentPassageiro(initialPassageiroState); setEditingPassageiro(null); setErrors({}); };
  const resetCurrentItinerario = () => { setCurrentItinerario(initialItinerarioState); const newErrors = { ...errors }; delete newErrors.origem; delete newErrors.destino; delete newErrors.dataSaida; delete newErrors.dataVolta; setErrors(newErrors); };
  const handleOpenPassengerForm = () => { resetCurrentPassageiro(); setActiveForm('passageiro'); };
  const handleCancelPassengerForm = () => { resetCurrentPassageiro(); setActiveForm(null); };
  const handlePassageiroFieldChange = (fieldName, value) => { setCurrentPassageiro(prev => ({ ...prev, [fieldName]: value })); if (errors[fieldName]) { setErrors(prev => { const newErrors = { ...prev }; delete newErrors[fieldName]; return newErrors; }); } };
  const handleItinerarioFieldChange = (fieldName, value) => { setCurrentItinerario(prev => ({ ...prev, [fieldName]: value })); if (errors[fieldName] && (['origem', 'destino', 'dataSaida'].includes(fieldName))) { setErrors(prev => { const newErrors = { ...prev }; delete newErrors[fieldName]; return newErrors; }); } };
  const validateItinerarioFields = () => { const newItinerarioErrors = {}; if (!currentItinerario.origem.trim()) newItinerarioErrors.origem = 'Origem é obrigatória'; if (!currentItinerario.destino.trim()) newItinerarioErrors.destino = 'Destino é obrigatório'; if (!currentItinerario.dataSaida) { newItinerarioErrors.dataSaida = 'Data de saída é obrigatória'; } else if (!validarDataViagem(currentItinerario.dataSaida)) { newItinerarioErrors.dataSaida = 'Data de saída não pode ser no passado'; } return newItinerarioErrors; };
  const validatePassageiroForm = () => { const newFormErrors = {}; if (!currentPassageiro.nome.trim()) newFormErrors.nome = 'Nome é obrigatório'; else if (currentPassageiro.nome.trim().length < 3) newFormErrors.nome = 'Nome deve ter pelo menos 3 caracteres'; if (!currentPassageiro.cpf) newFormErrors.cpf = 'CPF é obrigatório'; else if (!validarCPF(currentPassageiro.cpf)) newFormErrors.cpf = 'CPF inválido'; if (!currentPassageiro.dataNascimento) newFormErrors.dataNascimento = 'Data de nascimento é obrigatória'; else if (!validarDataNascimento(currentPassageiro.dataNascimento)) newFormErrors.dataNascimento = 'Data inválida (deve ter entre 16 e 120 anos)'; if (!currentPassageiro.itinerarios || currentPassageiro.itinerarios.length === 0) { newFormErrors.itinerarios = 'Pelo menos um itinerário é obrigatório'; } setErrors(newFormErrors); return Object.keys(newFormErrors).length === 0; };
  
  const handleAddItinerarioToPassageiro = (incluirVoltaFlag, dataVoltaParam) => {
    const itinerarioErrors = validateItinerarioFields();
    if (incluirVoltaFlag && !dataVoltaParam) {
      itinerarioErrors.dataVolta = 'Data da volta é obrigatória';
    }

    if (Object.keys(itinerarioErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...itinerarioErrors }));
      return;
    }

    const newItinerarios = [...currentPassageiro.itinerarios];
    const ida = { ...currentItinerario, id: generateId() };
    newItinerarios.push(ida);

    if (incluirVoltaFlag) {
      const volta = {
        ...currentItinerario,
        id: generateId(),
        origem: currentItinerario.destino,
        destino: currentItinerario.origem,
        dataSaida: dataVoltaParam
      };
      newItinerarios.push(volta);
    }
    
    setCurrentPassageiro(prev => ({ ...prev, itinerarios: newItinerarios }));
    resetCurrentItinerario();
    showSuccessMessageHandler(`Trecho(s) adicionado(s)!`);
  };

  const handleRemoveItinerarioFromPassageiroForm = (itinerarioId) => { setCurrentPassageiro(prev => ({ ...prev, itinerarios: prev.itinerarios.filter(it => it.id !== itinerarioId) })); showSuccessMessageHandler('Trecho removido!'); };
  
  const handleSavePassageiro = () => {
    if (validatePassageiroForm()) {
      if (editingPassageiro) {
        setPassageiros(prev => prev.map(p => p.id === editingPassageiro.id ? currentPassageiro : p));
        showSuccessMessageHandler('Passageiro atualizado com sucesso!');
      } else {
        setPassageiros(prev => [...prev, { ...currentPassageiro, id: generateId() }]);
        showSuccessMessageHandler('Passageiro salvo com sucesso!');
      }
      setActiveForm(null);
      resetCurrentPassageiro();
    }
  };

  const handleEditPassageiro = (passageiroToEdit) => { setCurrentPassageiro({ ...passageiroToEdit }); setEditingPassageiro(passageiroToEdit); setActiveForm('passageiro'); setErrors({}); };
  const handleDuplicatePassageiro = (passageiroToDuplicate) => { setCurrentPassageiro({ ...initialPassageiroState, nome: passageiroToDuplicate.nome, dataNascimento: passageiroToDuplicate.dataNascimento, itinerarios: passageiroToDuplicate.itinerarios.map(it => ({ ...it, id: generateId() })), anexos: passageiroToDuplicate.anexos ? [...passageiroToDuplicate.anexos] : [] }); setEditingPassageiro(null); setActiveForm('passageiro'); setErrors({}); };
  const handleRemovePassageiroFromList = (passageiroId) => { setPassageiros(prevPassageiros => prevPassageiros.filter(p => p.id !== passageiroId)); showSuccessMessageHandler('Passageiro removido da lista!'); };
  const handleExportPNG = async () => { try { await exportPreviewToPNG(previewRef.current, `solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.png`); showSuccessMessageHandler('PNG exportado com sucesso!'); } catch (error) { alert(error.message); } };
  const handleExportPDF = async () => { try { await generateSolicitacaoPDF(passageiros, faturamento); showSuccessMessageHandler('PDF exportado com sucesso!'); } catch (error) { alert(`Erro ao gerar PDF: ${error.message}`); } };
  const handleExportExcel = () => { try { exportDataToExcel(passageiros, faturamento, `solicitacao-fadex-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}`); showSuccessMessageHandler('Excel exportado com sucesso!'); } catch (error) { alert(error.message); } };

  // --- FLUXO DE IMPORTAÇÃO ATUALIZADO (ALTERAÇÃO) ---

  const handleConfirmImport = (dataFromAI) => {
    if (dataFromAI) {
      // Mapeia passageiros a partir dos dados da IA
      const novosPassageiros = (dataFromAI.passengers || []).map(p => ({
        id: generateId(),
        nome: p.name || 'Nome não extraído',
        cpf: p.cpf || '',
        dataNascimento: p.birthDate ? new Date(p.birthDate).toLocaleDateString('pt-BR') : '',
        anexos: [],
        itinerarios: (p.itinerary || []).map(i => ({
          id: generateId(),
          origem: i.origin || '',
          destino: i.destination || '',
          dataSaida: i.departureDate ? new Date(i.departureDate).toISOString().split('T')[0] : '',
          ciaAerea: i.ciaAerea || '',
          voo: i.voo || '',
          horarios: i.horarios || '',
        })),
      }));

      // Filtra para evitar duplicatas por CPF, se o CPF existir
      const passageirosFiltrados = novosPassageiros.filter(
        pIA => !(pIA.cpf && passageiros.some(pExistente => pExistente.cpf === pIA.cpf))
      );

      setPassageiros(prev => [...prev, ...passageirosFiltrados]);

      // Preenche o faturamento
      if (dataFromAI.billing) {
        setFaturamento({
          contaProjeto: dataFromAI.billing.account || '',
          descricao: dataFromAI.billing.description || '',
          cc: dataFromAI.billing.costCenter || '',
          webId: dataFromAI.billing.webId || ''
        });
      }
      
      showSuccessMessageHandler(`${passageirosFiltrados.length} passageiro(s) e dados de faturamento importados!`);
    }
    setImportModalOpen(false); // Fecha o modal
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
        onImportPDF={() => setImportModalOpen(true)}
        isExportDisabled={passageiros.length === 0}
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

      <AIProcessorModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onConfirm={handleConfirmImport}
      />
      
      <HelpChatbot />
    </div>
  );
};

export default FadexTravelSystem;
