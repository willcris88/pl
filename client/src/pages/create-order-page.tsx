import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CreateOrderForm } from "@/components/service-orders/create-order-form";

export default function CreateOrderPage() {
  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Criar Ordem de Serviço" />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <CreateOrderForm />
        </main>
      </div>
    </div>
  );
}
