// src/components/Header.js
import React from 'react';
import { Moon, Sun, Download, FileImage, FileText, FileSpreadsheet, UploadCloud, Plane, List, Users, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const Header = ({
  onExportPNG,
  onExportPDF,
  onExportExcel,
  onImportPDF,
  isExportDisabled,
  showImport,
  setCurrentView,
  currentView,
  resetRequest,
  toggleTheme,
  theme
}) => {
  const handleCreateNew = () => {
    resetRequest();
    setCurrentView('creating');
  };

  const NavButton = ({ view, label, icon: Icon }) => (
    <Button
      variant={currentView === view ? "default" : "ghost"}
      onClick={() => setCurrentView(view)}
      className="flex items-center gap-2"
    >
      <Icon size={16} />
      {label}
    </Button>
  );

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between flex-wrap gap-y-3">
          {/* Left Side: Title */}
          <div className="flex items-center space-x-4">
             <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-md">
               <Plane className="text-white h-6 w-6" />
             </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Sistema de Viagens
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Administrativo Fadex</p>
            </div>
          </div>

          {/* Right Side: Actions & Navigation */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Navigation Buttons */}
            <Button
              variant={currentView === 'creating' ? "default" : "ghost"}
              onClick={handleCreateNew}
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Nova Requisição
            </Button>
            <NavButton view="viewingRequests" label="Requisições" icon={List} />
            <NavButton view="viewingPassengers" label="Passageiros" icon={Users} />
            
            <div className="border-l h-8 mx-2 border-gray-300 dark:border-gray-600"></div>

            {/* Contextual Action Buttons */}
            {currentView === 'creating' && (
              <>
                {showImport && (
                  <Button
                    variant="outline"
                    onClick={onImportPDF}
                    className="flex items-center gap-2"
                  >
                    <UploadCloud size={16} />
                    Importar PDF
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={isExportDisabled} className="flex items-center gap-2">
                      <Download size={16} />
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onExportPNG} className="flex items-center gap-2 cursor-pointer">
                      <FileImage size={16} />
                      <span>PNG</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExportPDF} className="flex items-center gap-2 cursor-pointer">
                      <FileText size={16} />
                      <span>PDF</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExportExcel} className="flex items-center gap-2 cursor-pointer">
                      <FileSpreadsheet size={16} />
                      <span>Excel</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            <Button onClick={toggleTheme} variant="ghost" size="icon" className="ml-2">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
