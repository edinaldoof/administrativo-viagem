// src/components/Preview.js
import React from 'react';
import { Building2, Plane } from 'lucide-react';
import { formatDateToYYYYMMDD } from '@/utils/utils.js';

const Preview = React.forwardRef(({ passageiros, faturamento }, ref) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');

  return (
    <div ref={ref} className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <Building2 className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Administrativo Fadex</h2>
        </div>
        <p className="text-gray-600">Solicitação de Passagens Aéreas</p>
        <p className="text-sm text-gray-500">Data: {currentDate}</p>
      </div>

      {passageiros && passageiros.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 border-b pb-2">Passageiros e Itinerários</h3>
          {passageiros.map((passageiro, pIndex) => (
            <div key={passageiro.id || pIndex} className="text-sm"> {/* Adicionado pIndex como fallback para key */}
              <div className="font-medium text-gray-800 mb-1">
                {pIndex + 1}. {passageiro.nome}
              </div>
              <div className="text-gray-600 mb-2">
                CPF: {passageiro.cpf} | Nascimento: {passageiro.dataNascimento}
              </div>
              {passageiro.itinerarios && passageiro.itinerarios.map((itinerario, iIndex) => (
                <div key={itinerario.id || iIndex} className="ml-4 mb-1 text-gray-700"> {/* Adicionado iIndex como fallback para key */}
                  • {itinerario.origem} → {itinerario.destino} ({itinerario.dataSaida ? new Date(itinerario.dataSaida + 'T00:00:00-03:00').toLocaleDateString('pt-BR') : 'N/A'}) {/* Ajuste para exibir data local */}
                  {itinerario.ciaAerea && ` - ${itinerario.ciaAerea}`}
                  {itinerario.voo && ` ${itinerario.voo}`}
                  {itinerario.horarios && ` (${itinerario.horarios})`}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}

      {faturamento && (faturamento.contaProjeto || faturamento.descricao || faturamento.cc || faturamento.webId) && ( // Adicionado faturamento.descricao
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-semibold text-gray-800 mb-2">Faturamento</h3>
          <div className="text-sm text-gray-700 space-y-1">
            {faturamento.contaProjeto && <div>Projeto: {faturamento.contaProjeto}</div>}
            {faturamento.descricao && <div>Descrição: {faturamento.descricao}</div>}
            {faturamento.cc && <div>CC: {faturamento.cc}</div>}
            {faturamento.webId && <div>WEB ID: {faturamento.webId}</div>}
          </div>
        </div>
      )}

      {(!passageiros || passageiros.length === 0) && 
       (!faturamento || (!faturamento.contaProjeto && !faturamento.descricao && !faturamento.cc && !faturamento.webId)) && (
        <div className="text-center py-8 text-gray-500">
          <Plane className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Adicione passageiros e informações de faturamento para visualizar a solicitação</p>
        </div>
      )}
    </div>
  );
});

Preview.displayName = 'Preview';
export default Preview;
