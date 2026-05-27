import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import sandboxRouter from './routes/sandbox.routes.js';


const app = express();

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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/sandbox/health', (req, res) => {
    res.status(200).json({
        message: 'Sandbox API is healthy',
        status: 'ok'
    });
});

app.use('/api/sandbox', sandboxRouter);

export default app;