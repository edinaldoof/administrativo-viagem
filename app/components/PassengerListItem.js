// src/components/PassengerListItem.js
import React from 'react';
import { Edit3, Copy, Trash2, Users } from 'lucide-react'; // Adicionado Users para o caso de 0 trechos

const PassengerListItem = ({ passageiro, onEdit, onDuplicate, onRemove }) => {
  if (!passageiro) {
    return null; // Ou alguma representação de item vazio/carregando
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-800">{passageiro.nome}</h4>
          <p className="text-sm text-gray-500">CPF: {passageiro.cpf}</p>
          <p className="text-sm text-gray-500">Nascimento: {passageiro.dataNascimento}</p>
        </div>
        <div className="flex space-x-1 flex-shrink-0">
          <button
            onClick={() => onEdit(passageiro)}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit3 className="w-4 h-4 text-blue-500" />
          </button>
          <button
            onClick={() => onDuplicate(passageiro)}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
            title="Duplicar"
          >
            <Copy className="w-4 h-4 text-green-500" />
          </button>
          <button
            onClick={() => onRemove(passageiro.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            title="Remover"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-400">
        {passageiro.itinerarios && passageiro.itinerarios.length > 0
          ? `${passageiro.itinerarios.length} trecho(s)`
          : "Nenhum trecho adicionado"}
      </div>
    </div>
  );
};

export default PassengerListItem;
