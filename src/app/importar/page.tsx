
'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, Loader2, Wand2, FileText, FilePlus2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { extractInfoFromPdf, type ExtractInfoOutput } from '@/ai/flows/extract-info-flow';
import { type TravelRequest } from '@/types';
import { saveRequests } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { RequestForm } from '@/components/request-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type PageState = 'selection' | 'ai-import' | 'manual-creation';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function CriarRequisicaoPage() {
  const [pageState, setPageState] = useState<PageState>('selection');
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
      
      const aiOutput: ExtractInfoOutput = await extractInfoFromPdf({ pdfDataUri: base64File });

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
        description: error.message || 'Não foi possível extrair informações do PDF.',
      });
    } finally {
      setIsExtracting(false);
    }
  };
  
  const resetToSelection = () => {
    setPageState('selection');
    setFile(null);
    setExtractedData(null);
  };
  
  const handleFormSubmit = (data: TravelRequest) => {
    const currentRequests = getRequests();
    saveRequests([...currentRequests, data]);
    toast({ title: "Sucesso", description: `Solicitação importada e salva com sucesso.` });
    router.push('/solicitacoes');
  };

  const renderContent = () => {
    switch (pageState) {
      case 'ai-import':
        return (
          <>
            <Button variant="outline" onClick={resetToSelection} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à seleção
            </Button>
            { !extractedData ? (
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
            ) : (
               <div className="pt-6">
                  <div className="p-1 border rounded-lg shadow-sm">
                     <RequestForm
                        key={extractedData.id}
                        onSubmit={handleFormSubmit}
                        initialData={extractedData}
                      />
                  </div>
              </div>
            )}
          </>
        );
      case 'manual-creation':
        return (
            <>
              <Button variant="outline" onClick={resetToSelection} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à seleção
              </Button>
              <div className="p-1 border rounded-lg shadow-sm">
                <RequestForm
                  key="manual-new"
                  onSubmit={handleFormSubmit}
                  initialData={null}
                />
              </div>
            </>
        );
      case 'selection':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
            <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer" onClick={() => setPageState('ai-import')}>
                <CardHeader>
                    <div className="flex justify-center mb-4"><Wand2 size={48} className="text-primary"/></div>
                    <CardTitle className="text-center">Importar com IA</CardTitle>
                    <CardDescription className="text-center">
                        Envie um arquivo PDF e deixe a inteligência artificial preencher o formulário para você.
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card className="hover:shadow-lg hover:border-primary transition-all cursor-pointer" onClick={() => setPageState('manual-creation')}>
                <CardHeader>
                     <div className="flex justify-center mb-4"><FilePlus2 size={48} className="text-primary"/></div>
                    <CardTitle className="text-center">Criar Manualmente</CardTitle>
                    <CardDescription className="text-center">
                        Preencha todos os campos do formulário de requisição do zero.
                    </CardDescription>
                </CardHeader>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 pt-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Criar Requisição</h2>
          <p className="text-muted-foreground">
            Escolha como você quer iniciar uma nova solicitação de viagem.
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

    