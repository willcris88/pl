import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertUser } from "@shared/schema";

const asyncScrypt = promisify(scrypt);

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// Funções de senha
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString("hex");
  const derivedKey = await asyncScrypt(password, salt, 32) as Buffer;
  return salt + ":" + derivedKey.toString("hex");
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = await asyncScrypt(password, salt, 32) as Buffer;
  return timingSafeEqual(keyBuffer, derivedKey);
}

export function setupAuth(app: Express) {
  // Confia em um proxy reverso (útil para produção e alguns setups de dev)
  app.set("trust proxy", 1);

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'uma-chave-secreta-muito-forte-para-dev',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Cookie válido por 1 dia
      httpOnly: true,
      secure: false, // Em desenvolvimento (HTTP), DEVE ser `false`.
      sameSite: 'lax', // 'lax' é o mais compatível para dev local entre portas.
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configuração do Passport
  passport.use(new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        console.log("Tentativa de login com:", username);
        const user = await storage.getUserByEmail(username);
        if (!user) {
          console.log("Usuário não encontrado:", username);
          return done(null, false, { message: "Usuário não encontrado" });
        }

        const isValidPassword = await verifyPassword(password, user.senha);
        if (!isValidPassword) {
          console.log("Senha incorreta para usuário:", username);
          return done(null, false, { message: "Senha incorreta" });
        }

        console.log("Login bem-sucedido para:", username);
        return done(null, user);
      } catch (error) {
        console.error("Erro no processo de login:", error);
        return done(error);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Rota de registro
  app.post("/api/register", async (req, res) => {
    try {
      const { nome, username, password } = req.body;
      
      // Verifica se o usuário já existe
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Usuário já existe" });
      }

      // Hash da senha
      const hashedPassword = await hashPassword(password);
      
      // Cria o usuário
      const user = await storage.createUser({
        nome,
        email: username,
        senha: hashedPassword,
        ativo: true,
      });

      // Faz login automático após o registro
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Erro ao fazer login após registro" });
        }
        res.status(201).json({
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo || "usuario",
        });
      });
    } catch (error) {
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rota de logout
  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) { return res.status(500).json({ message: "Erro interno do servidor" }); }
      if (!user) { return res.status(401).json({ message: "Email ou senha incorretos" }); }

      req.logIn(user, (err) => {
        if (err) { return res.status(500).json({ message: "Erro ao fazer login" }); }

        return res.status(200).json({
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo: user.tipo
        });
      });
    })(req, res, next);
  });


  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Não autenticado. A sessão não foi encontrada ou é inválida." });
    }
  });
}
