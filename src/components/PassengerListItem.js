// src/components/PassengerListItem.js
import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { formatCPF, formatCurrency } from '../utils/utils';

const PassengerListItem = ({ passageiro, onEdit, onDuplicate, onRemove }) => {
  if (!passageiro) {
    return null;
  }

  const totalCustoPassageiro = (passageiro.itinerarios || []).reduce((acc, it) => {
    const quantidade = parseFloat(it.quantidade) || 0;
    const valorUnitario = parseFloat(it.valorUnitario) || 0;
    return acc + (quantidade * valorUnitario);
  }, 0);

  return (
    <AccordionItem value={passageiro.id} className="bg-white rounded-2xl border border-gray-200 px-4 shadow-md transition-all hover:border-blue-300">
      <AccordionTrigger className="text-left no-underline hover:no-underline py-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{passageiro.nome}</h4>
          <p className="text-sm text-gray-500">CPF: {formatCPF(passageiro.cpf)}</p>
        </div>
        <div className="text-right">
          <span className="font-semibold text-gray-700">{formatCurrency(totalCustoPassageiro)}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-2 pb-4">
        <div className="space-y-3">
          {/* Dados Pessoais */}
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Nascimento:</strong> {passageiro.dataNascimento}</p>
            {passageiro.email && <p><strong>Email:</strong> {passageiro.email}</p>}
            {passageiro.phone && <p><strong>Telefone:</strong> {passageiro.phone}</p>}
          </div>

          {/* Itinerários */}
          <div>
            <h5 className="text-sm font-semibold text-gray-700 mb-2 border-t pt-3">
              Itinerários ({passageiro.itinerarios?.length || 0})
            </h5>
            <div className="space-y-2 text-sm">
              {passageiro.itinerarios && passageiro.itinerarios.length > 0 ? (
                passageiro.itinerarios.map((it, index) => (
                  <div key={it.id || index} className="p-2 bg-gray-50 rounded-lg flex justify-between">
                    <div>
                      <span>{it.origem} → {it.destino}</span>
                      <span className="text-xs text-gray-500 block">
                        {it.dataSaida ? new Date(it.dataSaida + 'T03:00:00Z').toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                    </div>
                    <div className="font-medium text-gray-700">
                        {formatCurrency((it.quantidade || 1) * (it.valorUnitario || 0))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">Nenhum itinerário cadastrado.</p>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-2 pt-3 border-t">
            <button
              onClick={() => onEdit(passageiro)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
              title="Editar"
            >
              Editar
            </button>
            <button
              onClick={() => onDuplicate(passageiro)}
              className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
              title="Duplicar"
            >
              Duplicar
            </button>
            <button
              onClick={() => onRemove(passageiro.id)}
              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
              title="Remover"
            >
              Remover
            </button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default PassengerListItem;
