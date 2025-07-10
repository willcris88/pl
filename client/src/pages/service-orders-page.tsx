import { MaximizedLayout } from "@/components/layout/maximized-layout";
import { ServiceOrdersList } from "@/components/service-orders/service-orders-list";

export default function ServiceOrdersPage() {
  return (
    <MaximizedLayout title="Lista de Ordens de Serviço">
      <ServiceOrdersList />
    </MaximizedLayout>
  );
}
