import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    const { message, projectId } = req.body;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const writer = (text) => {
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                res.write(`act:${line}\n`);
            }
        }
    };

    try {
        const stream = await agent.stream(
            { messages: [ { role: "user", content: message } ] },
            { context: { projectId, writer }, streamMode: "values" }
        );

        let lastState = null;
        for await (const state of stream) {
            lastState = state;
        }

        if (lastState?.messages?.length) {
            const msgs = lastState.messages;
            for (let i = msgs.length - 1; i >= 0; i--) {
                const m = msgs[i];
                const role = m.role ?? m._getType?.();
                if ((role === 'ai' || role === 'assistant') && !m.tool_calls?.length) {
                    const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
                    const lines = content.split('\n');
                    for (const line of lines) {
                        res.write(`msg:${line}\n`);
                    }
                    break;
                }
            }
        }

        res.end();
    } catch (error) {
        console.error("Error invoking agent:", error);
        if (res.headersSent) {
            res.end();
        } else {
            res.status(500).json({ error: "Failed to invoke agent" });
        }
    }
});

export default agentRouter;