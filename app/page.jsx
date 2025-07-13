
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, PencilRuler } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [selection, setSelection] = useState(null);
  const router = useRouter();

  const handleSelect = (option) => {
    setSelection(option);
    // Navega para a página correspondente após uma pequena animação/delay
    setTimeout(() => {
      if (option === "import") {
        router.push("/importar");
      } else {
        router.push("/solicitacoes/nova");
      }
    }, 300);
  };

  return (
    <div className="flex flex-col">
       <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Nova Solicitação</h2>
          <p className="text-muted-foreground">
            Como você gostaria de começar?
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center gap-8 pt-16">
        <Card
          onClick={() => handleSelect("import")}
          className={cn(
            "w-80 h-80 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2",
            selection === "import"
              ? "border-primary shadow-2xl scale-105"
              : "border-transparent"
          )}
        >
          <CardHeader>
            <CardTitle className="flex flex-col items-center justify-center text-center gap-4">
              <FileUp className="w-16 h-16 text-primary" />
              <span>Importar com IA</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Envie um arquivo PDF de uma solicitação de viagem existente e deixe
            nossa IA extrair as informações para você.
          </CardContent>
        </Card>

        <Card
          onClick={() => handleSelect("manual")}
          className={cn(
            "w-80 h-80 cursor-pointer transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border-2",
            selection === "manual"
              ? "border-primary shadow-2xl scale-105"
              : "border-transparent"
          )}
        >
          <CardHeader>
            <CardTitle className="flex flex-col items-center justify-center text-center gap-4">
              <PencilRuler className="w-16 h-16 text-primary" />
              <span>Criar Manualmente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Preencha o formulário de solicitação de viagem passo a passo,
            adicionando todos os detalhes manualmente.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
