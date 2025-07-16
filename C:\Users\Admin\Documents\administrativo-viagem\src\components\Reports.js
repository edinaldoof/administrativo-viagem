// src/components/Reports.js
import React, { useState, useEffect, useMemo } from 'react';
import { getAllRequests } from '@/services/requestService';
import { Loader, BarChart2, Plane, Users, DollarSign, MapPin, Briefcase, FileSpreadsheet } from 'lucide-react';
import { formatCurrency } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { exportReportsToExcel } from '@/utils/excelExporter';

const StatCard = ({ title, value, icon: Icon, subtext }) => (
  <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-slate-600 flex items-center gap-4">
    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
      {subtext && <p className="text-xs text-gray-400 dark:text-gray-500">{subtext}</p>}
    </div>
  </div>
);

const ListCard = ({ title, data, icon: Icon, renderItem }) => (
    <div className="bg-white dark:bg-slate-700 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-slate-600">
        <div className="flex items-center gap-3 mb-4">
            <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400"/>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        <ul className="space-y-3">
            {data.length > 0 ? data.map(renderItem) : (
                <li className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhum dado para exibir.</li>
            )}
        </ul>
    </div>
);

// Função para padronizar strings (maiúsculas, sem acentos)
const standardizeString = (str) => {
    if (!str) return '';
    return str
        .normalize("NFD") // Normaliza para decompor acentos
        .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
        .toUpperCase(); // Converte para maiúsculas
};

// Função para carregar um script dinamicamente
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.body.appendChild(script);
  });
};


const Reports = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestData = await getAllRequests();
        setRequests(requestData);
        // setError("A funcionalidade de Relatórios está desativada nesta versão.");
      } catch (err) {
        setError('Falha ao carregar os dados para os relatórios.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (requests.length === 0) {
      return {
        totalRequests: 0,
        totalValue: 0,
        totalTrips: 0,
        topDestinations: [],
        requestsByProject: [],
        topPassengers: [],
      };
    }

    let totalValue = 0;
    let totalTrips = 0;
    const destinationCounts = {};
    const projectCounts = {};
    const passengerCounts = {};

    requests.forEach(req => {
      // Contagem por projeto
      const projectName = req.contaProjeto || 'Não especificado';
      projectCounts[projectName] = (projectCounts[projectName] || 0) + 1;

      (req.passengersData || []).forEach(passenger => {
        // Contagem por passageiro (padronizado)
        const passengerName = standardizeString(passenger.nome) || 'NAO IDENTIFICADO';
        
        let passengerTripCount = 0;
        (passenger.itinerarios || []).forEach(it => {
            totalTrips++;
            totalValue += (parseFloat(it.valorUnitario) || 0) * (parseFloat(it.quantidade) || 1);
            passengerTripCount++;
            
            // Contagem de destinos (padronizado)
            const destination = standardizeString(it.destino) || 'NAO ESPECIFICADO';
            destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
        });
        
        if (passengerTripCount > 0) {
            passengerCounts[passengerName] = (passengerCounts[passengerName] || 0) + passengerTripCount;
        }
      });
    });
    
    const topDestinations = Object.entries(destinationCounts)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 5);

    const requestsByProject = Object.entries(projectCounts)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 5);

    const topPassengers = Object.entries(passengerCounts)
        .sort(([,a],[,b]) => b - a)
        .slice(0, 5);

    return {
      totalRequests: requests.length,
      totalValue,
      totalTrips,
      topDestinations,
      requestsByProject,
      topPassengers,
    };
  }, [requests]);
  
  const handleExport = async () => {
    try {
      if (!window.XLSX) {
        await loadScript("https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js");
      }
      exportReportsToExcel(stats, requests); // Passa os dados brutos também
    } catch (e) {
      console.error(e);
      alert('Houve um erro ao exportar os relatórios.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader className="animate-spin h-10 w-10 text-blue-600" />
        <p className="ml-4 text-lg text-gray-600 dark:text-gray-300">Gerando relatórios...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-20">{error}</p>;
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
            <BarChart2 className="h-8 w-8 text-gray-800 dark:text-gray-100" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Painel de Relatórios</h2>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={requests.length === 0}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar para Excel
        </Button>
      </div>


      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total de Requisições" value={stats.totalRequests} icon={Briefcase} />
        <StatCard title="Valor Total" value={formatCurrency(stats.totalValue)} icon={DollarSign} />
        <StatCard title="Total de Trechos" value={stats.totalTrips} icon={Plane} />
      </div>

      {/* Listas de Top 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ListCard 
            title="Destinos Mais Solicitados"
            icon={MapPin}
            data={stats.topDestinations}
            renderItem={([dest, count]) => (
                 <li key={dest} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50">
                    <span className="font-medium text-gray-700 dark:text-gray-200">{dest}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full text-xs">{count} {count > 1 ? 'vezes' : 'vez'}</span>
                </li>
            )}
        />
         <ListCard 
            title="Requisições por Projeto"
            icon={Briefcase}
            data={stats.requestsByProject}
            renderItem={([project, count]) => (
                <li key={project} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50">
                    <span className="font-medium text-gray-700 dark:text-gray-200 truncate pr-2" title={project}>{project}</span>
                    <span className="font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded-full text-xs">{count} {count > 1 ? 'reqs' : 'req'}</span>
                </li>
            )}
        />
        <ListCard 
            title="Passageiros Frequentes"
            icon={Users}
            data={stats.topPassengers}
            renderItem={([name, count]) => (
                <li key={name} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600/50">
                    <span className="font-medium text-gray-700 dark:text-gray-200 truncate pr-2" title={name}>{name}</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded-full text-xs">{count} {count > 1 ? 'trechos' : 'trecho'}</span>
                </li>
            )}
        />
      </div>
    </div>
  );
};

export default Reports;
