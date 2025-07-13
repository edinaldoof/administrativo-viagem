// src/components/AIProcessorScreen.js
import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { extractDataFromPdfWithGemini } from '../ai/geminiService';
import ConfirmationScreen from './ConfirmationScreen';

// Configuração do worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const AIProcessorScreen = ({ onConfirm, onCancel }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const extractTextFromPdf = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const loadingTask = pdfjsLib.getDocument({ data: event.target.result });
          const pdf = await loadingTask.promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ');
          }
          resolve(text);
        } catch (e) {
          reject(new Error('Falha ao ler o arquivo PDF.'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setProcessedData(null);
      setError('');
    } else {
      setError('Por favor, selecione um arquivo PDF.');
    }
  };

  const handleProcessClick = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo PDF para processar.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setProcessedData(null);

    try {
      const text = await extractTextFromPdf(file);
      const result = await extractDataFromPdfWithGemini(text);
      setProcessedData(result);
    } catch (e) {
      console.error("Erro ao processar com a IA:", e);
      setError(e.message || 'Falha ao extrair dados. Verifique o arquivo e tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Se os dados foram processados, mostra a tela de confirmação
  if (processedData) {
    return (
      <ConfirmationScreen
        extractedData={processedData}
        onConfirm={onConfirm}
        onCancel={() => {
          setProcessedData(null); // Limpa os dados para permitir um novo upload
          setFile(null);
        }}
      />
    );
  }

  // Tela inicial de upload e processamento
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          Processamento de PDF com IA
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-200 rounded-full">
          <span>X</span>
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
          <p className="font-semibold text-gray-700">
            {file ? `Arquivo selecionado: ${file.name}` : 'Clique para selecionar um PDF'}
          </p>
          <p className="text-sm text-gray-500">Arraste e solte ou clique para fazer o upload</p>
        </div>

        {file && !isProcessing && (
          <div className="text-center">
            <button
              onClick={handleProcessClick}
              disabled={!file}
              className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:bg-purple-300"
            >
              {'Processar com IA'}
            </button>
          </div>
        )}

        {isProcessing && (
           <div className="text-center flex flex-col items-center justify-center p-4">
              <p className="mt-3 text-gray-600 font-medium">Analisando o documento... A IA está trabalhando.</p>
            </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-800 rounded-lg p-4 text-sm flex items-center space-x-3">
              <div>
                  <p className="font-bold">Ocorreu um erro:</p>
                  <p>{error}</p>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIProcessorScreen;
