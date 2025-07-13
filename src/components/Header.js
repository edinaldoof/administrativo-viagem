// src/components/Header.js
import React from 'react';

const Header = ({
  onExportPNG,
  onExportPDF,
  onExportExcel,
  onImportPDF,
  isExportDisabled,
  showImport,
  setCurrentView,
  currentView,
  resetRequest
}) => {
  const handleCreateNew = () => {
    resetRequest();
    setCurrentView('creating');
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              {/* Plane Icon Removed */}
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sistema de Viagens
              </h1>
              <p className="text-gray-600 font-medium">Administrativo Fadex</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             {/* Botões de Navegação */}
             <button
              onClick={handleCreateNew}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentView === 'creating' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Nova Requisição
            </button>
            <button
              onClick={() => setCurrentView('viewingRequests')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentView === 'viewingRequests' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Requisições Salvas
            </button>
             <button
              onClick={() => setCurrentView('viewingPassengers')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentView === 'viewingPassengers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Passageiros
            </button>
            
            <div className="border-l h-8 mx-2"></div>

            {/* Botões de Ação Contextuais */}
            {currentView === 'creating' && (
              <>
                {showImport && (
                  <button
                    onClick={onImportPDF}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <span>Importar PDF</span>
                  </button>
                )}
                <button
                  onClick={onExportPNG}
                  disabled={isExportDisabled}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>PNG</span>
                </button>
                <button
                  onClick={onExportPDF}
                  disabled={isExportDisabled}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>PDF</span>
                </button>
                <button
                  onClick={onExportExcel}
                  disabled={isExportDisabled}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span>Excel</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
