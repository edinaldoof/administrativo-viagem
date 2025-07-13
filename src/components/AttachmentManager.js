// src/components/AttachmentManager.js
import React from 'react';

const AttachmentManager = ({ attachments, onAttachmentsChange }) => {
  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    // Adicionar apenas arquivos que ainda não estão na lista (para evitar duplicatas exatas na mesma seleção)
    const uniqueNewFiles = newFiles.filter(
      (file) => !attachments.some((existingFile) => existingFile.name === file.name && existingFile.size === file.size)
    );
    onAttachmentsChange([...attachments, ...uniqueNewFiles]);
    event.target.value = null; // Limpar o input para permitir selecionar o mesmo arquivo novamente após remoção
  };

  const handleRemoveFile = (fileNameToRemove) => {
    onAttachmentsChange(attachments.filter(file => file.name !== fileNameToRemove));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <span>IMG</span>;
    }
    if (fileType === 'application/pdf') {
      return <span>PDF</span>;
    }
    // Adicione mais tipos se necessário
    return <span>FILE</span>;
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
        <span>Anexos</span>
      </h2>

      <div>
        <label
          htmlFor="attachment-upload"
          className="w-full flex items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
        >
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC, DOCX</p>
          </div>
          <input
            id="attachment-upload"
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="sr-only" // Esconde o input padrão
          />
        </label>
      </div>

      {attachments && attachments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Arquivos Selecionados:</h3>
          <ul className="space-y-2">
            {attachments.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  {getFileIcon(file.type)}
                  <span className="text-sm text-gray-700 truncate" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveFile(file.name)}
                  className="p-1 hover:bg-red-100 rounded-md transition-colors"
                  title="Remover anexo"
                >
                  <span>X</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AttachmentManager;
