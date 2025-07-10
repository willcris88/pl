import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { 
  veiculos, 
  checklist_saida, 
  checklist_chegada,
  motoristas
} from "./schema";

// Schema para veículos
export const inserirVeiculoSchema = createInsertSchema(veiculos).omit({
  id: true,
  criadoEm: true,
  atualizadoEm: true,
});

export type InserirVeiculo = z.infer<typeof inserirVeiculoSchema>;
export type Veiculo = typeof veiculos.$inferSelect;

// Schema para checklist de saída
export const inserirChecklistSaidaSchema = createInsertSchema(checklist_saida).omit({
  id: true,
  criadoEm: true,
});

export type InserirChecklistSaida = z.infer<typeof inserirChecklistSaidaSchema>;
export type ChecklistSaida = typeof checklist_saida.$inferSelect;

// Schema para checklist de chegada
export const inserirChecklistChegadaSchema = createInsertSchema(checklist_chegada).omit({
  id: true,
  criadoEm: true,
});

export type InserirChecklistChegada = z.infer<typeof inserirChecklistChegadaSchema>;
export type ChecklistChegada = typeof checklist_chegada.$inferSelect;

// Schema para login de motorista
export const motoristaLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  cnh: z.string().min(11, "CNH deve ter pelo menos 11 caracteres"),
});

export type MotoristaLogin = z.infer<typeof motoristaLoginSchema>;

// Schema para atualização de status da OS
export const atualizarStatusOSSchema = z.object({
  status: z.enum(['em_andamento', 'concluido']),
  placaVeiculo: z.string().optional(),
  horaSaida: z.string().optional(),
  horaChegada: z.string().optional(),
});

export type AtualizarStatusOS = z.infer<typeof atualizarStatusOSSchema>;