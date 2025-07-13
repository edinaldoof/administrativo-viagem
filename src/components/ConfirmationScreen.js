import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ConfirmationScreen = ({ extractedData, onConfirm, onCancel }) => {
  const [showOtherInfo, setShowOtherInfo] = useState(false);

  if (!extractedData) return null;

  const {
    requisicao_numero,
    data_emissao,
    centro_custo,
    solicitante,
    observacao,
    total_geral_requisicao,
    itens,
    dados_beneficiario,
    dados_viagem,
    outras_informacoes,
  } = extractedData;

  // Função auxiliar para formatar chaves (snake_case -> Title Case)
  const formatKey = (key) => {
    return key.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Confirme os Dados Importados</h2>
      
      {/* Informações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
        <div><p><strong>Nº Requisição:</strong> {requisicao_numero || 'N/A'}</p></div>
        <div><p><strong>Data de Emissão:</strong> {data_emissao || 'N/A'}</p></div>
        <div><p><strong>Centro de Custo:</strong> {centro_custo || 'N/A'}</p></div>
        <div><p><strong>Solicitante:</strong> {solicitante || 'N/A'}</p></div>
        <div className="md:col-span-2"><p><strong>Observação:</strong> {observacao || 'Nenhuma'}</p></div>
      </div>

      {/* Tabela de Itens */}
      <h3 className="text-xl font-semibold text-gray-700 mb-3">Itens da Requisição</h3>
      <div className="overflow-x-auto border rounded-lg mb-6">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 text-left">Produto</th>
              <th className="py-2 px-4 text-center">Qtd</th>
              <th className="py-2 px-4 text-right">V. Unitário</th>
              <th className="py-2 px-4 text-right">V. Total</th>
            </tr>
          </thead>
          <tbody>
            {(itens || []).map((item, index) => (
              <tr key={index} className="border-t">
                <td className="py-2 px-4">{item.produto || 'N/A'}</td>
                <td className="py-2 px-4 text-center">{item.quantidade || 'N/A'}</td>
                <td className="py-2 px-4 text-right">{item.valor_unitario || 'N/A'}</td>
                <td className="py-2 px-4 text-right">{item.valor_total || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <p className="text-right font-bold text-xl mt-4">
        Total da Requisição: R$ {total_geral_requisicao || '0,00'}
      </p>

      {/* Botão para mostrar outras informações */}
      <div className="text-center my-6">
        <button 
          onClick={() => setShowOtherInfo(!showOtherInfo)}
          className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          {showOtherInfo ? 'Ocultar' : 'Mostrar'} Outras Informações Encontradas
          {showOtherInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Seção de Outras Informações (condicional) */}
      {showOtherInfo && (
        <div className="p-4 border-t border-dashed animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dados_beneficiario && Object.keys(dados_beneficiario).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-700">Dados do Beneficiário</h4>
                {Object.entries(dados_beneficiario).map(([key, value]) => (
                  <p key={key}><strong>{formatKey(key)}:</strong> {value || 'N/A'}</p>
                ))}
              </div>
            )}
            {dados_viagem && Object.keys(dados_viagem).length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-700">Dados da Viagem</h4>
                {Object.entries(dados_viagem).map(([key, value]) => (
                  <p key={key}><strong>{formatKey(key)}:</strong> {value || 'N/A'}</p>
                ))}
              </div>
            )}
            {outras_informacoes && Object.keys(outras_informacoes).length > 0 && (
               <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-gray-700">Informações Gerais da Requisição</h4>
                {Object.entries(outras_informacoes).map(([key, value]) => (
                  <p key={key}><strong>{formatKey(key)}:</strong> {value || 'N/A'}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
        <button onClick={onCancel} className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors">
          Cancelar
        </button>
        <button onClick={() => onConfirm(extractedData)} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Confirmar e Usar Dados
        </button>
      </div>
    </div>
  );
};

export default ConfirmationScreen;
