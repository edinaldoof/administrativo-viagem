// src/components/RequestList.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllRequests, getRequestsByWebId } from '../services/requestService';
import { Search, Loader } from 'lucide-react';

const RequestList = ({ onViewDetails }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = searchTerm 
        ? await getRequestsByWebId(searchTerm) 
        : await getAllRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Requisições Salvas</h2>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por WEB ID..."
            className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-gray-200"
          />
          <button type="submit" className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Search size={20} />
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <p className="ml-4 text-gray-600 dark:text-gray-300">Buscando requisições...</p>
        </div>
      )}

      {error && <p className="text-center text-red-500 py-10">{error}</p>}

      {!loading && !error && (
        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-700 rounded-2xl p-4 shadow-md border border-gray-200 dark:border-slate-600">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg text-blue-700 dark:text-blue-400">WEB ID: {req.webId}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Projeto: {req.contaProjeto}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Salvo em: {req.savedAt?.toDate().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold dark:text-gray-200">{req.passengersData?.length || 0} Passageiro(s)</p>
                     <button 
                        onClick={() => onViewDetails(req)} 
                        className="text-sm text-blue-500 dark:text-blue-400 hover:underline mt-2"
                     >
                        Ver Detalhes
                     </button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t dark:border-slate-600">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Passageiros nesta requisição:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                    {req.passengersData?.map(p => <li key={p.id}>{p.nome} ({p.cpf})</li>)}
                  </ul>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">Nenhuma requisição encontrada.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestList;
