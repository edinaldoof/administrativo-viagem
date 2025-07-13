// src/components/BillingForm.js
import React from 'react';
import { CreditCard } from 'lucide-react';

const BillingForm = ({ faturamento, onFaturamentoChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFaturamentoChange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
        <CreditCard className="w-6 h-6 text-purple-600" />
        <span>Informações de Faturamento</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contaProjeto" className="block text-sm font-medium text-gray-700 mb-2">Conta do Projeto</label>
          <input
            type="text"
            name="contaProjeto"
            id="contaProjeto"
            value={faturamento.contaProjeto}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Ex: CONT 31/2024 - IFMA - PROJETO..."
          />
        </div>
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <input
            type="text"
            name="descricao"
            id="descricao"
            value={faturamento.descricao}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Descrição do projeto"
          />
        </div>
        <div>
          <label htmlFor="cc" className="block text-sm font-medium text-gray-700 mb-2">CC</label>
          <input
            type="text"
            name="cc"
            id="cc"
            value={faturamento.cc}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Ex: 12.071-5"
          />
        </div>
        <div>
          <label htmlFor="webId" className="block text-sm font-medium text-gray-700 mb-2">WEB ID</label>
          <input
            type="text"
            name="webId"
            id="webId"
            value={faturamento.webId}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Ex: WEB 7735/2025"
          />
        </div>
      </div>
    </div>
  );
};

export default BillingForm;
