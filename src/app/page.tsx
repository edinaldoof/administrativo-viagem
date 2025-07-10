
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ListChecks, Users, FileSignature, ArrowRight, PieChart } from "lucide-react";
import Link from "next/link";
import { getRequests } from '@/lib/actions';
import { type TravelRequest, type TravelRequestStatus } from '@/types';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

const STATUS_CONFIG: ChartConfig = {
  Draft: { label: "Rascunho", color: "hsl(var(--chart-1))" },
  Submitted: { label: "Enviado", color: "hsl(var(--chart-2))" },
  Approved: { label: "Aprovado", color: "hsl(var(--chart-3))" },
  Rejected: { label: "Rejeitado", color: "hsl(var(--chart-4))" },
};

export default function Home() {
  const [requests, setRequests] = useState<TravelRequest[]>([]);

  useEffect(() => {
    setRequests(getRequests());
  }, []);

  const totalPassengers = requests.reduce((acc, req) => acc + req.passengers.length, 0);
  const draftRequests = requests.filter(req => req.status === 'Draft').length;

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusData = React.useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<TravelRequestStatus, number>);

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      fill: STATUS_CONFIG[status as TravelRequestStatus]?.color || '#ccc',
    }));
  }, [requests]);
  
  const getMainItinerarySummary = (request: TravelRequest) => {
    const firstPassenger = request.passengers[0];
    if (!firstPassenger || !firstPassenger.itinerary || firstPassenger.itinerary.length === 0) {
      return 'Sem itinerário';
    }
    const firstLeg = firstPassenger.itinerary[0];
    return `${firstLeg.origin} → ${firstLeg.destination}`;
  };


  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-headline font-bold tracking-tight">
          Painel de Controle
        </h2>
      </div>
      <p className="text-muted-foreground">
        Um resumo das suas solicitações de viagem.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Solicitações
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de solicitações criadas no sistema.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Passageiros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPassengers}</div>
            <p className="text-xs text-muted-foreground">
              Soma de todos os passageiros nas solicitações.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftRequests}</div>
            <p className="text-xs text-muted-foreground">
              Solicitações que ainda não foram finalizadas.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              As últimas 5 solicitações criadas ou atualizadas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentRequests.length > 0 ? (
                <div className="space-y-4">
                {recentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{request.title}</p>
                            <p className="text-sm text-muted-foreground">{getMainItinerarySummary(request)}</p>
                        </div>
                        <Link href="/solicitacoes">
                            <Button variant="ghost" size="sm">
                                Ver
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                    <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
                    <Link href="/solicitacoes">
                        <Button variant="link" className="mt-2">Criar uma nova solicitação</Button>
                    </Link>
                </div>
            )}
          </CardContent>
        </Card>
         <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Status das Solicitações
                </CardTitle>
                <CardDescription>Distribuição de status das solicitações.</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                 <ChartContainer config={STATUS_CONFIG} className="h-[200px] w-full">
                    <RechartsPieChart>
                      <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent nameKey="count" hideLabel />}
                      />
                      <Pie
                        data={statusData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={50}
                        strokeWidth={5}
                      >
                         {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                      </Pie>
                    </RechartsPieChart>
                  </ChartContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-center">
                  <p className="text-sm text-muted-foreground">Nenhuma solicitação para exibir.</p>
                </div>
              )}
            </CardContent>
         </Card>
      </div>

    </div>
  );
}
