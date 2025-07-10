import { Switch, Route, useLocation } from "wouter";
import { ReactNode } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { MaximizeProvider } from "./contexts/maximize-context";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ProtectedRoute } from "./lib/protected-route";
import { ElegantDialogsProvider } from "./hooks/use-elegant-dialogs";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import ServiceOrdersPage from "@/pages/service-orders-page";
import OrdensServicoListaCompacta from "@/pages/ordens-servico-lista-compacta";
import CreateOrderPage from "@/pages/create-order-page";
import AuditLogsPage from "@/pages/audit-logs-page";
import SuppliersPage from "@/pages/suppliers-page";
import ProductsPage from "@/pages/products-page-new";
import PrestadorasPage from "@/pages/prestadoras";
import NotasContratuais from "@/pages/notas-contratuais";
import ObitosListaCompacta from "@/pages/obitos-lista-compacta";
import Obitos from "@/pages/obitos";
import Calendario from "@/pages/calendario";
import MotoristasPage from "@/pages/motoristas";
import DocumentosPage from "@/pages/documentos";
import LoginMotorista from "@/pages/LoginMotorista";
import DashboardMotorista from "@/pages/DashboardMotorista";
import PetsPage from "@/pages/PetsPage";

// Páginas mobile
import MobileCalendario from "@/pages/mobile-calendario";
import MobileOrdensServico from "@/pages/mobile-ordens-servico";
import MobileFornecedores from "@/pages/mobile-fornecedores";
import MobileProdutos from "@/pages/mobile-produtos";
import MobileObitos from "@/pages/mobile-obitos";
import MobileMotoristas from "@/pages/mobile-motoristas";
import MobilePrestadoras from "@/pages/mobile-prestadoras";
import MobileNotasContratuais from "@/pages/mobile-notas-contratuais";
import MobileLogsAuditoria from "@/pages/mobile-logs-auditoria";
import MobileDocumentos from "@/pages/mobile-documentos";
import MobileCriarOrdem from "@/pages/mobile-criar-ordem";
import MobileAuth from "@/pages/mobile-auth";
import MobileEditarFornecedor from "@/pages/mobile-editar-fornecedor";
import MobileEditarProduto from "@/pages/mobile-editar-produto";
import MobileEditarPrestadora from "@/pages/mobile-editar-prestadora";
import MobileEditarObito from "@/pages/mobile-editar-obito";
import MobileEditarOrdem from "@/pages/mobile-editar-ordem";
import ChatPage from "@/pages/chat-page";
import ChatTest from "@/pages/chat-test";
import ChatWorking from "@/pages/chat-working";
import LivroCaixa from "@/pages/livro-caixa";
import NotasNdPage from "@/pages/notas-nd";
import NotasGtcPage from "@/pages/notas-gtc";
import DesignerCartao from "@/pages/designer-cartao";

// Páginas do sistema de motoristas
import MotoristaLogin from "@/pages/motorista-login";
import MotoristaDashboard from "@/pages/motorista-dashboard";
import MotoristaServicoSimples from "@/pages/motorista-servico-simples";
import MotoristaChecklistFotos from "@/pages/motorista-checklist-fotos";
import { useIsMobile } from "@/hooks/use-mobile";


function Router() {
  const isMobile = useIsMobile();
  
  return (
    <Switch>
      {/* Sistema de motoristas - DEVE VIR PRIMEIRO para não ser interceptado */}
      <Route path="/motorista" component={MotoristaLogin} />
      <Route path="/motorista/login" component={MotoristaLogin} />
      <Route path="/motorista/dashboard" component={MotoristaDashboard} />
      <Route path="/motorista/servico/:id" component={MotoristaServicoSimples} />
      <Route path="/motorista/checklist-fotos/:motoristaOrdemServicoId" component={MotoristaChecklistFotos} />
      
      <ProtectedRoute path="/" component={isMobile ? MobileCalendario : Calendario} />
      <ProtectedRoute 
        path="/ordens-servico" 
        component={isMobile ? MobileOrdensServico : OrdensServicoListaCompacta} 
      />
      <ProtectedRoute 
        path="/ordens-servico/criar" 
        component={isMobile ? MobileCriarOrdem : CreateOrderPage} 
      />
      <ProtectedRoute 
        path="/ordens-servico/editar/:id" 
        component={isMobile ? MobileCriarOrdem : CreateOrderPage} 
      />
      <ProtectedRoute 
        path="/ordens-servico/:id" 
        component={isMobile ? MobileCriarOrdem : CreateOrderPage} 
      />
      <ProtectedRoute path="/logs-auditoria" component={isMobile ? MobileLogsAuditoria : AuditLogsPage} />
      
      {/* Rotas de fornecedores */}
      <ProtectedRoute path="/fornecedores" component={isMobile ? MobileFornecedores : SuppliersPage} />
      <ProtectedRoute path="/fornecedores/criar" component={isMobile ? MobileEditarFornecedor : SuppliersPage} />
      <ProtectedRoute path="/fornecedores/editar/:id" component={isMobile ? MobileEditarFornecedor : SuppliersPage} />
      
      {/* Rotas de produtos */}
      <ProtectedRoute path="/produtos" component={isMobile ? MobileProdutos : ProductsPage} />
      <ProtectedRoute path="/produtos/criar" component={isMobile ? MobileEditarProduto : ProductsPage} />
      <ProtectedRoute path="/produtos/editar/:id" component={isMobile ? MobileEditarProduto : ProductsPage} />
      
      {/* Rotas de prestadoras */}
      <ProtectedRoute path="/prestadoras" component={isMobile ? MobilePrestadoras : PrestadorasPage} />
      <ProtectedRoute path="/prestadoras/criar" component={isMobile ? MobileEditarPrestadora : PrestadorasPage} />
      <ProtectedRoute path="/prestadoras/editar/:id" component={isMobile ? MobileEditarPrestadora : PrestadorasPage} />
      
      <ProtectedRoute path="/notas-contratuais" component={isMobile ? MobileNotasContratuais : NotasContratuais} />
      
      {/* Rotas de óbitos */}
      <ProtectedRoute path="/obitos" component={isMobile ? MobileObitos : ObitosListaCompacta} />
      <ProtectedRoute path="/obitos/criar" component={isMobile ? () => <MobileEditarObito params={{ id: 'novo' }} /> : Obitos} />
      <ProtectedRoute path="/obitos/editar/:id" component={isMobile ? MobileEditarObito : Obitos} />
      
      {/* Rotas de pets */}
      <ProtectedRoute path="/pets" component={PetsPage} />
      
      {/* Rotas de livro caixa */}
      <ProtectedRoute path="/livro-caixa" component={LivroCaixa} />
      
      {/* Rotas de notas ND */}
      <ProtectedRoute path="/notas-nd" component={NotasNdPage} />
      <ProtectedRoute path="/nota-debito" component={NotasNdPage} />
      
      {/* Rotas de notas GTC */}
      <ProtectedRoute path="/notas-gtc" component={NotasGtcPage} />
      <ProtectedRoute path="/nota-gtc" component={NotasGtcPage} />
      
      {/* Designer de cartão */}
      <ProtectedRoute path="/designer-cartao" component={DesignerCartao} />
      
      {/* Rotas de ordens de serviço */}
      <ProtectedRoute path="/ordens-servico/criar" component={isMobile ? () => <MobileEditarOrdem params={{ id: 'nova' }} /> : CreateOrderPage} />
      <ProtectedRoute path="/ordens-servico/editar/:id" component={isMobile ? MobileEditarOrdem : ServiceOrdersPage} />
      
      <ProtectedRoute path="/motoristas" component={isMobile ? MobileMotoristas : MotoristasPage} />
      <ProtectedRoute path="/documentos/:id" component={isMobile ? MobileDocumentos : DocumentosPage} />
      <ProtectedRoute path="/chat" component={ChatPage} />
      <ProtectedRoute path="/chat-test" component={ChatTest} />

      <Route path="/auth" component={isMobile ? MobileAuth : AuthPage} />
      <Route path="/login" component={isMobile ? MobileAuth : AuthPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function ConditionalAuthProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  
  // Se está nas rotas do motorista, não usa AuthProvider
  if (location.startsWith('/motorista')) {
    return <>{children}</>;
  }
  
  // Para todas as outras rotas, usa AuthProvider normal
  return <AuthProvider>{children}</AuthProvider>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConditionalAuthProvider>
        <NotificationProvider>
          <MaximizeProvider>
            <ElegantDialogsProvider>
              <TooltipProvider>
                <Toaster />
                <Router />
              </TooltipProvider>
            </ElegantDialogsProvider>
          </MaximizeProvider>
        </NotificationProvider>
      </ConditionalAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
