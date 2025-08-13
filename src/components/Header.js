// src/components/Header.js
import React from 'react';
import { Moon, Sun, Download, FileImage, FileText, FileSpreadsheet, UploadCloud, Plane, List, Users, PlusCircle, BarChart2, Eraser } from 'lucide-react';
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
            <NavButton view="creating" label="Nova Requisição" icon={PlusCircle} />
            <NavButton view="viewingRequests" label="Requisições" icon={List} />
            <NavButton view="viewingPassengers" label="Passageiros" icon={Users} />
            <NavButton view="reports" label="Relatórios" icon={BarChart2} />
            
            <div className="border-l h-8 mx-2 border-gray-300 dark:border-gray-600"></div>

            {/* Contextual Action Buttons */}
            {currentView === 'creating' && (
              <>
                {showImport && (
                  <button
                    onClick={onImportPDF}
                    className="
                      group relative px-4 py-2.5 
                      bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30
                      hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/40 dark:hover:to-teal-900/40
                      border border-emerald-200/50 dark:border-emerald-800/50
                      hover:border-emerald-300 dark:hover:border-emerald-700
                      rounded-xl font-medium text-sm
                      text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300
                      transition-all duration-300 ease-out
                      hover:scale-105 active:scale-95
                      hover:shadow-lg hover:shadow-emerald-200/30 dark:hover:shadow-emerald-900/20
                      flex items-center gap-2 overflow-hidden
                    "
                    title="Importar arquivo PDF"
                  >
                    {/* Efeito de onda ao hover */}
                    <div className="
                      absolute inset-0 -translate-x-full group-hover:translate-x-0 
                      bg-gradient-to-r from-transparent via-emerald-200/20 dark:via-emerald-700/20 to-transparent
                      transition-transform duration-500 ease-out
                    "></div>
                    
                    {/* Ícone com animação */}
                    <UploadCloud 
                      size={16} 
                      className="
                        relative z-10 transition-all duration-300 
                        group-hover:-translate-y-0.5 group-hover:scale-110
                        group-active:-translate-y-1
                      " 
                    />
                    
                    {/* Texto */}
                    <span className="relative z-10 font-semibold">
                      Importar PDF
                    </span>
                  </button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={isExportDisabled} className="flex items-center gap-2" variant="outline">
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

                <button
                  onClick={resetRequest}
                  className="
                    group px-4 py-2.5 
                    bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30
                    hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/40 dark:hover:to-orange-900/40
                    border border-red-200/50 dark:border-red-800/50 
                    rounded-xl font-medium text-sm
                    text-red-600 dark:text-red-400
                    transition-all duration-300 
                    hover:scale-105 active:scale-95
                    hover:shadow-lg hover:shadow-red-200/30
                    flex items-center gap-2
                  "
                  title="Limpar todos os campos"
                >
                  <Eraser size={16} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-semibold">Limpar</span>
                </button>
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