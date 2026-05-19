import express from 'express';
import agentRouter from './routes/agent.routes.js';
import morgan from 'morgan';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/ai", agentRouter);

export default app;