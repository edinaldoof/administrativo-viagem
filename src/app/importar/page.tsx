
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { extractInfoFromPdf } from '@/ai/flows/extract-info-flow';
import { type TravelRequest } from '@/types';
import { saveRequests, getRequests } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

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
  });

  const handleExtract = async () => {
    if (!file) return;

    setIsExtracting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64File = reader.result as string;
        
        const extractedData = await extractInfoFromPdf({
            pdfDataUri: base64File,
        });

        const newRequest: TravelRequest = {
            id: uuidv4(),
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

        const currentRequests = getRequests();
        saveRequests([...currentRequests, newRequest]);
        
        toast({
          title: 'Sucesso!',
          description: 'Informações extraídas e nova solicitação criada.',
        });
        
        router.push('/solicitacoes');
      };
    } catch (error) {
      console.error('Error extracting information:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na extração',
        description:
          'Não foi possível extrair informações do PDF. Verifique o console para mais detalhes.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Importar Solicitação com IA</h2>
      </div>
      <p className="text-muted-foreground">
        Envie um arquivo PDF com os detalhes da viagem e a nossa IA irá preencher a solicitação para você.
      </p>
      
      <div className="max-w-2xl mx-auto mt-10">
        <div
          {...getRootProps()}
          className={`flex justify-center w-full rounded-lg border-2 border-dashed border-input p-12 text-center transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
          }`}
        >
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
        </div>

        {file && (
          <div className="mt-6 text-center">
            <p className="text-lg font-medium">Arquivo selecionado: {file.name}</p>
            <Button onClick={handleExtract} disabled={isExtracting} className="mt-4">
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
        )}
      </div>
    </div>
  );
}
