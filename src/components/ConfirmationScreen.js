// src/components/ConfirmationScreen.js
import React, { useState } from 'react';

// Um componente reutilizável para cada linha de dado que permite feedback
const FeedbackField = ({ fieldKey, fieldValue, onFeedbackChange }) => {
  const [correctedValue, setCorrectedValue] = useState(fieldValue || '');
  const [imageFile, setImageFile] = useState(null);
  const fileInputId = `feedback-file-${fieldKey}-${Math.random()}`;

  const handleValueChange = (e) => {
    setCorrectedValue(e.target.value);
    onFeedbackChange(fieldKey, { value: e.target.value, image: imageFile });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      onFeedbackChange(fieldKey, { value: correctedValue, image: file });
    }
  };

  const triggerFileSelect = () => {
    document.getElementById(fileInputId).click();
  };

  return (
    <div className="flex items-center gap-3 p-2 border-b border-gray-100 hover:bg-gray-50">
      <strong className="w-1/4 text-sm text-gray-600 truncate">{fieldKey}:</strong>
      <input
        type="text"
        value={correctedValue}
        onChange={handleValueChange}
        className="flex-grow p-1 border border-gray-300 rounded-md text-sm"
        placeholder="Valor extraído"
      />
      <button onClick={triggerFileSelect} title="Anexar imagem de correção" className="p-2 text-gray-500 hover:text-blue-600">
        <input type="file" id={fileInputId} onChange={handleImageChange} className="hidden" accept="image/*" />
        {imageFile ? <span className="text-green-600">IMG</span> : <span>Anexo</span>}
      </button>
    </div>
  );
};


const ConfirmationScreen = ({ extractedData, onConfirm, onCancel, onSendFeedback }) => {
  if (!extractedData) return null;

  const [feedback, setFeedback] = useState({});
  const [generalFeedbackText, setGeneralFeedbackText] = useState('');
  const { title, billing, passengers } = extractedData;

  const handleFieldFeedback = (fieldKey, newFeedback) => {
    setFeedback(prev => ({ ...prev, [fieldKey]: newFeedback }));
  };

  const handleConfirmAndSubmit = () => {
    // A lógica de `onConfirm` agora só precisa dos dados originais
    onConfirm(extractedData);
  };
  
  const handleCancelAndSubmitFeedback = () => {
    // Combina o feedback de campo estruturado com o texto geral
    const fullFeedback = {
      structured: feedback,
      general: generalFeedbackText
    };
    onSendFeedback(fullFeedback);
    onCancel();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Confirme e Corrija os Dados</h2>
      
      {/* Seção de Faturamento */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Informações Globais</h3>
        <div className="space-y-2">
          <FeedbackField fieldKey="Título" fieldValue={title} onFeedbackChange={(k, f) => handleFieldFeedback('title', f)} />
          <FeedbackField fieldKey="Conta do Projeto" fieldValue={billing?.account} onFeedbackChange={(k, f) => handleFieldFeedback('billing.account', f)} />
          <FeedbackField fieldKey="Centro de Custo" fieldValue={billing?.costCenter} onFeedbackChange={(k, f) => handleFieldFeedback('billing.costCenter', f)} />
          <FeedbackField fieldKey="Web ID" fieldValue={billing?.webId} onFeedbackChange={(k, f) => handleFieldFeedback('billing.webId', f)} />
          <FeedbackField fieldKey="Justificativa" fieldValue={billing?.description} onFeedbackChange={(k, f) => handleFieldFeedback('billing.description', f)} />
        </div>
      </div>
      
      {/* Seção de Passageiros */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Passageiros Encontrados ({passengers?.length || 0})</h3>
        <div className="space-y-6">
          {(passengers || []).map((passenger, pIndex) => (
            <div key={pIndex} className="p-4 border rounded-lg bg-white shadow-sm">
              <h4 className="font-bold text-lg text-blue-700 mb-3">Passageiro #{pIndex + 1}</h4>
              <div className="space-y-2">
                 <FeedbackField fieldKey={`Nome P.${pIndex + 1}`} fieldValue={passenger.name} onFeedbackChange={(k, f) => handleFieldFeedback(`passengers[${pIndex}].name`, f)} />
                 <FeedbackField fieldKey={`CPF P.${pIndex + 1}`} fieldValue={passenger.cpf} onFeedbackChange={(k, f) => handleFieldFeedback(`passengers[${pIndex}].cpf`, f)} />
                 <FeedbackField fieldKey={`Nascimento P.${pIndex + 1}`} fieldValue={passenger.birthDate} onFeedbackChange={(k, f) => handleFieldFeedback(`passengers[${pIndex}].birthDate`, f)} />
                 <FeedbackField fieldKey={`Email P.${pIndex + 1}`} fieldValue={passenger.email} onFeedbackChange={(k, f) => handleFieldFeedback(`passengers[${pIndex}].email`, f)} />
                 <FeedbackField fieldKey={`Telefone P.${pIndex + 1}`} fieldValue={passenger.phone} onFeedbackChange={(k, f) => handleFieldFeedback(`passengers[${pIndex}].phone`, f)} />
              </div>
              {/* O feedback para itinerários pode ser complexo, por enquanto mantemos como feedback geral */}
            </div>
          ))}
        </div>
      </div>

      {/* Seção de Feedback Geral */}
      <div className="mt-8 pt-4 border-t">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Feedback Geral (Opcional)</h3>
          <p className="text-sm text-gray-600 mb-3">
            Use este campo para observações gerais que não se aplicam a um campo específico, como "Os itinerários do João estão faltando".
          </p>
          <textarea
            value={generalFeedbackText}
            onChange={(e) => setGeneralFeedbackText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Descreva erros gerais ou informações que faltaram."
            rows="3"
          />
      </div>

      <div className="flex justify-between items-center gap-4 mt-6">
        <button onClick={handleCancelAndSubmitFeedback} className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors">
          Enviar Feedback e Cancelar
        </button>
        <div className="flex gap-4">
          <button onClick={onCancel} className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Cancelar Sem Feedback
          </button>
          <button onClick={handleConfirmAndSubmit} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" disabled={!passengers || passengers.length === 0}>
            Confirmar e Usar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
