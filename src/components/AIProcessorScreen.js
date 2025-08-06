import React, { useState } from 'react';

const ConfirmationScreen = ({ extractedData, onConfirm, onCancel }) => {
  if (!extractedData) return null;

  const { title, billing, passengers } = extractedData;

  const renderBillingInfo = () => (
    <>
      <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">Informações Globais</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 p-4 bg-gray-50 rounded-lg text-sm">
        {title && <p className="col-span-2"><strong>Título:</strong> {title}</p>}
        {billing?.account && <p><strong>Conta do Projeto:</strong> {billing.account}</p>}
        {billing?.costCenter && <p><strong>Centro de Custo:</strong> {billing.costCenter}</p>}
        {billing?.webId && <p><strong>Web ID:</strong> {billing.webId}</p>}
        {billing?.description && <p className="col-span-2"><strong>Justificativa:</strong> {billing.description}</p>}
      </div>
    </>
  );

  const renderPassengerInfo = () => (
    <>
      <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
        Passageiros Encontrados ({passengers?.length || 0})
      </h3>
      <div className="space-y-4">
        {(passengers || []).map((passenger, pIndex) => (
          <div key={pIndex} className="p-4 border rounded-lg bg-white shadow-sm">
            <h4 className="font-bold text-lg text-blue-700 mb-2">{passenger.name || 'Beneficiário não identificado'}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm mb-3">
              <p><strong>CPF:</strong> {passenger.cpf || 'N/A'}</p>
              <p><strong>Nascimento:</strong> {passenger.birthDate || 'N/A'}</p>
              <p><strong>Email:</strong> {passenger.email || 'N/A'}</p>
              <p><strong>Telefone:</strong> {passenger.phone || 'N/A'}</p>
            </div>
            
            <h5 className="font-semibold text-md text-gray-600 mt-3 mb-2">Itinerário(s)</h5>
            <div className="space-y-2">
              {(passenger.itinerary || []).map((it, iIndex) => (
                <div key={iIndex} className="p-3 bg-gray-50 rounded text-sm">
                  <p><strong>Trajeto:</strong> {it.origin} → {it.destination}</p>
                  <p><strong>Partida:</strong> {it.departureDate || 'N/A'}</p>
                  {it.returnDate && <p><strong>Retorno:</strong> {it.returnDate}</p>}
                  <p><strong>Voo:</strong> {it.ciaAerea || ''} {it.voo || ''} - {it.horarios || 'N/A'}</p>
                  <p><strong>Bagagem:</strong> {it.baggage || 'Não especificado'}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Confirme os Dados Importados</h2>
      
      {billing && renderBillingInfo()}
      
      {passengers && passengers.length > 0 && renderPassengerInfo()}

      {!passengers?.length && (
        <p className="text-center text-gray-500 py-8">Nenhum passageiro foi detectado no documento.</p>
      )}

      <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
        <button onClick={onCancel} className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
          Cancelar
        </button>
        <button onClick={() => onConfirm(extractedData)} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" disabled={!passengers || passengers.length === 0}>
          Confirmar e Usar Dados
        </button>
      </div>
    </div>
  );
};

export default ConfirmationScreen;