
// src/components/ConfirmationScreen.js
import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plane, Bus, Briefcase, RefreshCw } from 'lucide-react'; // Ícones para ações

// Componente para a caixa de diálogo de feedback manual
const FeedbackDialog = ({ fieldKey, onSave, onCancel, existingText = '' }) => {
  const [justification, setJustification] = useState(existingText);

  useEffect(() => {
    setJustification(existingText);
  }, [existingText, fieldKey]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold text-gray-800">Fornecer Dica para a IA</h3>
        <p className="text-sm text-gray-600 mt-1">
          Campo: <span className="font-semibold text-blue-600">{fieldKey}</span>
        </p>
        <div className="mt-4">
          <label htmlFor="justification" className="block text-sm font-medium text-gray-700 mb-2">
            Qual é a regra ou dica para a IA extrair este campo corretamente no futuro?
          </label>
          <textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Ex: O número do projeto é sempre o código antes do primeiro hífen."
            rows="4"
          />
        </div>
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onCancel} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium">
            Cancelar
          </button>
          <button
            onClick={() => onSave(justification)}
            disabled={!justification.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-bold"
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
  const [justifications, setJustifications] = useState([]); // Agora um array de objetos: {id, fieldKey, text}
  const [feedbackDialogInfo, setFeedbackDialogInfo] = useState({ isOpen: false, fieldKey: null, hintId: null, existingText: '' });

  useEffect(() => {
    setEditedData(JSON.parse(JSON.stringify(originalData)));
  }, [originalData]);

  if (!originalData) return null;

  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    setEditedData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        // Evita erro se um objeto aninhado (como billing) não existir
        const key = keys[i];
        if (key.includes('[')) { // Handle array paths like 'passengers[0]'
            const arrayKey = key.substring(0, key.indexOf('['));
            const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')), 10);
            if (!current[arrayKey]) current[arrayKey] = [];
            if (!current[arrayKey][index]) current[arrayKey][index] = {};
            current = current[arrayKey][index];
        } else {
            if (current[key] === undefined || current[key] === null) {
                current[key] = {};
            }
            current = current[key];
        }
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };
  
  const handleOpenFeedbackDialog = (fieldKey, hintId = null, existingText = '') => {
    setFeedbackDialogInfo({ isOpen: true, fieldKey, hintId, existingText });
  };

  const handleCloseFeedbackDialog = () => {
    setFeedbackDialogInfo({ isOpen: false, fieldKey: null, hintId: null, existingText: '' });
  };

  const handleSaveJustification = (newText) => {
    const { fieldKey, hintId } = feedbackDialogInfo;
    
    if (hintId) { // Editando uma dica existente
      setJustifications(prev => prev.map(j => j.id === hintId ? { ...j, text: newText } : j));
    } else { // Adicionando uma nova dica
      setJustifications(prev => [
        ...prev,
        { id: Date.now(), fieldKey, text: newText }
      ]);
    }
    handleCloseFeedbackDialog();
  };

  const handleDeleteJustification = (hintId) => {
    setJustifications(prev => prev.filter(j => j.id !== hintId));
  };
  
  // Mapeamento de caminhos para rótulos amigáveis (usado apenas para o dialog de feedback)
  const friendlyLabels = {
    'title': 'Título', 'billing.costCenter': 'Conta corrente do projeto',
    'billing.webId': 'Web ID', 'billing.description': 'Justificativa',
  };
  if (originalData.passengers) {
      originalData.passengers.forEach((p, i) => {
          friendlyLabels[`passengers[${i}].name`] = `Nome P.${i + 1}`;
          friendlyLabels[`passengers[${i}].cpf`] = `CPF P.${i + 1}`;
          friendlyLabels[`passengers[${i}].birthDate`] = `Nascimento P.${i + 1}`;
          friendlyLabels[`passengers[${i}].email`] = `Email P.${i + 1}`;
          friendlyLabels[`passengers[${i}].phone`] = `Telefone P.${i + 1}`;
          (p.itinerary || []).forEach((it, itIndex) => {
              friendlyLabels[`passengers[${i}].itinerary[${itIndex}].quantity`] = `Qtd Trecho ${itIndex+1} P.${i+1}`;
              friendlyLabels[`passengers[${i}].itinerary[${itIndex}].unitPrice`] = `Valor Trecho ${itIndex+1} P.${i+1}`;
              friendlyLabels[`passengers[${i}].itinerary[${itIndex}].ciaAerea`] = `Cia Aérea Trecho ${itIndex+1} P.${i+1}`;
              friendlyLabels[`passengers[${i}].itinerary[${itIndex}].voo`] = `Voo Trecho ${itIndex+1} P.${i+1}`;
          });
      });
  }

  const processAndSubmit = (isConfirming) => {
    // Envia apenas as dicas manuais
    if (justifications.length > 0) {
      const allFeedbackLines = justifications.map(j => `Regra para '${j.fieldKey}': ${j.text}`);
      onSendFeedback(allFeedbackLines.join('\n'));
    }

    if (isConfirming) {
      onConfirm(editedData);
    } else {
      onCancel();
    }
  };


  const renderField = (label, path, type = "text") => {
    const keys = path.split('.');
    let value = editedData;
    let originalValue = originalData;
    try {
        let currentOriginal = originalData;
        let currentEdited = editedData;
        
        keys.forEach(key => {
             if (key.includes('[')) { // Handle array paths like 'passengers[0]'
                const arrayKey = key.substring(0, key.indexOf('['));
                const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')), 10);
                currentOriginal = currentOriginal?.[arrayKey]?.[index];
                currentEdited = currentEdited?.[arrayKey]?.[index];
            } else {
                currentOriginal = currentOriginal?.[key];
                currentEdited = currentEdited?.[key];
            }
        });
        originalValue = currentOriginal;
        value = currentEdited;

    } catch (e) { value = ''; originalValue = ''; }

    const isEdited = JSON.stringify(value) !== JSON.stringify(originalValue);
    const feedbackKey = friendlyLabels[path] || label;

    return (
     <div className={`p-3 border-b border-gray-100 hover:bg-gray-50 rounded-md ${isEdited ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}>
       <label htmlFor={path} className="block text-sm font-medium text-gray-600">{label}</label>
       <div className="flex items-center gap-2 mt-1">
         <input
            type={type}
            id={path}
            value={value || ''}
            onChange={(e) => handleInputChange(path, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
         />
         <button
            onClick={() => handleOpenFeedbackDialog(feedbackKey)}
            className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200"
            title="Adicionar dica para a IA sobre este campo"
          >
            Ajustar IA
         </button>
       </div>
       {isEdited && <p className="text-xs text-yellow-700 mt-1">Valor original: "{originalValue || 'vazio'}"</p>}
     </div>
    );
  };

  const renderItineraryDetails = (itinerary) => {
    return (
        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1">
                {itinerary.tripType === 'Aéreo' ? <Plane size={14} /> : <Bus size={14} />}
                {itinerary.tripType || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
                <Briefcase size={14} />
                {itinerary.baggage || 'N/A'}
            </span>
            {itinerary.isRoundTrip && (
                <span className="flex items-center gap-1 font-semibold text-blue-600">
                    <RefreshCw size={14} />
                    Ida e Volta
                </span>
            )}
        </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg animate-fade-in">
      {feedbackDialogInfo.isOpen && (
        <FeedbackDialog
          fieldKey={feedbackDialogInfo.fieldKey}
          onSave={handleSaveJustification}
          onCancel={handleCloseFeedbackDialog}
          existingText={feedbackDialogInfo.existingText}
        />
      )}
      
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Confirme, Edite e Ensine a IA</h2>
      <p className="text-sm text-gray-600 mb-6">Revise e edite os dados extraídos. Suas edições serão salvas como dicas para a IA melhorar em extrações futuras. Use "Ajustar IA" para dar uma dica mais complexa.</p>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Informações Globais</h3>
        <div className="space-y-2">
          {renderField("Título", "title")}
          {renderField("Conta corrente do projeto", "billing.costCenter")}
          {renderField("Web ID", "billing.webId")}
          {renderField("Justificativa", "billing.description")}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Passageiros Encontrados ({editedData.passengers?.length || 0})</h3>
        <div className="space-y-6">
          {(editedData.passengers || []).map((passenger, pIndex) => (
            <div key={pIndex} className="p-4 border rounded-lg bg-white shadow-sm">
              <h4 className="font-bold text-lg text-blue-700 mb-3">Passageiro #{pIndex + 1}</h4>
              <div className="space-y-2">
                 {renderField(`Nome P.${pIndex + 1}`, `passengers[${pIndex}].name`)}
                 {renderField(`CPF P.${pIndex + 1}`, `passengers[${pIndex}].cpf`)}
                 {renderField(`Nascimento P.${pIndex + 1}`, `passengers[${pIndex}].birthDate`)}
                 {renderField(`Email P.${pIndex + 1}`, `passengers[${pIndex}].email`)}
                 {renderField(`Telefone P.${pIndex + 1}`, `passengers[${pIndex}].phone`)}
              </div>
              
              <div className="mt-4 pt-3 border-t">
                 <h5 className="font-semibold text-md text-gray-600 mb-2">Itinerário(s)</h5>
                 {(passenger.itinerary || []).map((it, itIndex) => (
                   <div key={itIndex} className="p-3 bg-gray-50 rounded-lg mb-2">
                      <p className="font-medium">{it.origin || 'N/A'} → {it.destination || 'N/A'}</p>
                      <p className="text-sm">Partida: {it.departureDate || 'N/A'} {it.returnDate && ` | Retorno: ${it.returnDate}`}</p>
                      {renderItineraryDetails(it)}
                      <div className="grid grid-cols-2 gap-x-4 mt-3 pt-3 border-t">
                        {renderField(`Cia Aérea Trecho ${itIndex+1} P.${pIndex+1}`, `passengers[${pIndex}].itinerary[${itIndex}].ciaAerea`)}
                        {renderField(`Voo Trecho ${itIndex+1} P.${pIndex+1}`, `passengers[${pIndex}].itinerary[${itIndex}].voo`)}
                        {renderField(`Qtd Trecho ${itIndex+1} P.${pIndex+1}`, `passengers[${pIndex}].itinerary[${itIndex}].quantity`, "number")}
                        {renderField(`Valor Trecho ${itIndex+1} P.${pIndex+1}`, `passengers[${pIndex}].itinerary[${itIndex}].unitPrice`, "number")}
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {justifications.length > 0 && (
        <div className="mt-8 pt-4 border-t">
          <h3 className="text-lg font-semibold text-green-700">Dicas Manuais Salvas para Envio:</h3>
          <ul className="space-y-2 mt-3">
            {justifications.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg text-sm text-gray-800">
                <div className="flex-1">
                  <span className="font-semibold text-green-800">{item.fieldKey}:</span>
                  <p className="pl-2">{item.text}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleOpenFeedbackDialog(item.fieldKey, item.id, item.text)} title="Editar Dica">
                    <Edit className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                  </button>
                  <button onClick={() => handleDeleteJustification(item.id)} title="Excluir Dica">
                    <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t">
        <button 
          onClick={() => processAndSubmit(false)} 
          className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-medium transition-colors"
        >
          Cancelar Importação
        </button>
        <button 
            onClick={() => processAndSubmit(true)} 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-colors"
            disabled={!editedData.passengers || editedData.passengers.length === 0}
        >
            Confirmar e Usar Dados
        </button>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
