
// src/components/Preview.js
import React from 'react';
import { formatCurrency } from '../utils/utils';
import { Plane, Bus, Briefcase, RefreshCw } from 'lucide-react';

const Preview = React.forwardRef(({ passageiros, faturamento }, ref) => {
  const currentDate = new Date().toLocaleDateString('pt-BR');

  const totalGeral = passageiros.reduce((totalReq, passageiro) => {
    const totalPassageiro = (passageiro.itinerarios || []).reduce((totalIt, it) => {
      const q = parseFloat(it.quantidade) || 0;
      const v = parseFloat(it.valorUnitario) || 0;
      return totalIt + (q * v);
    }, 0);
    return totalReq + totalPassageiro;
  }, 0);

  const renderItineraryDetails = (itinerary) => {
    return (
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="flex items-center gap-1">
                {itinerary.tripType === 'Aéreo' ? <Plane size={12} /> : <Bus size={12} />}
                {itinerary.tripType || 'N/A'}
            </span>
            <span className="flex items-center gap-1">
                <Briefcase size={12} />
                {itinerary.baggage || 'N/A'}
            </span>
            {itinerary.isRoundTrip && (
                <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                    <RefreshCw size={12} />
                    Ida e Volta
                </span>
            )}
        </div>
    );
  };

  return (
    // Card principal com sombra e bordas arredondadas
    <div ref={ref} className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700 font-sans">
      {/* Cabeçalho */}
      <div className="text-center mb-8 border-b border-gray-200 dark:border-slate-700 pb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Administrativo Fadex</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Solicitação de Passagens</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Data de Emissão: {currentDate}</p>
      </div>

      {/* Seção de Faturamento */}
      {faturamento && (faturamento.contaProjeto || faturamento.descricao || faturamento.cc || faturamento.webId) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            Informações de Faturamento
          </h3>
          <div className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-6 text-sm grid grid-cols-2 gap-x-8 gap-y-4">
            {faturamento.contaProjeto && (
              <div className="col-span-2">
                <p className="font-medium text-gray-500 dark:text-gray-400">Projeto</p>
                <p className="text-gray-800 dark:text-gray-100">{faturamento.contaProjeto}</p>
              </div>
            )}
             {faturamento.descricao && (
              <div className="col-span-2">
                <p className="font-medium text-gray-500 dark:text-gray-400">Descrição</p>
                <p className="text-gray-800 dark:text-gray-100">{faturamento.descricao}</p>
              </div>
            )}
            {faturamento.cc && (
              <div>
                <p className="font-medium text-gray-500 dark:text-gray-400">Conta corrente do projeto</p>
                <p className="text-gray-800 dark:text-gray-100">{faturamento.cc}</p>
              </div>
            )}
            {faturamento.webId && (
              <div>
                <p className="font-medium text-gray-500 dark:text-gray-400">WEB ID</p>
                <p className="text-gray-800 dark:text-gray-100">{faturamento.webId}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seção de Passageiros */}
      {passageiros && passageiros.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
             Passageiros e Itinerários
          </h3>
          <div className="space-y-6">
            {passageiros.map((passageiro, pIndex) => {
               const totalPassageiro = (passageiro.itinerarios || []).reduce((total, it) => {
                  const q = parseFloat(it.quantidade) || 0;
                  const v = parseFloat(it.valorUnitario) || 0;
                  return total + (q * v);
                }, 0);

              return (
              <div key={passageiro.id || pIndex} className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl p-6 overflow-hidden">
                {/* Dados do Passageiro */}
                <div className="pb-4 border-b border-gray-100 dark:border-slate-600 mb-4 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-base">{passageiro.nome}</p>
                    <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>CPF: {passageiro.cpf}</span>
                      <span>Nasc: {passageiro.dataNascimento}</span>
                    </div>
                    {passageiro.email && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email: {passageiro.email}</p>}
                    {passageiro.phone && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Telefone: {passageiro.phone}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Passageiro</p>
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(totalPassageiro)}</p>
                  </div>
                </div>

                {/* Itinerários */}
                <div className="space-y-4">
                  {passageiro.itinerarios && passageiro.itinerarios.length > 0 ? (
                    passageiro.itinerarios.map((itinerario, iIndex) => {
                      const totalItinerario = (parseFloat(itinerario.quantidade) || 0) * (parseFloat(itinerario.valorUnitario) || 0);
                      return (
                      <div key={itinerario.id || iIndex} className="text-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-200 font-medium">
                               <span>{itinerario.origem}</span>
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-1-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>
                               <span>{itinerario.destino}</span>
                            </div>
                             <div className="font-medium text-gray-800 dark:text-gray-100">
                                {formatCurrency(totalItinerario)}
                             </div>
                        </div>
                         <div className="text-xs text-gray-500 dark:text-gray-400 pl-1 mt-1 flex justify-between">
                          <div>
                            <span>{itinerario.dataSaida ? new Date(itinerario.dataSaida + 'T03:00:00Z').toLocaleDateString('pt-BR') : 'N/A'}</span>
                            {itinerario.ciaAerea && <span className="mx-1">|</span>}
                            {itinerario.ciaAerea && <span>{itinerario.ciaAerea} {itinerario.voo}</span>}
                            {itinerario.horarios && <span className="mx-1">|</span>}
                            {itinerario.horarios && <span>({itinerario.horarios})</span>}
                          </div>
                          <div>
                            {itinerario.quantidade} x {formatCurrency(itinerario.valorUnitario)}
                          </div>
                        </div>
                        {renderItineraryDetails(itinerario)}
                      </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-400 italic">Nenhum itinerário cadastrado.</p>
                  )}
                </div>
              </div>
            )})}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-gray-200 dark:border-slate-600 flex justify-end items-center">
            <span className="text-lg font-semibold text-gray-600 dark:text-gray-300 mr-4">Total Geral:</span>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalGeral)}</span>
          </div>

        </div>
      ) : null}

      {/* Fallback para quando não há dados */}
      {(!passageiros || passageiros.length === 0) &&
       (!faturamento || (!faturamento.contaProjeto && !faturamento.descricao && !faturamento.cc && !faturamento.webId)) && (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p>Adicione passageiros e informações de faturamento para visualizar a solicitação.</p>
        </div>
      )}
    </div>
  );
});

export default Preview;
