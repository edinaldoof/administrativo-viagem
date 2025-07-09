// src/components/PassengerList.js
import React from 'react';
import { Users } from 'lucide-react';
import PassengerListItem from './PassengerListItem'; // Importando o componente do item

const PassengerList = ({ passageiros, onEditPassageiro, onDuplicatePassageiro, onRemovePassageiro }) => {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <Users className="w-5 h-5 text-indigo-600" />
        <span>Passageiros ({passageiros ? passageiros.length : 0})</span>
      </h3>
      <div className="space-y-3">
        {passageiros && passageiros.length > 0 ? (
          passageiros.map((passageiro) => (
            <PassengerListItem
              key={passageiro.id}
              passageiro={passageiro}
              onEdit={onEditPassageiro}
              onDuplicate={onDuplicatePassageiro}
              onRemove={onRemovePassageiro}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum passageiro adicionado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerList;