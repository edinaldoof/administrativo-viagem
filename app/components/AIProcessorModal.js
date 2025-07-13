// src/components/AIProcessorModal.js
import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, User, CreditCard, X, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { extractInfoFromPdf } from '../ai/flows/extract-info-flow';
import { formatCPF } from '../utils/utils';

const AIProcessorModal = ({ isOpen, onClose, onConfirm }) => {
  const [file, setFile] = useState(null);
  const [fileDataUri, setFileDataUri] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setProcessedData(null);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileDataUri(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      alert('Por favor, selecione um arquivo PDF.');
    }
  };

  const handleProcessClick = async () => {
    if (!file || !fileDataUri) {
      alert('Por favor, selecione um arquivo PDF para processar.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setProcessedData(null);

    try {
      const result = await extractInfoFromPdf({ pdfDataUri: fileDataUri });
      setProcessedData(result);
    } catch (e) {
      console.error("Erro ao processar com a IA:", e);
      
      // Lógica de feedback de erro aprimorada
      if (e.message && e.message.includes("API key not valid")) {
          setError("Erro de Configuração: A chave da API é inválida. Por favor, contate o administrador do sistema.");
      } else if (e instanceof SyntaxError) {
          // Acontece quando a IA retorna um JSON mal formatado
          setError("A IA retornou uma resposta em um formato inesperado. Por favor, tente novamente ou com outro arquivo.");
      } else {
          setError(`Falha ao extrair dados. Verifique se o arquivo não está corrompido e tente novamente.`);
      }

    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmClick = () => {
    onConfirm(processedData);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setFileDataUri('');
    setProcessedData(null);
    setIsProcessing(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <UploadCloud className="text-purple-600 w-7 h-7" />
            Processamento de PDF com IA
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-200 rounded-full">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
            onClick={() => fileInputRef.current.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="application/pdf"
            />
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="font-semibold text-gray-700">
              {file ? `Arquivo selecionado: ${file.name}` : 'Clique para selecionar um PDF'}
            </p>
            <p className="text-sm text-gray-500">Arraste e solte ou clique para fazer o upload</p>
          </div>

          {file && !processedData && !isProcessing && (
            <div className="text-center">
              <button
                onClick={handleProcessClick}
                disabled={!fileDataUri}
                className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:bg-purple-300"
              >
                {'Processar com IA'}
              </button>
            </div>
          )}

          {isProcessing && (
             <div className="text-center flex flex-col items-center justify-center p-4">
                <Loader className="animate-spin w-8 h-8 text-purple-600" />
                <p className="mt-3 text-gray-600 font-medium">Analisando o documento... A IA está trabalhando.</p>
              </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-800 rounded-lg p-4 text-sm flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                    <p className="font-bold">Ocorreu um erro:</p>
                    <p>{error}</p>
                </div>
            </div>
          )}

          {processedData && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-fade-in">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><CheckCircle className="text-green-500"/>Dados Extraídos</h3>
              
              <div className="space-y-4">
                {processedData.passengers?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><User size={18}/>Passageiros</h4>
                      <ul className="space-y-1 bg-white p-3 rounded-lg text-sm">
                        {processedData.passengers.map((p, index) => (
                           <li key={p.cpf || index}>{p.name} - {formatCPF(p.cpf)}</li>
                        ))}
                      </ul>
                    </div>
                )}
                
                {processedData.billing && (
                    <div>
                      <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><CreditCard size={18}/>Faturamento</h4>
                      <div className="text-sm bg-white p-3 rounded-lg grid grid-cols-2 gap-2">
                        <p><strong>Projeto:</strong> {processedData.billing.account || 'N/A'}</p>
                        <p><strong>CC:</strong> {processedData.billing.costCenter || 'N/A'}</p>
                        <p className="col-span-2"><strong>Descrição:</strong> {processedData.billing.description || 'N/A'}</p>
                      </div>
                    </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-4">
                 <button onClick={handleClose} className="px-6 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100">
                  Cancelar
                </button>
                <button onClick={handleConfirmClick} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 shadow-md">
                  Adicionar Dados ao Formulário
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIProcessorModal;
