# 🚀 Guia de Instalação para Windows

Este projeto foi otimizado para rodar perfeitamente no Windows sem erros de compilação nativa.

## 📋 Pré-requisitos

1. **Node.js** versão 18 ou superior
   - Baixe em: https://nodejs.org/
   - Verifique: `node --version`

2. **npm** versão 8 ou superior
   - Vem com Node.js
   - Verifique: `npm --version`

3. **Git** (opcional, mas recomendado)
   - Baixe em: https://git-scm.com/

## 🔧 Instalação Rápida

### Opção 1: Script Automático (Recomendado)
```cmd
# Execute o script de instalação
install-windows.bat
```

### Opção 2: Instalação Manual
```cmd
# Limpar instalações anteriores (se necessário)
rmdir /s /q node_modules
del package-lock.json

# Instalar dependências (sem opcionais problemáticas)
npm install --no-optional --legacy-peer-deps

# Verificar se está tudo OK
npm run check
```

## 🚀 Como Executar

### Desenvolvimento
```cmd
# Opção 1: Script batch
run-dev.bat

# Opção 2: npm script
npm run dev:windows

# Opção 3: npm script cross-platform
npm run dev
```

### Build para Produção
```cmd
npm run build
npm start
```

## 🛠️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (cross-platform) |
| `npm run dev:windows` | Inicia servidor de desenvolvimento (Windows) |
| `npm run build` | Build completo (client + server) |
| `npm run build:client` | Build apenas do cliente |
| `npm run build:server` | Build apenas do servidor |
| `npm start` | Inicia aplicação em produção |
| `npm run check` | Verifica TypeScript |
| `npm run db:push` | Sincroniza schema do banco |
| `npm run clean` | Limpa arquivos de build |

## ❌ Dependências Removidas (Problemáticas no Windows)

Para garantir compatibilidade total com Windows, as seguintes dependências foram removidas:

- **sharp** - Substituído por `jimp` (processamento de imagem)
- **pdf2pic** - Removido (conversão PDF para imagem)
- **bufferutil** - Removido (opcional para WebSocket)

## 🔍 Solução de Problemas

### Erro de "node-gyp"
```cmd
# Instalar ferramentas de build (se necessário)
npm install -g windows-build-tools
```

### Erro de permissão
```cmd
# Execute o CMD como administrador
```

### Erro de cache
```cmd
npm run clean
npm cache clean --force
```

### Problemas com TypeScript
```cmd
npm run check
# Se houver erros, verifique os arquivos .ts
```

## 📁 Estrutura do Projeto

```
├── client/          # Aplicação React (Frontend)
├── server/          # API Express (Backend)
├── shared/          # Código compartilhado
├── migrations/      # Migrações do banco
├── scripts/         # Scripts de automação
├── run-dev.bat      # Script de desenvolvimento (Windows)
├── install-windows.bat  # Script de instalação (Windows)
└── package.json     # Dependências otimizadas
```

## 🌐 URLs de Desenvolvimento

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Banco de dados**: Configurar no arquivo `.env`

## 📝 Próximos Passos

1. Configure as variáveis de ambiente no arquivo `.env`
2. Execute as migrações do banco: `npm run db:push`
3. Inicie o servidor: `npm run dev:windows`
4. Acesse: http://localhost:5173

## 🆘 Suporte

Se encontrar problemas:
1. Execute `npm run clean`
2. Execute `install-windows.bat` novamente
3. Verifique se todos os pré-requisitos estão instalados
4. Execute `npm run check` para verificar erros de TypeScript