// src/components/ConfirmationScreen.js
import React, { useState, useEffect } from 'react';
import { 
  Trash2, Edit, Plane, Bus, Briefcase, RefreshCw, 
  CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp,
  Sparkles, User, Calendar, Mail, Phone, Hash,
  MapPin, DollarSign, Tag, FileText, Clock, Check, Users,
  LightbulbIcon, X
} from 'lucide-react';

// Componente para a caixa de diálogo de feedback manual - Redesenhado
const FeedbackDialog = ({ fieldKey, onSave, onCancel, existingText = '' }) => {
  const [justification, setJustification] = useState(existingText);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setJustification(existingText);
    setIsAnimating(true);
  }, [existingText, fieldKey]);

  const handleSave = () => {
    onSave(justification);
    setIsAnimating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`
        bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg
        transform transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}>
        {/* Header com ícone */}
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <LightbulbIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Ensinar a IA
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Campo: <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-md">{fieldKey}</span>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Textarea aprimorada */}
        <div className="relative">
          <textarea
            id="justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="
              w-full p-4 border-2 border-gray-200 dark:border-gray-700 
              rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200 resize-none
              bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200
            "
            placeholder="Ex: O número do projeto é sempre o código antes do primeiro hífen..."
            rows="4"
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {justification.length} caracteres
          </div>
        </div>

        {/* Sugestões de exemplo */}
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Info size={12} />
            Dicas para uma boa regra:
          </p>
          <ul className="text-xs text-amber-700 dark:text-amber-400 mt-1 space-y-0.5 ml-4">
            <li>• Seja específico sobre a localização do dado</li>
            <li>• Mencione padrões ou formatos esperados</li>
            <li>• Indique palavras-chave relevantes</li>
          </ul>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onCancel} 
            className="
              px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
              rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium
              transition-all duration-200 hover:scale-105 active:scale-95
            "
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!justification.trim()}
            className="
              px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white 
              rounded-xl hover:from-blue-600 hover:to-purple-600 
              disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
              font-semibold shadow-lg shadow-blue-500/25
              transition-all duration-200 hover:scale-105 active:scale-95
              flex items-center gap-2
            "
          >
            <Check size={16} />
            Salvar Dica
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para Stats no topo
const StatsBar = ({ totalFields, editedFields, hintsCount }) => {
  const editPercentage = totalFields > 0 ? Math.round((editedFields / totalFields) * 100) : 0;
  
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <FileText size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total de campos</p>
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{totalFields}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Edit size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Campos editados</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{editedFields}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dicas para IA</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{hintsCount}</p>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="flex-1 max-w-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Progresso de revisão</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{editPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${editPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationScreen = ({ originalData, onConfirm, onCancel, onSendFeedback }) => {
  const [editedData, setEditedData] = useState(JSON.parse(JSON.stringify(originalData)));
  const [justifications, setJustifications] = useState([]);
  const [feedbackDialogInfo, setFeedbackDialogInfo] = useState({ isOpen: false, fieldKey: null, hintId: null, existingText: '' });
  const [expandedPassengers, setExpandedPassengers] = useState({});
  const [editedFieldsCount, setEditedFieldsCount] = useState(0);

  useEffect(() => {
    setEditedData(JSON.parse(JSON.stringify(originalData)));
    // Expandir o primeiro passageiro por padrão
    if (originalData?.passengers?.length > 0) {
      setExpandedPassengers({ 0: true });
    }
  }, [originalData]);

  // Calcular campos editados
  useEffect(() => {
    let count = 0;
    const checkEdited = (obj1, obj2, path = '') => {
      if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
          count++;
        }
        return;
      }
      const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
      allKeys.forEach(key => {
        checkEdited(obj1[key], obj2[key], `${path}.${key}`);
      })
    };
    if (originalData && editedData) {
      checkEdited(editedData, originalData);
    }
    setEditedFieldsCount(count);
  }, [editedData, originalData]);

  if (!originalData) return null;

  const handleInputChange = (path, value) => {
    const keys = path.split('.');
    setEditedData(prev => {
      const newData = JSON.parse(JSON.stringify(prev));
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (key.includes('[')) {
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

  const togglePassenger = (index) => {
    setExpandedPassengers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleOpenFeedbackDialog = (fieldKey, hintId = null, existingText = '') => {
    setFeedbackDialogInfo({ isOpen: true, fieldKey, hintId, existingText });
  };

  const handleCloseFeedbackDialog = () => {
    setFeedbackDialogInfo({ isOpen: false, fieldKey: null, hintId: null, existingText: '' });
  };

  const handleSaveJustification = (newText) => {
    const { fieldKey, hintId } = feedbackDialogInfo;
    
    if (hintId) {
      setJustifications(prev => prev.map(j => j.id === hintId ? { ...j, text: newText } : j));
    } else {
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

  const friendlyLabels = {
    'title': 'Título', 
    'billing.costCenter': 'Conta corrente do projeto',
    'billing.webId': 'Web ID', 
    'billing.description': 'Justificativa',
  };
  
  if (originalData.passengers) {
    originalData.passengers.forEach((p, i) => {
      friendlyLabels[`passengers.${i}.name`] = `Nome P.${i + 1}`;
      friendlyLabels[`passengers.${i}.cpf`] = `CPF P.${i + 1}`;
      friendlyLabels[`passengers.${i}.birthDate`] = `Nascimento P.${i + 1}`;
      friendlyLabels[`passengers.${i}.email`] = `Email P.${i + 1}`;
      friendlyLabels[`passengers.${i}.phone`] = `Telefone P.${i + 1}`;
      (p.itinerary || []).forEach((it, itIndex) => {
        friendlyLabels[`passengers[${i}].itinerary[${itIndex}].ciaAerea`] = `Cia Aérea Trecho ${itIndex+1} P.${i+1}`;
        friendlyLabels[`passengers[${i}].itinerary[${itIndex}].voo`] = `Voo Trecho ${itIndex+1} P.${i+1}`;
        friendlyLabels[`passengers[${i}].itinerary[${itIndex}].quantity`] = `Qtd Trecho ${itIndex+1} P.${i+1}`;
        friendlyLabels[`passengers[${i}].itinerary[${itIndex}].unitPrice`] = `Valor Trecho ${itIndex+1} P.${i+1}`;
      });
    });
  }

  const processAndSubmit = (isConfirming) => {
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

  const renderField = (label, path, type = "text", icon = null) => {
    const keys = path.split('.');
    let value = editedData;
    let originalValue = originalData;
    
    try {
      let currentOriginal = originalData;
      let currentEdited = editedData;
      
      keys.forEach(key => {
        if (key.includes('[')) {
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
    } catch (e) { 
      value = ''; 
      originalValue = ''; 
    }

    const isEdited = JSON.stringify(value) !== JSON.stringify(originalValue);
    const feedbackKey = friendlyLabels[path] || label;
    const hasHint = justifications.some(j => j.fieldKey === feedbackKey);

    return (
      <div className={`
        group relative p-3 rounded-lg transition-all duration-200
        ${isEdited 
          ? 'bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
      `}>
        <label htmlFor={path} className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 flex items-center gap-2">
          {icon && React.createElement(icon, { size: 14, className: "text-gray-400" })}
          {label}
          {hasHint && (
            <span className="ml-1 px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded-full flex items-center gap-1">
              <Sparkles size={10} />
              Dica
            </span>
          )}
        </label>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={type}
              id={path}
              value={value || ''}
              onChange={(e) => handleInputChange(path, e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-lg text-sm
                transition-all duration-200
                ${isEdited 
                  ? 'border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900 ring-2 ring-amber-200/50 dark:ring-amber-800/50' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500/50'
                }
                text-gray-800 dark:text-gray-200
              `}
            />
            {isEdited && (
              <div className="absolute -right-2 -top-2">
                <div className="p-1 bg-amber-400 rounded-full">
                  <AlertCircle size={12} className="text-white" />
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleOpenFeedbackDialog(feedbackKey)}
            className={`
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              p-2 rounded-lg
              ${hasHint 
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50' 
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
              }
            `}
            title={hasHint ? "Editar dica da IA" : "Adicionar dica para a IA"}
          >
            <LightbulbIcon size={16} />
          </button>
        </div>
        
        {isEdited && (
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1.5 flex items-center gap-1">
            <Clock size={10} />
            Original: "{originalValue || 'vazio'}"
          </p>
        )}
      </div>
    );
  };

  const renderItineraryDetails = (itinerary) => {
    return (
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <span className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-900 rounded-md">
          {itinerary.tripType === 'Aéreo' ? <Plane size={14} className="text-blue-500" /> : <Bus size={14} className="text-green-500" />}
          {itinerary.tripType || 'N/A'}
        </span>
        <span className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-900 rounded-md">
          <Briefcase size={14} className="text-gray-500" />
          {itinerary.baggage || 'N/A'}
        </span>
        {itinerary.isRoundTrip && (
          <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md font-semibold">
            <RefreshCw size={14} />
            Ida e Volta
          </span>
        )}
      </div>
    );
  };

  // Calcular total de campos
  const calculateTotalFields = () => {
    let count = 4; // campos globais
    if (editedData.passengers) {
      editedData.passengers.forEach(p => {
        count += 5; // campos do passageiro
        if (p.itinerary) {
          count += p.itinerary.length * 4; // campos do itinerário
        }
      });
    }
    return count;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {feedbackDialogInfo.isOpen && (
        <FeedbackDialog
          fieldKey={feedbackDialogInfo.fieldKey}
          onSave={handleSaveJustification}
          onCancel={handleCloseFeedbackDialog}
          existingText={feedbackDialogInfo.existingText}
        />
      )}
      
      {/* Header elegante */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Confirmação de Dados</h2>
            <p className="text-blue-100 mt-1">Revise e aprimore os dados extraídos do PDF</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-b-2xl">
        <div className="p-6">
          {/* Stats Bar */}
          <StatsBar 
            totalFields={calculateTotalFields()}
            editedFields={editedFieldsCount}
            hintsCount={justifications.length}
          />

          {/* Informações Globais */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                <FileText size={18} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Informações do Projeto</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
              {renderField("Título", "title", "text", Tag)}
              {renderField("Conta corrente do projeto", "billing.costCenter", "text", Hash)}
              {renderField("Web ID", "billing.webId", "text", Hash)}
              {renderField("Justificativa", "billing.description", "text", FileText)}
            </div>
          </div>

          {/* Passageiros */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg">
                  <Users size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Passageiros ({editedData.passengers?.length || 0})
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {(editedData.passengers || []).map((passenger, pIndex) => (
                <div 
                  key={pIndex} 
                  className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Header do Passageiro */}
                  <button
                    onClick={() => togglePassenger(pIndex)}
                    className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 hover:from-gray-100 hover:to-gray-150 dark:hover:from-gray-750 dark:hover:to-gray-700 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                          <User size={18} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200">
                            Passageiro #{pIndex + 1}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {passenger.name || 'Nome não informado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {passenger.itinerary?.length > 0 && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                            {passenger.itinerary.length} trecho(s)
                          </span>
                        )}
                        {expandedPassengers[pIndex] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </button>

                  {/* Conteúdo do Passageiro */}
                  {expandedPassengers[pIndex] && (
                    <div className="p-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                      {/* Dados Pessoais */}
                      <div className="mb-5">
                        <h5 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                          <User size={14} />
                          Dados Pessoais
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {renderField(`Nome`, `passengers[${pIndex}].name`, "text", User)}
                          {renderField(`CPF`, `passengers[${pIndex}].cpf`, "text", Hash)}
                          {renderField(`Data de Nascimento`, `passengers[${pIndex}].birthDate`, "text", Calendar)}
                          {renderField(`Email`, `passengers[${pIndex}].email`, "email", Mail)}
                          {renderField(`Telefone`, `passengers[${pIndex}].phone`, "tel", Phone)}
                        </div>
                      </div>

                      {/* Itinerários */}
                      {passenger.itinerary && passenger.itinerary.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                            <MapPin size={14} />
                            Itinerário
                          </h5>
                          <div className="space-y-3">
                            {passenger.itinerary.map((it, itIndex) => (
                              <div key={itIndex} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/10 dark:to-purple-950/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                      {it.origin || 'N/A'} → {it.destination || 'N/A'}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Trecho #{itIndex + 1}
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  <p>Partida: {it.departureDate || 'N/A'}</p>
                                  {it.returnDate && <p>Retorno: {it.returnDate}</p>}
                                </div>
                                
                                {renderItineraryDetails(it)}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                  {renderField(`Cia Aérea`, `passengers[${pIndex}].itinerary[${itIndex}].ciaAerea`, "text", Plane)}
                                  {renderField(`Voo`, `passengers[${pIndex}].itinerary[${itIndex}].voo`, "text", Tag)}
                                  {renderField(`Quantidade`, `passengers[${pIndex}].itinerary[${itIndex}].quantity`, "number", Hash)}
                                  {renderField(`Valor Unitário`, `passengers[${pIndex}].itinerary[${itIndex}].unitPrice`, "number", DollarSign)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dicas Salvas */}
          {justifications.length > 0 && (
            <div className="mt-8 p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-purple-600 dark:text-purple-400" size={20} />
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                  Dicas para Melhorar a IA
                </h3>
              </div>
              
              <div className="space-y-2">
                {justifications.map((item) => (
                  <div key={item.id} className="flex items-start justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex-1">
                      <span className="font-semibold text-purple-700 dark:text-purple-400 text-sm">
                        {item.fieldKey}:
                      </span>
                      <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{item.text}</p>
                    </div>
                    <div className="flex gap-1 ml-4">
                      <button 
                        onClick={() => handleOpenFeedbackDialog(item.fieldKey, item.id, item.text)} 
                        className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                        title="Editar Dica"
                      >
                        <Edit size={14} className="text-purple-600 dark:text-purple-400" />
                      </button>
                      <button 
                        onClick={() => handleDeleteJustification(item.id)} 
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Excluir Dica"
                      >
                        <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => processAndSubmit(false)} 
              className="
                px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium 
                transition-all duration-200 hover:scale-105 active:scale-95
                flex items-center gap-2
              "
            >
              <X size={18} />
              Cancelar Importação
            </button>
            
            <div className="flex items-center gap-3">
              {editedFieldsCount > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {editedFieldsCount} campo(s) editado(s)
                </span>
              )}
              
              <button 
                onClick={() => processAndSubmit(true)} 
                className="
                  px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                  rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold 
                  transition-all duration-200 hover:scale-105 active:scale-95
                  disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                  shadow-lg shadow-blue-500/25 flex items-center gap-2
                "
                disabled={!editedData.passengers || editedData.passengers.length === 0}
              >
                <CheckCircle size={18} />
                Confirmar e Usar Dados
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
