// src/components/PassengerRegistry.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllPassengers } from '../services/passengerService.js';
import { getAllRequests } from '../services/requestService.js';
import { Loader, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCPF, formatCurrency } from '../utils/utils';

// Componente para exibir detalhes de uma requisição
const RequestDetail = ({ request }) => (
  <div className="mt-2 p-3 bg-blue-50 dark:bg-slate-800 rounded-lg text-xs">
    <p><strong>Projeto:</strong> {request.contaProjeto}</p>
    <p><strong>Data:</strong> {request.savedAt?.toDate().toLocaleDateString('pt-BR')}</p>
    <p><strong>Descrição:</strong> {request.descricao}</p>
    <div className="mt-2 pt-2 border-t border-blue-200 dark:border-slate-700">
      <p className="font-semibold">Passageiros nesta requisição:</p>
      <ul className="list-disc list-inside">
        {request.passengersData?.map(p => <li key={p.id || p.cpf}>{p.nome}</li>)}
      </ul>
    </div>
  </div>
);

// Componente para cada item da lista de passageiros
const PassengerRegistryItem = ({ passenger, onDetailsToggle, isDetailsOpen }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleRequestClick = (request) => {
    setSelectedRequest(prev => (prev?.id === request.id ? null : request));
  };
  
  return (
    <div className="bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-slate-600 transition-all">
      <div className="flex justify-between items-start cursor-pointer" onClick={() => onDetailsToggle(passenger.id)}>
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">{passenger.nome}</p>
          <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>CPF: {passenger.cpf}</span>
            <span>Nascimento: {passenger.dataNascimento}</span>
          </div>
        </div>
        <button className="p-1">
          {isDetailsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      {isDetailsOpen && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-600 animate-fade-in">
          {(passenger.requests && passenger.requests.length > 0) ? (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Requisições Vinculadas (WEB IDs):</p>
              <div className="flex flex-wrap gap-2">
                {passenger.requests.map(req => (
                  <button 
                    key={req.id} 
                    onClick={() => handleRequestClick(req)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${selectedRequest?.id === req.id ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-200'}`}
                  >
                    {req.webId}
                  </button>
                ))}
              </div>
              {selectedRequest && <RequestDetail request={selectedRequest} />}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Nenhuma requisição encontrada para este passageiro.</p>
          )}
        </div>
      )}
    </div>
  );
};


const PassengerRegistry = () => {
  const [allPassengers, setAllPassengers] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDetails, setOpenDetails] = useState({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const passengerData = await getAllPassengers();
      const requestData = await getAllRequests();
      setAllPassengers(passengerData);
      setAllRequests(requestData);
      // setError("A funcionalidade de Catálogo de Passageiros está desativada nesta versão.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const passengersWithRequests = useMemo(() => {
    if (allPassengers.length === 0 || allRequests.length === 0) {
      return allPassengers;
    }
    return allPassengers.map(passenger => {
      const linkedRequests = allRequests.filter(req => 
        (req.passengerIds || []).includes(passenger.id)
      );
      return { ...passenger, requests: linkedRequests };
    });
  }, [allPassengers, allRequests]);

  const filteredPassengers = useMemo(() => {
    if (!searchTerm) return passengersWithRequests;
    const lowercasedFilter = searchTerm.toLowerCase();

    return passengersWithRequests.filter(p => {
      const nameMatch = p.nome.toLowerCase().includes(lowercasedFilter);
      const cpfMatch = p.cpf.replace(/\D/g, '').includes(lowercasedFilter);
      const webIdMatch = (p.requests || []).some(req => req.webId?.toLowerCase().includes(lowercasedFilter));
      
      return nameMatch || cpfMatch || webIdMatch;
    });
  }, [searchTerm, passengersWithRequests]);

  const handleToggleDetails = (passengerId) => {
    setOpenDetails(prev => ({ ...prev, [passengerId]: !prev[passengerId] }));
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Catálogo de Passageiros</h2>
        <div className="relative flex-grow sm:flex-grow-0">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
           <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF ou WEB ID..."
            className="w-full sm:w-64 p-2 pl-10 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-gray-200"
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <p className="ml-4 text-gray-600 dark:text-gray-300">Carregando passageiros...</p>
        </div>
      )}

      {error && <p className="text-center text-red-500 py-10">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {filteredPassengers.length > 0 ? (
            filteredPassengers.map(p => (
              <PassengerRegistryItem 
                key={p.id} 
                passenger={p}
                onDetailsToggle={handleToggleDetails}
                isDetailsOpen={!!openDetails[p.id]}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">
              {searchTerm ? 'Nenhum passageiro encontrado com os critérios de busca.' : 'Nenhum passageiro cadastrado no sistema.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PassengerRegistry;
