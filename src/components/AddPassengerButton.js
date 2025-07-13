// src/components/AddPassengerButton.js
import React from 'react';

const AddPassengerButton = ({ onClick }) => {
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
      >
        <span className="text-lg">Adicionar Novo Passageiro</span>
      </button>
    </div>
  );
};

export default AddPassengerButton;
