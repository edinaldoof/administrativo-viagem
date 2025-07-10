
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2, Wand2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { extractInfoFromPdf, type ExtractInfoOutput } from '@/ai/flows/extract-info-flow';
import { type TravelRequest, type PassengerProfile } from '@/types';
import { saveRequests, getRequests, getPassengers, savePassengers } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { RequestForm } from '@/components/request-form';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function ImportarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<TravelRequest | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const pdfFile = acceptedFiles.find(f => f.type === 'application/pdf');
      if (pdfFile) {
        setFile(pdfFile);
        setExtractedData(null); 
      } else {
        toast({
          variant: 'destructive',
          title: 'Arquivo inválido',
          description: 'Por favor, selecione um arquivo PDF.',
        });
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isExtracting,
  });

  const handleExtract = async () => {
    if (!file) return;

    setIsExtracting(true);
    setExtractedData(null);
    try {
      const base64File = await fileToBase64(file);
      
      const aiOutput: ExtractInfoOutput = await extractInfoFromPdf({
          pdfDataUri: base64File,
      });

      // Transforma a saída da IA no formato completo de TravelRequest para o formulário
      const newRequest: TravelRequest = {
          id: aiOutput.billing.webId || uuidv4(),
          createdAt: new Date(),
          status: "Draft",
          ...aiOutput,
          passengers: aiOutput.passengers.map(p => ({
              ...p,
              id: uuidv4(),
              birthDate: p.birthDate ? new Date(p.birthDate) : new Date(),
              email: p.email || "",
              phone: p.phone || "",
              itinerary: (p.itinerary || []).map(i => ({
                  ...i,
                  id: uuidv4(),
                  departureDate: i.departureDate ? new Date(i.departureDate) : new Date(),
                  returnDate: i.returnDate ? new Date(i.returnDate) : undefined,
              })),
              documents: [],
          }))
      };
      
      setExtractedData(newRequest);
      toast({
        title: 'Extração Concluída!',
        description: 'Revise os dados abaixo e salve a solicitação.',
      });

    } catch (error: any) {
      console.error('Error extracting information:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na extração',
        description: error.message || 'Não foi possível extrair informações do PDF. Verifique o console para mais detalhes.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFormSubmit = (data: TravelRequest) => {
    const currentRequests = getRequests();
    saveRequests([...currentRequests, data]);
    
    // A lógica de salvar passageiros já está dentro do RequestForm
    toast({ title: "Sucesso", description: `Solicitação importada e salva com sucesso.` });
    router.push('/solicitacoes');
  };


  return (
    <div className="p-4 md:p-8 pt-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Importar Requisição</h2>
          <p className="text-muted-foreground">
            Envie um arquivo PDF e revise as informações extraídas pela IA antes de salvar.
          </p>
        </div>
        
        { !extractedData && (
          <div className="pt-6">
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center w-full rounded-lg border-2 border-dashed border-input p-12 text-center transition-colors ${
                isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
              } ${isExtracting ? 'cursor-wait' : 'cursor-pointer'}`}
            >
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="flex text-sm leading-6 text-muted-foreground mt-4">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                >
                  <span>Carregue um arquivo</span>
                  <input {...getInputProps()} className="sr-only" />
                </label>
                <p className="pl-1">ou arraste e solte</p>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">Apenas arquivos PDF.</p>
              
              {file && !isExtracting && (
                <div className="mt-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground"/>
                  <p className="mt-2 text-sm font-medium">Arquivo selecionado: {file.name}</p>
                   <Button onClick={(e) => { e.stopPropagation(); handleExtract(); }} className="mt-4">
                      <Wand2 className="mr-2 h-4 w-4" />
                      Extrair Informações
                  </Button>
                </div>
              )}

              {isExtracting && (
                 <div className="mt-8 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="mt-2 text-sm font-medium">Extraindo, aguarde...</p>
                 </div>
              )}
            </div>
          </div>
        )}

        {extractedData && (
          <div className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold tracking-tight">Revise os Dados Extraídos</h3>
                <Button variant="outline" onClick={() => { setFile(null); setExtractedData(null); }}>
                    Importar Outro Arquivo
                </Button>
              </div>
              <div className="p-1 border rounded-lg shadow-sm">
                 <RequestForm
                    key={extractedData.id}
                    onSubmit={handleFormSubmit}
                    initialData={extractedData}
                  />
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
