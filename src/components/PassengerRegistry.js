// src/components/PassengerRegistry.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllPassengers } from '../services/passengerService';
import { Loader } from 'lucide-react';

const PassengerRegistry = () => {
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPassengers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllPassengers();
      setPassengers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPassengers();
  }, [fetchPassengers]);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Catálogo de Passageiros</h2>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader className="animate-spin h-8 w-8 text-blue-600" />
          <p className="ml-4 text-gray-600">Carregando passageiros...</p>
        </div>
      )}

      {error && <p className="text-center text-red-500 py-10">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {passengers.length > 0 ? (
            passengers.map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
                <p className="font-semibold text-gray-800">{p.nome}</p>
                <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                  <span>CPF: {p.cpf}</span>
                  <span>Nascimento: {p.dataNascimento}</span>
                  {p.email && <span>Email: {p.email}</span>}
                  {p.phone && <span>Telefone: {p.phone}</span>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">Nenhum passageiro cadastrado no sistema.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PassengerRegistry;
