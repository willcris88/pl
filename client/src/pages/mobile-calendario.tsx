import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MobileLayout } from "@/components/mobile/mobile-layout";
import { MobileCard } from "@/components/mobile/mobile-card";
import { MobileFab } from "@/components/mobile/mobile-fab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalendarIcon } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface CalendarioEvento {
  id: number;
  titulo: string;
  descricao?: string;
  data: string;
  hora?: string;
  usuarioId: number;
  criadoEm: string;
}

export default function MobileCalendario() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [eventForm, setEventForm] = useState({
    titulo: '',
    descricao: '',
    data: '',
    hora: ''
  });

  const { data: eventos = [] } = useQuery<CalendarioEvento[]>({
    queryKey: ['/api/calendario'],
    queryFn: async () => {
      const response = await fetch('/api/calendario', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Erro ao carregar eventos');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const createEventMutation = useMutation({
    mutationFn: async (newEvent: Omit<CalendarioEvento, 'id' | 'usuarioId' | 'criadoEm'>) => {
      const res = await fetch('/api/calendario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendario'] });
      setShowEventDialog(false);
      setEventForm({ titulo: '', descricao: '', data: '', hora: '' });
    }
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return eventos.filter(evento => {
      const eventDate = parseISO(evento.data);
      return isSameDay(eventDate, day);
    });
  };

  const handleCreateEvent = () => {
    if (!eventForm.titulo || !eventForm.data) return;
    
    createEventMutation.mutate({
      titulo: eventForm.titulo,
      descricao: eventForm.descricao,
      data: eventForm.data,
      hora: eventForm.hora
    });
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setEventForm({
      ...eventForm,
      data: format(day, 'yyyy-MM-dd')
    });
    setShowEventDialog(true);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <MobileLayout title="Calendário">
      <div className="space-y-4">
        {/* Cabeçalho do calendário */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Grade do calendário mobile */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          
          {daysInMonth.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);
            
            return (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                className={`
                  p-2 text-sm relative min-h-[40px] rounded-lg transition-colors
                  ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}
                  ${isDayToday ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : ''}
                  ${dayEvents.length > 0 ? 'bg-green-50 dark:bg-green-900/20' : ''}
                  hover:bg-gray-100 dark:hover:bg-gray-800
                `}
              >
                {format(day, 'd')}
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Lista de eventos do dia */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Eventos de hoje
          </h3>
          
          {eventos
            .filter(evento => isSameDay(parseISO(evento.data), new Date()))
            .map((evento) => (
              <MobileCard
                key={evento.id}
                title={evento.titulo}
                subtitle={evento.descricao}
                badge={evento.hora || 'Sem hora'}
                badgeColor="blue"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  {format(parseISO(evento.data), 'dd/MM/yyyy', { locale: ptBR })}
                  {evento.hora && ` às ${evento.hora}`}
                </div>
              </MobileCard>
            ))}
          
          {eventos.filter(evento => isSameDay(parseISO(evento.data), new Date())).length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nenhum evento para hoje
            </div>
          )}
        </div>

        {/* Próximos eventos */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Próximos eventos
          </h3>
          
          {eventos
            .filter(evento => new Date(evento.data) > new Date())
            .slice(0, 5)
            .map((evento) => (
              <MobileCard
                key={evento.id}
                title={evento.titulo}
                subtitle={evento.descricao}
                badge={format(parseISO(evento.data), 'dd/MM', { locale: ptBR })}
                badgeColor="green"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  {format(parseISO(evento.data), 'dd/MM/yyyy', { locale: ptBR })}
                  {evento.hora && ` às ${evento.hora}`}
                </div>
              </MobileCard>
            ))}
        </div>
      </div>

      {/* FAB para criar evento */}
      <MobileFab 
        onClick={() => setShowEventDialog(true)}
        label="Criar evento"
      />

      {/* Dialog para criar evento */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={eventForm.titulo}
                onChange={(e) => setEventForm({...eventForm, titulo: e.target.value})}
                placeholder="Digite o título do evento"
              />
            </div>
            
            <div>
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={eventForm.data}
                onChange={(e) => setEventForm({...eventForm, data: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="hora">Hora (opcional)</Label>
              <Input
                id="hora"
                type="time"
                value={eventForm.hora}
                onChange={(e) => setEventForm({...eventForm, hora: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={eventForm.descricao}
                onChange={(e) => setEventForm({...eventForm, descricao: e.target.value})}
                placeholder="Descrição do evento"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEventDialog(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={!eventForm.titulo || !eventForm.data || createEventMutation.isPending}
                className="flex-1"
              >
                {createEventMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}