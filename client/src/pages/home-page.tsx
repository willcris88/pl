import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaximizedLayout } from "@/components/layout/maximized-layout";
import { ClipboardList, Users, FileText, Truck, Package, AlertCircle } from "lucide-react";

export default function HomePage() {
  return (
    <MaximizedLayout title="Dashboard">
      <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Bem-vindo ao Sistema Funerário
              </h1>
              <p className="text-muted-foreground">
                Gerencie seus serviços com cuidado e profissionalismo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ordens de Serviço
                  </CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <p className="text-xs text-muted-foreground">
                    Total de ordens ativas
                  </p>
                  <Link to="/ordens-servico">
                    <Button className="w-full mt-4" variant="outline">
                      Gerenciar Ordens
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pendências
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <p className="text-xs text-muted-foreground">
                    Itens pendentes
                  </p>
                  <Button className="w-full mt-4" variant="outline">
                    Ver Pendências
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Produtos
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <p className="text-xs text-muted-foreground">
                    Produtos em estoque
                  </p>
                  <Button className="w-full mt-4" variant="outline">
                    Gerenciar Produtos
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Motoristas
                  </CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <p className="text-xs text-muted-foreground">
                    Motoristas ativos
                  </p>
                  <Button className="w-full mt-4" variant="outline">
                    Controle de Motoristas
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Documentos
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <p className="text-xs text-muted-foreground">
                    Documentos arquivados
                  </p>
                  <Button className="w-full mt-4" variant="outline">
                    Gerenciar Documentos
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Contratos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">-</div>
                  <p className="text-xs text-muted-foreground">
                    Contratos ativos
                  </p>
                  <Button className="w-full mt-4" variant="outline">
                    Gerenciar Contratos
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Acesse as funcionalidades mais utilizadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/ordens-servico/criar">
                      <Button className="bg-success hover:bg-success/90">
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Nova Ordem de Serviço
                      </Button>
                    </Link>
                    <Link to="/ordens-servico">
                      <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Listar Ordens
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </MaximizedLayout>
  );
}
