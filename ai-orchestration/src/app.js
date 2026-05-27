import express from 'express';
import agentRouter from './routes/agent.routes.js';
import morgan from 'morgan';

const app = express();

// Middleware
const HEALTH_CHECK_PATHS = new Set([
  "/_status/healthz",
  "/api/status/healthz",
  "/api/status/readyz",
  "/api/sandbox/health",
]);

app.use(
  morgan("dev", {
    skip: (req) =>
      HEALTH_CHECK_PATHS.has(req.path) ||
      req.get("user-agent")?.startsWith("kube-probe"),
  })
);
app.use(express.json());

app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({ status: "ok" });
})

// Routes
app.use("/api/ai", agentRouter);

export default app;