/**
 * ROTAS DO DASHBOARD DE MOTORISTAS
 * 
 * Permite aos motoristas visualizar suas ordens de serviço vinculadas
 * e gerenciar o fluxo de trabalho com checklist de fotos.
 */

import { Router } from 'express';
import { db } from '../db.js';
import { 
  motoristas_ordem_servico, 
  ordensServico, 
  produtosOrdemServico,
  motoristas,
  veiculos,
  checklist_saida,
  checklist_chegada
} from '../../shared/schema.js';
import { eq, and, desc, ne, or } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'checklist');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// GET - Buscar ordens de serviço vinculadas ao motorista
router.get('/ordens-servico', async (req: any, res: any) => {
  try {
    const { motoristaId } = req.query;
    
    if (!motoristaId) {
      return res.status(400).json({ error: 'motoristaId é obrigatório' });
    }

    console.log(`Buscando ordens para motorista: ${motoristaId}`);

    // Buscar as vinculações do motorista (em andamento E concluídas)
    const vinculacoes = await db
      .select()
      .from(motoristas_ordem_servico)
      .where(
        and(
          eq(motoristas_ordem_servico.motoristaId, parseInt(motoristaId)),
          or(
            eq(motoristas_ordem_servico.status, 'em_andamento'),
            eq(motoristas_ordem_servico.status, 'concluido')
          )
        )
      );

    // Depois buscar os detalhes de cada ordem
    const ordensVinculadas = [];
    for (const vinculacao of vinculacoes) {
      try {
        // Buscar ordem de serviço
        const [ordem] = await db
          .select()
          .from(ordensServico)
          .where(eq(ordensServico.id, vinculacao.ordemServicoId));

        // Buscar produto/veículo se existir
        let veiculo = null;
        if (vinculacao.veiculoProdutoId) {
          const [produtoVeiculo] = await db
            .select()
            .from(produtosOrdemServico)
            .where(eq(produtosOrdemServico.id, vinculacao.veiculoProdutoId));
          veiculo = produtoVeiculo;
        }

        ordensVinculadas.push({
          ...vinculacao,
          ordem: ordem || null,
          veiculo: veiculo || null
        });
      } catch (err) {
        console.error(`Erro ao buscar detalhes da vinculação ${vinculacao.id}:`, err);
      }
    }

    console.log(`Encontradas ${ordensVinculadas.length} ordens vinculadas`);
    res.json(ordensVinculadas);

  } catch (error) {
    console.error('Erro ao buscar ordens vinculadas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar detalhes de uma ordem específica
router.get('/ordem-detalhes/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    console.log(`Buscando detalhes da ordem vinculada: ${id}`);

    // Primeiro verificar se existe a vinculação
    const vinculacao = await db
      .select()
      .from(motoristas_ordem_servico)
      .where(eq(motoristas_ordem_servico.id, parseInt(id)))
      .limit(1);

    console.log(`Vinculação encontrada:`, vinculacao);

    if (vinculacao.length === 0) {
      console.log(`Nenhuma vinculação encontrada para ID ${id}`);
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    const vinculacaoData = vinculacao[0];

    // Buscar dados da ordem de serviço
    const [ordemServico] = await db
      .select()
      .from(ordensServico)
      .where(eq(ordensServico.id, vinculacaoData.ordemServicoId));

    console.log(`Ordem de serviço encontrada:`, ordemServico);

    // Verificar se já existe checklist de saída
    const checklistSaida = await db
      .select()
      .from(checklist_saida)
      .where(eq(checklist_saida.motoristaOrdemServicoId, vinculacaoData.id))
      .limit(1);

    // Verificar se já existe checklist de chegada
    const checklistChegada = await db
      .select()
      .from(checklist_chegada)
      .where(eq(checklist_chegada.motoristaOrdemServicoId, vinculacaoData.id))
      .limit(1);

    // Montar resposta com dados corretos
    const resultado = {
      id: vinculacaoData.id,
      ordemServicoId: vinculacaoData.ordemServicoId,
      observacoes: vinculacaoData.observacoes,
      osNumero: ordemServico?.numeroOs || null,
      osFalecido: ordemServico?.nomeFalecido || null,
      osLocalRetirada: ordemServico?.enderecoCorpo || "Local de Retirada",
      osLocalDestino: ordemServico?.enderecoSepultamento || "Local de Destino",
      osDataServico: ordemServico?.dataHoraSepultamento ? new Date(ordemServico.dataHoraSepultamento).toISOString().split('T')[0] : "2025-07-08",
      osHorarioServico: ordemServico?.dataHoraSepultamento ? new Date(ordemServico.dataHoraSepultamento).toTimeString().slice(0,5) : "14:00",
      checklistSaidaFeito: checklistSaida.length > 0,
      checklistChegadaFeito: checklistChegada.length > 0
    };

    console.log(`Resultado final:`, resultado);
    res.json(resultado);

  } catch (error) {
    console.error('Erro ao buscar detalhes da ordem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Enviar checklist de saída com fotos
router.post('/checklist-saida', upload.fields([
  { name: 'foto1', maxCount: 1 },
  { name: 'foto2', maxCount: 1 },
  { name: 'foto3', maxCount: 1 },
  { name: 'foto4', maxCount: 1 }
]), async (req: any, res: any) => {
  try {
    const { motoristaOrdemServicoId, placaVeiculo, observacoesSaida } = req.body;
    const files = req.files as any;

    console.log('Recebendo checklist de saída:', {
      motoristaOrdemServicoId,
      placaVeiculo,
      observacoesSaida,
      fotos: Object.keys(files || {}),
      filesDetails: files
    });
    
    // Validar dados obrigatórios
    if (!motoristaOrdemServicoId) {
      return res.status(400).json({ error: 'ID da vinculação é obrigatório' });
    }
    
    if (!placaVeiculo) {
      return res.status(400).json({ error: 'Placa do veículo é obrigatória' });
    }

    // Verificar se todas as 4 fotos foram enviadas
    if (!files || !files.foto1 || !files.foto2 || !files.foto3 || !files.foto4) {
      return res.status(400).json({ error: 'São necessárias exatamente 4 fotos' });
    }

    // Validar motoristaOrdemServicoId
    if (!motoristaOrdemServicoId || motoristaOrdemServicoId === 'undefined' || isNaN(parseInt(motoristaOrdemServicoId))) {
      return res.status(400).json({ 
        error: 'motoristaOrdemServicoId inválido',
        received: motoristaOrdemServicoId 
      });
    }

    // Inserir checklist de saída
    const [checklistSaida] = await db
      .insert(checklist_saida)
      .values({
        motoristaOrdemServicoId: parseInt(motoristaOrdemServicoId),
        placaVeiculo: placaVeiculo,
        foto1Path: files.foto1[0].filename,
        foto2Path: files.foto2[0].filename,
        foto3Path: files.foto3[0].filename,
        foto4Path: files.foto4[0].filename,
        observacoesSaida: observacoesSaida || null,
      })
      .returning();

    // Atualizar status da ordem e hora de saída
    await db
      .update(motoristas_ordem_servico)
      .set({
        horaSaida: new Date(),
        status: 'em_andamento',
        atualizadoEm: new Date()
      })
      .where(eq(motoristas_ordem_servico.id, parseInt(motoristaOrdemServicoId)));

    console.log('Checklist de saída registrado com sucesso');
    res.status(201).json(checklistSaida);

  } catch (error) {
    console.error('Erro ao processar checklist de saída:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST - Enviar checklist de chegada com fotos
router.post('/checklist-chegada', upload.fields([
  { name: 'foto1', maxCount: 1 },
  { name: 'foto2', maxCount: 1 },
  { name: 'foto3', maxCount: 1 },
  { name: 'foto4', maxCount: 1 }
]), async (req: any, res: any) => {
  try {
    const { motoristaOrdemServicoId, observacoesChegada } = req.body;
    const files = req.files as any;

    console.log('Recebendo checklist de chegada:', {
      motoristaOrdemServicoId,
      fotos: Object.keys(files || {})
    });

    // Verificar se todas as 4 fotos foram enviadas
    if (!files || !files.foto1 || !files.foto2 || !files.foto3 || !files.foto4) {
      return res.status(400).json({ error: 'São necessárias exatamente 4 fotos' });
    }

    // Inserir checklist de chegada
    const [checklistChegada] = await db
      .insert(checklist_chegada)
      .values({
        motoristaOrdemServicoId: parseInt(motoristaOrdemServicoId),
        foto1Path: files.foto1[0].filename,
        foto2Path: files.foto2[0].filename,
        foto3Path: files.foto3[0].filename,
        foto4Path: files.foto4[0].filename,
        observacoesChegada: observacoesChegada || null,
      })
      .returning();

    // Atualizar status da ordem e hora de chegada
    await db
      .update(motoristas_ordem_servico)
      .set({
        horaChegada: new Date(),
        status: 'concluido',
        atualizadoEm: new Date()
      })
      .where(eq(motoristas_ordem_servico.id, parseInt(motoristaOrdemServicoId)));

    // Buscar ordem de serviço vinculada para atualizar status
    const [vinculacao] = await db
      .select()
      .from(motoristas_ordem_servico)
      .where(eq(motoristas_ordem_servico.id, parseInt(motoristaOrdemServicoId)));

    if (vinculacao) {
      // Atualizar status da ordem de serviço principal para "finalizado"
      await db
        .update(ordensServico)
        .set({
          status: 'finalizado',
          atualizadoEm: new Date()
        })
        .where(eq(ordensServico.id, vinculacao.ordemServicoId));
      
      console.log(`Status da ordem ${vinculacao.ordemServicoId} atualizado para "finalizado"`);
    }

    console.log('Checklist de chegada registrado - serviço concluído');
    res.status(201).json(checklistChegada);

  } catch (error) {
    console.error('Erro ao processar checklist de chegada:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar veículos disponíveis
router.get('/veiculos', async (req: any, res: any) => {
  try {
    const listaVeiculos = await db
      .select({
        id: veiculos.id,
        marca: veiculos.marca,
        modelo: veiculos.modelo,
        placa: veiculos.placa,
        ano: veiculos.ano,
        categoria: veiculos.categoria
      })
      .from(veiculos)
      .where(eq(veiculos.ativo, true));

    res.json(listaVeiculos);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Buscar fotos do checklist por vinculação
router.get('/checklist-fotos/:motoristaOrdemServicoId', async (req: any, res: any) => {
  try {
    const motoristaOrdemServicoId = parseInt(req.params.motoristaOrdemServicoId);

    // Buscar fotos de saída
    const fotosSaida = await db
      .select()
      .from(checklist_saida)
      .where(eq(checklist_saida.motoristaOrdemServicoId, motoristaOrdemServicoId));

    // Buscar fotos de chegada
    const fotosChegada = await db
      .select()
      .from(checklist_chegada)
      .where(eq(checklist_chegada.motoristaOrdemServicoId, motoristaOrdemServicoId));

    // Mapear os campos para nomes mais simples
    const saidaFormatada = fotosSaida[0] ? {
      ...fotosSaida[0],
      foto1: fotosSaida[0].foto1Path,
      foto2: fotosSaida[0].foto2Path,
      foto3: fotosSaida[0].foto3Path,
      foto4: fotosSaida[0].foto4Path
    } : null;

    const chegadaFormatada = fotosChegada[0] ? {
      ...fotosChegada[0],
      foto1: fotosChegada[0].foto1Path,
      foto2: fotosChegada[0].foto2Path,
      foto3: fotosChegada[0].foto3Path,
      foto4: fotosChegada[0].foto4Path
    } : null;

    res.json({
      saida: saidaFormatada,
      chegada: chegadaFormatada
    });
  } catch (error) {
    console.error('Erro ao buscar fotos do checklist:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET - Servir imagens do checklist
router.get('/fotos/:filename', (req: any, res: any) => {
  const filename = req.params.filename;
  const imagePath = path.join(process.cwd(), 'uploads', 'checklist', filename);
  
  // Verificar se o arquivo existe
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Imagem não encontrada' });
  }
});

export default router;