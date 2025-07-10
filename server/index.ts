import express, { type Request, Response, NextFunction } from "express";
import cors from "cors"; // Importe o pacote cors
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Criar diretórios necessários se não existirem (Windows compatibility)
const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Garantir que os diretórios existem
ensureDirectoryExists(process.env.UPLOAD_PATH || './uploads');
ensureDirectoryExists(process.env.LOG_PATH || './logs');

const app = express();

// 1. CONFIGURAÇÃO DO CORS (DEVE VIR PRIMEIRO)
// Configuração de CORS baseada em variáveis de ambiente
const corsOrigin = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : process.env.NODE_ENV === 'production' 
    ? false // Em produção, deve especificar domínios explícitos
    : true; // Em desenvolvimento, permite todos os domínios

app.use(cors({
  origin: corsOrigin,
  credentials: true, // Essencial para permitir o envio de cookies
}));

// 2. Middlewares para parse do corpo da requisição
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de log (seu código original)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  // 3. O registro das rotas (que inclui a configuração da sessão e do passport)
  console.log("=== REGISTRANDO ROTAS DO BACKEND ===");
  const server = await registerRoutes(app);
  console.log("=== ROTAS REGISTRADAS COM SUCESSO ===");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Erro global capturado:", err);
    if (!res.headersSent) {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    }
  });

  // 4. Por último, configura o Vite para servir o frontend
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000");
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "0.0.0.0";
  
  server.listen({
    port,
    host,
  }, () => {
    log(`serving on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  });
})();
