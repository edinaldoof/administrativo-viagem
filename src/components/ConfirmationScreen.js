// src/components/ConfirmationScreen.js
import React, { useState, useEffect } from 'react';

// Componente para a caixa de diálogo de feedback manual
const FeedbackDialog = ({ fieldKey, onSave, onCancel }) => {
  const [justification, setJustification] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-800">Fornecer Dica para a IA</h3>
        <p className="text-sm text-gray-600 mt-1">
          Campo: <span className="font-semibold">{fieldKey}</span>
        </p>
        <div className="mt-4">
          <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
            Qual é a regra ou dica para a IA extrair este campo corretamente no futuro?
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
            Salvar Dica
          </button>
        </div>
      </div>
    </div>
  );
};


const ConfirmationScreen = ({ originalData, onConfirm, onCancel, onSendFeedback }) => {
  const [editedData, setEditedData] = useState(JSON.parse(JSON.stringify(originalData)));
  const [justifications, setJustifications] = useState([]);
  const [feedbackDialogKey, setFeedbackDialogKey] = useState(null);

  useEffect(() => {
    // Garante que o estado seja atualizado se a prop originalData mudar
    setEditedData(JSON.parse(JSON.stringify(originalData)));
  }, [originalData]);

  if (!originalData) return null;

  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    setEditedData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)); // Deep copy
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = current[keys[i]] || {};
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSaveManualJustification = (justification) => {
    const newJustification = `Para o campo '${feedbackDialogKey}', o usuário deu a seguinte dica: ${justification}`;
    setJustifications(prev => [...prev, newJustification]);
    setFeedbackDialogKey(null);
  };
  
  const processAndSubmit = (isConfirming) => {
    let allJustifications = [...justifications];

    // Gerar justificativas automáticas para campos alterados
    const compareAndGenerateFeedback = (original, edited, path = '') => {
        Object.keys(original).forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            if (typeof original[key] === 'object' && original[key] !== null && !Array.isArray(original[key])) {
                compareAndGenerateFeedback(original[key], edited[key] || {}, currentPath);
            } else if (Array.isArray(original[key])) {
                 // Simplificação: não compara arrays (itinerários) por enquanto
            } else if (original[key] !== edited[key]) {
                const autoJustification = `Feedback Automático: O campo '${currentPath}' foi alterado pelo usuário de '${original[key] || 'vazio'}' para '${edited[key] || 'vazio'}'.`;
                allJustifications.push(autoJustification);
            }
        });
    };
    compareAndGenerateFeedback(originalData, editedData);

    if (allJustifications.length > 0) {
      onSendFeedback(allJustifications.join('\n'));
    }

    if (isConfirming) {
      onConfirm(editedData); // Envia os dados editados para o fluxo principal
    } else {
      onCancel(); // Apenas cancela
    }
  };


  const renderField = (label, path) => {
    const keys = path.split('.');
    let value = editedData;
    let originalValue = originalData;
    try {
        for(const key of keys) { value = value[key]; }
        for(const key of keys) { originalValue = originalValue[key]; }
    } catch (e) { value = ''; originalValue = ''; }

    const isEdited = value !== originalValue;

    return (
     <div className={`p-3 border-b border-gray-100 hover:bg-gray-50 rounded-md ${isEdited ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
       <label htmlFor={path} className="block text-sm font-medium text-gray-600">{label}</label>
       <div className="flex items-center gap-2 mt-1">
         <input
            type="text"
            id={path}
            value={value || ''}
            onChange={(e) => handleInputChange(path, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
         />
         <button
            onClick={() => setFeedbackDialogKey(label)}
            className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
            title="Adicionar dica para a IA sobre este campo"
          >
            Ajustar
         </button>
       </div>
       {isEdited && <p className="text-xs text-yellow-700 mt-1">Valor original: "{originalValue || 'vazio'}"</p>}
     </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg animate-fade-in">
      {feedbackDialogKey && (
        <FeedbackDialog
          fieldKey={feedbackDialogKey}
          onSave={handleSaveManualJustification}
          onCancel={() => setFeedbackDialogKey(null)}
        />
      )}
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Confirme, Edite e Ensine a IA</h2>
      <p className="text-sm text-gray-600 mb-6">Revise e edite os dados extraídos diretamente. Se a IA precisa de uma dica para o futuro, clique em "Ajustar". Suas edições serão salvas como feedback automático.</p>
      
      {/* Seção de Faturamento */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Informações Globais</h3>
        <div className="space-y-2">
          {renderField("Título", "title")}
          {renderField("Conta do Projeto", "billing.account")}
          {renderField("Conta corrente", "billing.costCenter")}
          {renderField("Web ID", "billing.webId")}
          {renderField("Justificativa", "billing.description")}
        </div>
      </div>
      
      {/* Seção de Passageiros */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Passageiros Encontrados ({editedData.passengers?.length || 0})</h3>
        <div className="space-y-6">
          {(editedData.passengers || []).map((passenger, pIndex) => (
            <div key={pIndex} className="p-4 border rounded-lg bg-white shadow-sm">
              <h4 className="font-bold text-lg text-blue-700 mb-3">Passageiro #{pIndex + 1}</h4>
              <div className="space-y-2">
                 {renderField(`Nome P.${pIndex + 1}`, `passengers.${pIndex}.name`)}
                 {renderField(`CPF P.${pIndex + 1}`, `passengers.${pIndex}.cpf`)}
                 {renderField(`Nascimento P.${pIndex + 1}`, `passengers.${pIndex}.birthDate`)}
                 {renderField(`Email P.${pIndex + 1}`, `passengers.${pIndex}.email`)}
                 {renderField(`Telefone P.${pIndex + 1}`, `passengers.${pIndex}.phone`)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {justifications.length > 0 && (
        <div className="mt-8 pt-4 border-t">
          <h3 className="text-lg font-semibold text-green-700">Dicas Manuais Salvas para Envio:</h3>
          <ul className="list-disc list-inside mt-2 text-sm text-gray-700 space-y-1">
            {justifications.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </div>
      )}

      <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t">
        <button 
          onClick={() => processAndSubmit(false)} 
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Cancelar Importação
        </button>
        <button 
            onClick={() => processAndSubmit(true)} 
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            disabled={!editedData.passengers || editedData.passengers.length === 0}
        >
            Confirmar e Usar Dados
        </button>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
