// src/components/PassengerList.js
import React from 'react';
import PassengerListItem from './PassengerListItem';
import { Accordion } from '@/components/ui/accordion';

const PassengerList = ({ passageiros, onEditPassageiro, onDuplicatePassageiro, onRemovePassageiro }) => {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <span>Passageiros ({passageiros ? passageiros.length : 0})</span>
      </h3>
      
      {passageiros && passageiros.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2">
          {passageiros.map((passageiro) => (
            <PassengerListItem
              key={passageiro.id}
              passageiro={passageiro}
              onEdit={onEditPassageiro}
              onDuplicate={onDuplicatePassageiro}
              onRemove={onRemovePassageiro}
            />
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum passageiro adicionado</p>
        </div>
      )}
    </div>
  );
};

export default PassengerList;
