
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2, Wand2, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { extractInfoFromPdf } from '@/ai/flows/extract-info-flow';
import { type TravelRequest, type PassengerProfile } from '@/types';
import { saveRequests, getRequests, getPassengers, savePassengers } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

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
  const { toast } = useToast();
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const pdfFile = acceptedFiles.find(f => f.type === 'application/pdf');
      if(pdfFile) {
        setFile(pdfFile);
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
    try {
      const base64File = await fileToBase64(file);
      
      const extractedData = await extractInfoFromPdf({
          pdfDataUri: base64File,
      });

      const newRequest: TravelRequest = {
          id: extractedData.billing.webId || uuidv4(),
          createdAt: new Date(),
          status: "Draft",
          ...extractedData,
          passengers: extractedData.passengers.map(p => ({
              ...p,
              id: uuidv4(),
              birthDate: p.birthDate ? new Date(p.birthDate) : new Date(),
              itinerary: (p.itinerary || []).map(i => ({
                  ...i,
                  id: uuidv4(),
                  departureDate: i.departureDate ? new Date(i.departureDate) : new Date(),
                  returnDate: i.returnDate ? new Date(i.returnDate) : undefined,
              })),
              documents: [],
          }))
      };

      // Salva a solicitação
      const currentRequests = getRequests();
      saveRequests([...currentRequests, newRequest]);
      
      // Verifica e salva novos passageiros
      const passengerDb = getPassengers();
      const newPassengersToSave: PassengerProfile[] = [];
      for (const passenger of newRequest.passengers) {
          const exists = passengerDb.some(p => p.cpf === passenger.cpf);
          if (!exists) {
              newPassengersToSave.push({
                  id: uuidv4(),
                  name: passenger.name,
                  cpf: passenger.cpf,
                  birthDate: passenger.birthDate
              });
          }
      }
      if (newPassengersToSave.length > 0) {
          savePassengers([...passengerDb, ...newPassengersToSave]);
          toast({
              title: 'Passageiros Adicionados!',
              description: `${newPassengersToSave.length} novo(s) passageiro(s) foram adicionados à sua lista.`,
          });
      }

      toast({
        title: 'Sucesso!',
        description: 'Informações extraídas e nova solicitação criada.',
      });
      
      router.push('/solicitacoes');

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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Importar Solicitação com IA</h2>
        <p className="text-muted-foreground">
          Envie um arquivo PDF com os detalhes da viagem e a nossa IA irá preencher a solicitação para você.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto pt-6">
        <div
          {...getRootProps()}
          className={`flex justify-center w-full rounded-lg border-2 border-dashed border-input p-12 text-center transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
          } ${file ? 'cursor-default hover:border-input' : 'cursor-pointer'}`}
        >
          {file ? (
            <div className="space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="text-lg font-medium">Arquivo selecionado: {file.name}</p>
              <p className="text-sm text-muted-foreground">Clique no botão abaixo para iniciar a extração.</p>
               <Button onClick={(e) => { e.stopPropagation(); handleExtract(); }} disabled={isExtracting} className="mt-4">
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extraindo...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Extrair Informações
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <FileUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="flex text-sm leading-6 text-muted-foreground">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
