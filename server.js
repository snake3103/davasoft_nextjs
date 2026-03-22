// Server standalone con Socket.io - Producción
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

// Rate limiting simple para evitar ataques
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_CONNECTIONS_PER_IP = 100;

const dev = process.env.NODE_ENV !== "production";
const hostname = dev ? "localhost" : process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

// orígenes permitidos en producción
const ALLOWED_ORIGINS = dev 
  ? ["http://localhost:3000", "http://localhost:3001"] 
  : process.env.ALLOWED_ORIGINS?.split(",") || ["https://tudominio.com"];

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Helper para verificar rate limit
function checkRateLimit(ip) {
  const now = Date.now();
  const windowData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > windowData.resetTime) {
    windowData.count = 0;
    windowData.resetTime = now + RATE_LIMIT_WINDOW;
  }
  
  windowData.count++;
  rateLimitMap.set(ip, windowData);
  
  return windowData.count <= MAX_CONNECTIONS_PER_IP;
}

// Cleanup de rate limit map periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: (origin, callback) => {
        // En desarrollo permite todo
        if (dev) {
          callback(null, true);
          return;
        }
        // En producción verifica origen
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          console.log("[Socket.io] Blocked origin:", origin);
          callback(new Error("Origen no permitido"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    // Tiempo de espera de conexión
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware de autenticación para Socket.io
  io.use((socket, next) => {
    const ip = socket.handshake.address;
    
    // Verificar rate limit
    if (!checkRateLimit(ip)) {
      console.log("[Socket.io] Rate limit exceeded for IP:", ip);
      return next(new Error("Demasiadas conexiones"));
    }
    
    // En producción, verificar token de autenticación
    if (!dev) {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      // Aquí podrías verificar el token con NextAuth
      // Por ahora validamos que exista un organizationId
      const organizationId = socket.handshake.auth?.organizationId;
      if (!organizationId) {
        console.log("[Socket.io] Missing organizationId for IP:", ip);
        return next(new Error("Autenticación requerida"));
      }
    }
    
    next();
  });

  io.on("connection", (socket) => {
    const ip = socket.handshake.address;
    
    // Verificar que solo se una a una organización
    let joinedOrg = null;
    
    // Unirse a sala de organización
    socket.on("join-organization", (organizationId) => {
      // Sanitizar input - solo letras, números y guiones
      const safeOrgId = String(organizationId).replace(/[^a-zA-Z0-9-_]/g, "");
      
      if (joinedOrg) {
        socket.leave(`org-${joinedOrg}`);
      }
      
      socket.join(`org-${safeOrgId}`);
      joinedOrg = safeOrgId;
      
      // Limitar a 50 eventos por segundo por socket
      let eventCount = 0;
      const eventInterval = setInterval(() => eventCount = 0, 1000);
      
      socket.on("workOrder-updated", (data) => {
        eventCount++;
        if (eventCount > 50) {
          console.log("[Socket.io] Event rate limit exceeded for socket:", socket.id);
          return;
        }
        
        // Sanitizar datos
        const safeData = {
          organizationId: String(data.organizationId || "").replace(/[^a-zA-Z0-9-_]/g, ""),
          workOrderId: String(data.workOrderId || "").replace(/[^a-zA-Z0-9-_]/g, ""),
          status: String(data.status || "").replace(/[^A-Z_]/g, "").substring(0, 20),
        };
        
        io.to(`org-${safeData.organizationId}`).emit("workOrder-changed", safeData);
      });

      socket.on("workOrder-created", (data) => {
        eventCount++;
        if (eventCount > 50) return;
        
        const safeData = {
          organizationId: String(data.organizationId || "").replace(/[^a-zA-Z0-9-_]/g, ""),
          workOrder: data.workOrder,
        };
        
        io.to(`org-${safeData.organizationId}`).emit("workOrder-added", safeData);
      });

      socket.on("workOrder-deleted", (data) => {
        eventCount++;
        if (eventCount > 50) return;
        
        const safeData = {
          organizationId: String(data.organizationId || "").replace(/[^a-zA-Z0-9-_]/g, ""),
          workOrderId: String(data.workOrderId || "").replace(/[^a-zA-Z0-9-_]/g, ""),
        };
        
        io.to(`org-${safeData.organizationId}`).emit("workOrder-removed", safeData);
      });
    });

    socket.on("disconnect", () => {
      if (joinedOrg) {
        socket.leave(`org-${joinedOrg}`);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${dev ? "localhost" : "0.0.0.0"}:${port}`);
    console.log(`> Socket.io ready on http://${dev ? "localhost" : "0.0.0.0"}:${port}/api/socketio`);
  });
});
