// src/components/FadexTravelSystem.js
import React, { useState, useRef } from 'react';

// Componentes
import Header from './Header';
import SuccessMessage from './SuccessMessage';
import AddPassengerButton from './AddPassengerButton';
import PassengerForm from './PassengerForm';
import BillingForm from './BillingForm';
import PassengerList from './PassengerList';
import Preview from './Preview';
import ConfirmationScreen from './ConfirmationScreen';
import HelpChatbot from './HelpChatbot';

// Utilitários
import {
  generateId,
  formatCPF,
  formatPhone,
  validarCPF,
  validarDataNascimento,
  validarDataViagem
} from '../utils/utils.js';
import { generateSolicitacaoPDF } from '../utils/pdfGenerator.js';
import { exportDataToExcel } from '../utils/excelExporter.js';
import { exportPreviewToPNG } from '../utils/pngExporter.js';
import { saveFeedback } from '../services/feedbackService';

// Utilitários de IA e PDF
import { extractDataFromPdfWithGemini } from '../ai/geminiService';
import { UploadCloud, FileText, CheckCircle, XCircle, Loader } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();


// Funções de formatação de data
const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('/')) {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    }
    if (!(date instanceof Date) || isNaN(date)) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateToDDMMYYYY = (date) => {
    if (!date) return '';
    if (typeof date === 'string' && date.includes('-')) {
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
    }
    if (!(date instanceof Date) || isNaN(date)) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};


// Componente da Tela de Importação
const ImportScreen = ({ onImportConfirmed, onBack, showSuccessMessage }) => {
  const [file, setFile] = useState(null);
  const [processingState, setProcessingState] = useState('idle');
  const [processingMessage, setProcessingMessage] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setExtractedData(null);
      setProcessingState('idle');
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const extractTextFromPdf = async (fileObject) => {
    const arrayBuffer = await fileObject.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    }
    return fullText;
  };

  const handleProcessFile = async () => {
    if (!file) return;
    setProcessingState('processing');
    try {
      setProcessingMessage('Extraindo texto do PDF...');
      const textContent = await extractTextFromPdf(file);
      if (!textContent) throw new Error('Falha ao extrair texto.');
      
      setProcessingMessage('Analisando com a IA Gemini...');
      const result = await extractDataFromPdfWithGemini(textContent); 
      setExtractedData(result);
      setProcessingState('success');
      setProcessingMessage('Dados extraídos com sucesso! Verifique, corrija e confirme.');
    } catch (err) {
      console.error("Erro no processamento do arquivo:", err);
      setProcessingState('error');
      setProcessingMessage(err.message || 'Ocorreu um erro desconhecido.');
    }
  };
  
  const handleCancelAndStoreFeedback = async (justification) => {
    if (justification && justification.trim()) {
      try {
        await saveFeedback(justification);
        showSuccessMessage('Obrigado! Seu feedback foi salvo e ajudará a melhorar futuras extrações.');
      } catch (error) {
        console.error("Erro ao salvar feedback:", error);
      }
    }
    setExtractedData(null);
    setProcessingState('idle');
    setFile(null);
  };

  const handleCancel = () => {
    setExtractedData(null);
    setProcessingState('idle');
    setFile(null);
  };

  if (extractedData) {
    return (
      <ConfirmationScreen
        extractedData={extractedData}
        onConfirm={onImportConfirmed}
        onCancel={handleCancel}
        onSendFeedback={handleCancelAndStoreFeedback}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg animate-fade-in">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Importar Requisição de PDF</h2>
        <button onClick={onBack} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Voltar</button>
      </div>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-500 bg-gray-50"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files[0])} style={{ display: 'none' }} accept=".pdf" />
        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">Arraste e solte o arquivo PDF aqui, ou clique para selecionar.</p>
      </div>
      {file && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-red-500" />
              <span className="font-medium">{file.name}</span>
            </div>
            <button onClick={handleProcessFile} disabled={processingState === 'processing'} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300">
              {processingState === 'processing' ? 'Processando...' : 'Processar Arquivo'}
            </button>
          </div>
           {processingState !== 'idle' && (
             <div className="flex items-center gap-3 mt-4 text-sm">
                {processingState === 'processing' && <Loader className="animate-spin h-5 w-5 text-blue-600" />}
                {processingState === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {processingState === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                <span className={`${
                    processingState === 'processing' ? 'text-blue-600' :
                    processingState === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>{processingMessage}</span>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente principal
const FadexTravelSystem = () => {
  const [passageiros, setPassageiros] = useState([]);
  const [faturamento, setFaturamento] = useState({ contaProjeto: '', descricao: '', cc: '', webId: '' });
  const [activeForm, setActiveForm] = useState(null);
  const [editingPassageiro, setEditingPassageiro] = useState(null);
  const initialPassageiroState = { id: '', nome: '', cpf: '', dataNascimento: '', email: '', dataContato: '', itinerarios: [], anexos: [] };
  const [currentPassageiro, setCurrentPassageiro] = useState(initialPassageiroState);
  const initialItinerarioState = { id: '', origem: '', destino: '', dataSaida: '', ciaAerea: '', voo: '', horarios: '' };
  const [currentItinerario, setCurrentItinerario] = useState(initialItinerarioState);
  const [errors, setErrors] = useState({});
  const [successInfo, setSuccessInfo] = useState({ show: false, message: '' });
  const previewRef = useRef(null);
  const [currentView, setCurrentView] = useState('main');

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
  
  const handleImportPDF = () => {
    setCurrentView('import');
  };

  const handleConfirmImport = (dataFromAI) => {
    if (!dataFromAI) {
      showSuccessMessageHandler('Nenhuma informação útil pôde ser extraída.');
      setCurrentView('main');
      return;
    }

    let codigoExtraido = '';
    const titulo = dataFromAI.title || '';
    if (titulo.includes(' - ')) {
        codigoExtraido = titulo.split(' - ')[0].trim();
    }

    setFaturamento(prevFaturamento => ({
      ...prevFaturamento,
      contaProjeto: codigoExtraido || dataFromAI.billing?.account || prevFaturamento.contaProjeto,
      cc: codigoExtraido || dataFromAI.billing?.costCenter || prevFaturamento.cc,
      descricao: dataFromAI.billing?.description || prevFaturamento.descricao,
      webId: dataFromAI.billing?.webId || prevFaturamento.webId,
    }));

    const passageirosParaAdicionar = dataFromAI.passengers || [];

    if (passageirosParaAdicionar.length === 0) {
        showSuccessMessageHandler('Dados de faturamento atualizados, mas nenhum passageiro foi encontrado para importar.');
        setCurrentView('main');
        return;
    }

    let updatedPassageiros = [...passageiros];
    let addedCount = 0;
    let updatedCount = 0;

    dataFromAI.passengers.forEach(pIA => {
        const itinerariosFormatados = (pIA.itinerary || []).map(it => ({
            id: generateId(),
            origem: it.origin || '',
            destino: it.destination || '',
            dataSaida: formatDateToYYYYMMDD(it.departureDate),
            ciaAerea: it.ciaAerea || '',
            voo: it.voo || '',
            horarios: it.horarios || '',
        }));

        const primeiroItinerario = pIA.itinerary?.[0];
        if (primeiroItinerario?.returnDate) {
            itinerariosFormatados.push({
                id: generateId(),
                origem: primeiroItinerario.destination || '',
                destino: primeiroItinerario.origin || '',
                dataSaida: formatDateToYYYYMMDD(primeiroItinerario.returnDate),
                ciaAerea: '',
                voo: '',
                horarios: '',
            });
        }
        
        const formattedCPF = formatCPF(pIA.cpf || '');
        const existingPassengerIndex = updatedPassageiros.findIndex(p => p.cpf === formattedCPF && formattedCPF);

        if (existingPassengerIndex > -1) {
            const passageiroExistente = updatedPassageiros[existingPassengerIndex];
            passageiroExistente.itinerarios.push(...itinerariosFormatados);
            if (pIA.email && !passageiroExistente.email) passageiroExistente.email = pIA.email;
            if (pIA.phone && !passageiroExistente.phone) passageiroExistente.phone = formatPhone(pIA.phone);
            if (pIA.contactDate && !passageiroExistente.dataContato) passageiroExistente.dataContato = formatDateToDDMMYYYY(pIA.contactDate);
            updatedCount++;
        } else {
            updatedPassageiros.push({
                id: generateId(),
                nome: pIA.name || 'Nome não extraído',
                cpf: formattedCPF,
                dataNascimento: formatDateToDDMMYYYY(pIA.birthDate),
                email: pIA.email || '',
                phone: formatPhone(pIA.phone || ''),
                dataContato: pIA.contactDate ? formatDateToDDMMYYYY(pIA.contactDate) : '',
                anexos: [],
                itinerarios: itinerariosFormatados,
            });
            addedCount++;
        }
    });

    setPassageiros(updatedPassageiros);

    let message = `${addedCount} passageiro(s) adicionado(s) e ${updatedCount} atualizado(s) com sucesso.`;
    showSuccessMessageHandler(message);
    setCurrentView('main');
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
        showImport={true}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'import' ? (
          <ImportScreen
            onImportConfirmed={handleConfirmImport}
            onBack={() => setCurrentView('main')}
            showSuccessMessage={showSuccessMessageHandler}
          />
        ) : (
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
        )}
      </div>

      <HelpChatbot />
    </div>
  );
};

export default FadexTravelSystem;
