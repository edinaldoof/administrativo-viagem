// src/components/PassengerForm.js
import React, { useState } from 'react';
import { formatCPF, formatDate } from '../utils/utils';

const PassengerForm = ({
  currentPassageiro,
  onPassageiroFieldChange,
  currentItinerario,
  onItinerarioFieldChange,
  onAddItinerario,
  onRemoveItinerario,
  onSavePassageiro,
  onCancel,
  errors,
  isEditing,
}) => {

  const handlePassageiroInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'dataNascimento' || name === 'contactDate') {
      formattedValue = formatDate(value);
    }
    onPassageiroFieldChange(name, formattedValue);
  };

  const handleItinerarioInputChange = (e) => {
    const { name, value } = e.target;
    onItinerarioFieldChange(name, value);
  };

  const handleFileChangeForPassenger = (event) => {
    const newFiles = Array.from(event.target.files);
    const currentAnexos = currentPassageiro.anexos || [];
    const uniqueNewFiles = newFiles.filter(
      (file) => !currentAnexos.some((existingFile) => existingFile.name === file.name && existingFile.size === file.size)
    );
    onPassageiroFieldChange('anexos', [...currentAnexos, ...uniqueNewFiles]);
    event.target.value = null;
  };

  const handleRemoveFileForPassenger = (fileNameToRemove) => {
    const currentAnexos = currentPassageiro.anexos || [];
    onPassageiroFieldChange('anexos', currentAnexos.filter(file => file.name !== fileNameToRemove));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <span>IMG</span>;
    }
    if (fileType === 'application/pdf') {
      return <span>PDF</span>;
    }
    return <span>FILE</span>;
  };

  const [incluirVolta, setIncluirVolta] = useState(false);
  const [dataVolta, setDataVolta] = useState(''); // Novo estado para a data de volta

  const handleIncluirVoltaChange = (e) => {
    const isChecked = e.target.checked;
    setIncluirVolta(isChecked);
    if (!isChecked) {
      setDataVolta(''); // Limpa a data de volta se desmarcar
      if (errors.dataVolta) {
        // Idealmente, o componente pai (FadexTravelSystem) limparia esse erro específico.
        // Por agora, a lógica de limpeza de erros no FadexTravelSystem ao submeter/validar cuidará disso.
      }
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
          <span>{isEditing ? 'Editar Passageiro' : 'Novo Passageiro'}</span>
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-red-100 rounded-xl transition-colors"
          title="Fechar Formulário"
        >
          <span>X</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Campos do Passageiro (nome, cpf, dataNascimento) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
            <input
              type="text" name="nome" id="nome" value={currentPassageiro.nome}
              onChange={handlePassageiroInputChange}
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.nome ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="Digite o nome completo"
            />
            {errors.nome && <div className="flex items-center space-x-1 mt-1 text-red-500 text-sm"><span>{errors.nome}</span></div>}
          </div>
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
            <input
              type="text" name="cpf" id="cpf" value={currentPassageiro.cpf}
              onChange={handlePassageiroInputChange}
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.cpf ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="000.000.000-00" maxLength="14"
            />
            {errors.cpf && <div className="flex items-center space-x-1 mt-1 text-red-500 text-sm"><span>{errors.cpf}</span></div>}
          </div>
          <div>
            <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
            <input
              type="text" name="dataNascimento" id="dataNascimento" value={currentPassageiro.dataNascimento}
              onChange={handlePassageiroInputChange}
              className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.dataNascimento ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="DD/MM/AAAA" maxLength="10"
            />
            {errors.dataNascimento && <div className="flex items-center space-x-1 mt-1 text-red-500 text-sm"><span>{errors.dataNascimento}</span></div>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email (Opcional)</label>
            <input
              type="email" name="email" id="email" value={currentPassageiro.email}
              onChange={handlePassageiroInputChange}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label htmlFor="contactDate" className="block text-sm font-medium text-gray-700 mb-2">Data do Contato (Opcional)</label>
            <input
              type="text" name="contactDate" id="contactDate" value={currentPassageiro.contactDate}
              onChange={handlePassageiroInputChange}
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="DD/MM/AAAA" maxLength="10"
            />
          </div>
        </div>

        {/* Seção de Itinerários */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <span>Itinerários *</span>
          </h3>
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <input type="text" name="origem" value={currentItinerario.origem} onChange={handleItinerarioInputChange} className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.origem ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder="Origem *"/>
                {errors.origem && <span className="text-red-500 text-xs block mt-1">{errors.origem}</span>}
              </div>
              <div>
                <input type="text" name="destino" value={currentItinerario.destino} onChange={handleItinerarioInputChange} className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.destino ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} placeholder="Destino *"/>
                {errors.destino && <span className="text-red-500 text-xs block mt-1">{errors.destino}</span>}
              </div>
              <div>
                <input type="date" name="dataSaida" value={currentItinerario.dataSaida} onChange={handleItinerarioInputChange} className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dataSaida ? 'border-red-500 bg-red-50' : 'border-gray-300'} text-gray-700`}/>
                {errors.dataSaida && <span className="text-red-500 text-xs block mt-1">{errors.dataSaida}</span>}
              </div>
              <input type="text" name="ciaAerea" value={currentItinerario.ciaAerea} onChange={handleItinerarioInputChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Cia Aérea"/>
              <input type="text" name="voo" value={currentItinerario.voo} onChange={handleItinerarioInputChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Número do Voo"/>
              <input type="text" name="horarios" value={currentItinerario.horarios} onChange={handleItinerarioInputChange} className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Horários (Ex: 08:00 - 10:00)"/>
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:grid-cols-3 mt-2 mb-3">
              <label htmlFor="incluirVolta" className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="incluirVolta"
                  name="incluirVolta"
                  checked={incluirVolta}
                  onChange={handleIncluirVoltaChange}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Haverá volta? (duplicar invertendo origem/destino)</span>
              </label>
            </div>

            {/* Campo Data da Volta - Condicional */}
            {incluirVolta && (
              <div className="mt-4 mb-4 md:w-1/3"> {/* Ajuste o md:w-1/3 para alinhar se necessário, ou use grid */}
                <label htmlFor="dataVolta" className="block text-sm font-medium text-gray-700 mb-1">Data da Volta *</label>
                <input
                  type="date"
                  name="dataVolta"
                  id="dataVolta"
                  value={dataVolta}
                  onChange={(e) => setDataVolta(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.dataVolta ? 'border-red-500 bg-red-50' : 'border-gray-300'} text-gray-700`}
                />
                {errors.dataVolta && <span className="text-red-500 text-xs block mt-1">{errors.dataVolta}</span>}
              </div>
            )}
            
            <button 
              onClick={() => {
                onAddItinerario(incluirVolta, dataVolta); // Passa o estado de incluirVolta e a dataVolta
                // Reseta os controles locais do formulário para a próxima adição de trecho
                setIncluirVolta(false);
                setDataVolta('');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <span>Adicionar Trecho</span>
            </button>
          </div>
          
          {/* Lista de Itinerários Adicionados */}
          {currentPassageiro.itinerarios && currentPassageiro.itinerarios.map((itinerario, index) => (
            <div key={itinerario.id || index} className="bg-white rounded-xl p-4 mb-2 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 text-sm flex-wrap">
                  <span className="font-medium text-blue-600">#{index + 1}</span>
                  <span>{itinerario.origem} → {itinerario.destino}</span>
                  <span className="text-gray-500">{itinerario.dataSaida ? new Date(itinerario.dataSaida + 'T00:00:00-03:00').toLocaleDateString('pt-BR') : 'N/A'}</span>
                  {itinerario.ciaAerea && <span className="text-gray-500">{itinerario.ciaAerea}</span>}
                  {itinerario.voo && <span className="text-gray-500">Voo {itinerario.voo}</span>}
                  {itinerario.horarios && <span className="text-gray-500">{itinerario.horarios}</span>}
                </div>
              </div>
              <button onClick={() => onRemoveItinerario(itinerario.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors" title="Remover Trecho">
                <span>X</span>
              </button>
            </div>
          ))}
          {errors.itinerarios && <div className="flex items-center space-x-1 mt-2 text-red-500 text-sm"><span>{errors.itinerarios}</span></div>}
        </div>

        {/* Seção de Anexos do Passageiro */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <span>Anexos do Passageiro</span>
            </h3>
            <div>
                <label
                    htmlFor="passenger-attachment-upload"
                    className="w-full flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Adicionar anexos para este passageiro</p>
                        <p className="text-xs text-gray-500">Anexe a Imagem</p>
                    </div>
                    <input
                        id="passenger-attachment-upload"
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg,.pdf,.doc,.doc,.docx"
                        onChange={handleFileChangeForPassenger}
                        className="sr-only"
                    />
                </label>
            </div>

            {currentPassageiro.anexos && currentPassageiro.anexos.length > 0 && (
                <div className="mt-4">
                    <ul className="space-y-2">
                        {currentPassageiro.anexos.map((file, index) => (
                            <li
                                key={`${file.name}-${index}`}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                            >
                                <div className="flex items-center space-x-2 overflow-hidden">
                                    {getFileIcon(file.type)}
                                    <span className="text-sm text-gray-700 truncate" title={file.name}>
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        ({(file.size / 1024).toFixed(2)} KB)
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleRemoveFileForPassenger(file.name)}
                                    className="p-1 hover:bg-red-100 rounded-md transition-colors"
                                    title="Remover anexo"
                                >
                                    <span>X</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

        {/* Botões de Ação do Formulário */}
        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={onSavePassageiro} className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg">
            <span>{isEditing ? 'Salvar Alterações' : 'Salvar Passageiro'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerForm;
