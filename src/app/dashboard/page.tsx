'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChurchStats } from '@/lib/types';

export default function DashboardPage() {
  const { church, isLoading } = useTenant();
  const [stats, setStats] = useState<ChurchStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (church) {
      // Load dashboard statistics
      loadDashboardData();
    }
  }, [church]);

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const statsResponse = await fetch(`/api/tenant/${church?.subdomain}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Load recent activities
      const activitiesResponse = await fetch(`/api/tenant/${church?.subdomain}/activities`);
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setRecentActivities(activitiesData.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  if (isLoading || !church) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {church.name}
              </h1>
              <p className="text-gray-600">
                Sistema de Gestão da Igreja
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">Configurações</Button>
              <Button>Nova Atividade</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Membros
              </CardTitle>
              <div className="h-4 w-4 bg-blue-500 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalMembers || church.memberCount || 0}
              </div>
              <p className="text-xs text-green-600">
                +{stats?.monthlyGrowth || 0} este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Células Ativas
              </CardTitle>
              <div className="h-4 w-4 bg-green-500 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.activeCellGroups || 0}
              </div>
              <p className="text-xs text-gray-600">
                Grupos em funcionamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Equipes de Louvor
              </CardTitle>
              <div className="h-4 w-4 bg-purple-500 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.worshipTeams || 0}
              </div>
              <p className="text-xs text-gray-600">
                Times organizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Atividades Recentes
              </CardTitle>
              <div className="h-4 w-4 bg-orange-500 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.recentActivities || 0}
              </div>
              <p className="text-xs text-gray-600">
                Últimos 7 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="cells">Células</TabsTrigger>
            <TabsTrigger value="worship">Louvor</TabsTrigger>
            <TabsTrigger value="communications">Comunicação</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>
                    Últimas ações no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{activity.type}</Badge>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-4">
                        Nenhuma atividade recente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Funcionalidades principais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col justify-center">
                      <div className="w-6 h-6 bg-blue-500 rounded mb-2"></div>
                      <span className="text-sm">Novo Membro</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col justify-center">
                      <div className="w-6 h-6 bg-green-500 rounded mb-2"></div>
                      <span className="text-sm">Nova Célula</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col justify-center">
                      <div className="w-6 h-6 bg-purple-500 rounded mb-2"></div>
                      <span className="text-sm">Escalar Equipe</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col justify-center">
                      <div className="w-6 h-6 bg-orange-500 rounded mb-2"></div>
                      <span className="text-sm">Enviar Mensagem</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>
                  Agenda da igreja
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Culto de Domingo</h4>
                      <p className="text-sm text-gray-600">Culto principal da igreja</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Domingo, 19:00</p>
                      <Badge>Confirmado</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Reunião de Células</h4>
                      <p className="text-sm text-gray-600">Encontros nos lares</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Terça-feira, 20:00</p>
                      <Badge variant="outline">Programado</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Membros</CardTitle>
                <CardDescription>
                  Funcionalidade completa em desenvolvimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Sistema de membros será implementado na próxima fase
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cells">
            <Card>
              <CardHeader>
                <CardTitle>Células e Grupos</CardTitle>
                <CardDescription>
                  Gestão completa de células com mapa interativo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Sistema de células será implementado na próxima fase
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="worship">
            <Card>
              <CardHeader>
                <CardTitle>Equipes de Louvor</CardTitle>
                <CardDescription>
                  Gestão de equipes, repertórios e escalas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Sistema de louvor será implementado na próxima fase
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications">
            <Card>
              <CardHeader>
                <CardTitle>Comunicação</CardTitle>
                <CardDescription>
                  Chat em tempo real e notificações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Sistema de comunicação será implementado na próxima fase
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}