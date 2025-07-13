// src/components/ConfirmationScreen.js
import React, { useState } from 'react';

// Componente para a caixa de diálogo de feedback
const FeedbackDialog = ({ fieldKey, fieldValue, onSave, onCancel }) => {
  const [justification, setJustification] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-800">Ajustar Extração</h3>
        <p className="text-sm text-gray-600 mt-1">
          Campo: <span className="font-semibold">{fieldKey}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Valor Extraído: <span className="font-mono bg-gray-100 p-1 rounded text-xs">{fieldValue || 'N/A'}</span>
        </p>
        <div className="mt-4">
          <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
            Por que este dado está errado ou o que deveria ser extraído?
          </label>
          <textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: O número do projeto é sempre o código antes do primeiro hífen."
            rows="4"
          />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button
            onClick={() => onSave(justification)}
            disabled={!justification.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          >
            Salvar Justificativa
          </button>
        </div>
      </div>
    </div>
  );
};


const ConfirmationScreen = ({ extractedData, onConfirm, onCancel, onSendFeedback }) => {
  if (!extractedData) return null;

  const [feedbackDialog, setFeedbackDialog] = useState(null); // { key, value }
  const [justifications, setJustifications] = useState([]);
  const { title, billing, passengers } = extractedData;

  const handleOpenFeedbackDialog = (key, value) => {
    setFeedbackDialog({ key, value });
  };

  const handleSaveJustification = (justification) => {
    const newJustification = `Para o campo '${feedbackDialog.key}', o valor '${feedbackDialog.value}' estava incorreto. A regra correta é: ${justification}`;
    const updatedJustifications = [...justifications, newJustification];
    setJustifications(updatedJustifications);
    setFeedbackDialog(null);
  };
  
  const handleCancelAndSubmitFeedback = () => {
    // Envia todas as justificativas coletadas
    if (justifications.length > 0) {
      onSendFeedback(justifications.join('\n'));
    }
    onCancel(); // Fecha a tela de confirmação
  };

  const renderField = (fieldKey, fieldValue) => (
     <div className="flex justify-between items-center p-2 border-b border-gray-100 hover:bg-gray-50">
       <div>
          <span className="text-sm font-medium text-gray-600">{fieldKey}:</span>
          <p className="text-md text-gray-800">{fieldValue || <span className="text-gray-400 italic">Não extraído</span>}</p>
       </div>
       <button
          onClick={() => handleOpenFeedbackDialog(fieldKey, fieldValue)}
          className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
        >
          Ajustar
       </button>
     </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg animate-fade-in">
      {feedbackDialog && (
        <FeedbackDialog
          fieldKey={feedbackDialog.key}
          fieldValue={feedbackDialog.value}
          onSave={handleSaveJustification}
          onCancel={() => setFeedbackDialog(null)}
        />
      )}
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Confirme os Dados e Ensine a IA</h2>
      <p className="text-sm text-gray-600 mb-6">Revise os dados extraídos. Se algo estiver errado, clique em "Ajustar" para ensinar a IA a extrair corretamente no futuro.</p>
      
      {/* Seção de Faturamento */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Informações Globais</h3>
        <div className="space-y-2">
          {renderField("Título", title)}
          {renderField("Conta do Projeto", billing?.account)}
          {renderField("Centro de Custo", billing?.costCenter)}
          {renderField("Web ID", billing?.webId)}
          {renderField("Justificativa", billing?.description)}
        </div>
      </div>
      
      {/* Seção de Passageiros */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Passageiros Encontrados ({passengers?.length || 0})</h3>
        <div className="space-y-6">
          {(passengers || []).map((passenger, pIndex) => (
            <div key={pIndex} className="p-4 border rounded-lg bg-white shadow-sm">
              <h4 className="font-bold text-lg text-blue-700 mb-3">Passageiro #{pIndex + 1}: {passenger.name || 'Nome não extraído'}</h4>
              <div className="space-y-2">
                 {renderField(`Nome P.${pIndex + 1}`, passenger.name)}
                 {renderField(`CPF P.${pIndex + 1}`, passenger.cpf)}
                 {renderField(`Nascimento P.${pIndex + 1}`, passenger.birthDate)}
                 {renderField(`Email P.${pIndex + 1}`, passenger.email)}
                 {renderField(`Telefone P.${pIndex + 1}`, passenger.phone)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {justifications.length > 0 && (
        <div className="mt-8 pt-4 border-t">
          <h3 className="text-lg font-semibold text-green-700">Feedback Salvo para Envio:</h3>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-700 space-y-1">
            {justifications.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t">
        <button 
          onClick={handleCancelAndSubmitFeedback} 
          className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors disabled:bg-orange-300"
          disabled={justifications.length === 0}
        >
          Enviar Feedback e Cancelar
        </button>
        <div className="flex gap-4">
          <button onClick={onCancel} className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
            Cancelar Sem Feedback
          </button>
          <button onClick={() => onConfirm(extractedData)} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" disabled={!passengers || passengers.length === 0}>
            Confirmar e Usar Dados
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
