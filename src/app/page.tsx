import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, FileUp, ListChecks } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Bem-vindo ao Viagens-Fadex!
        </h2>
      </div>
      <p className="text-muted-foreground">
        Use o menu lateral para navegar pelas funcionalidades do sistema.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ver Solicitações
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Link href="/solicitacoes" className="hover:underline">Gerenciar Viagens</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Visualize, crie, edite e exporte todas as suas solicitações de viagem.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Importar com IA
            </CardTitle>
            <FileUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                <Link href="/importar" className="hover:underline">Importar PDF</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Envie um PDF e deixe a IA extrair os dados para criar uma solicitação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
