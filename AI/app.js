import express from "express";
import cors from "cors";
import { main, getSessionHistory, clearSession, getActiveSessions } from "./ai.js";

const app = express();
const PORT = 8080;

// 允许跨域
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 增加请求体大小限制

// 主要的SSE聊天接口
app.post("/sse", (req, res) => {
  try {
    const { content, sessionId = 'default', codeContext } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: '缺少content参数' });
    }
    
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    });

    main(content, res, sessionId, codeContext);
  } catch (error) {
    console.error("Error in handling request:", error);
    res.write(
      `event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`
    );
    res.end();
  }
});

// 获取会话历史
app.get("/session/:sessionId/history", (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = getSessionHistory(sessionId);
    
    if (!history) {
      return res.status(404).json({ error: '会话不存在' });
    }
    
    res.json(history);
  } catch (error) {
    console.error("Error getting session history:", error);
    res.status(500).json({ error: error.message });
  }
});

// 清除会话
app.delete("/session/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const deleted = clearSession(sessionId);
    
    res.json({ 
      success: deleted,
      message: deleted ? '会话已清除' : '会话不存在'
    });
  } catch (error) {
    console.error("Error clearing session:", error);
    res.status(500).json({ error: error.message });
  }
});

// 获取所有活跃会话
app.get("/sessions", (req, res) => {
  try {
    const sessions = getActiveSessions();
    res.json({ sessions });
  } catch (error) {
    console.error("Error getting active sessions:", error);
    res.status(500).json({ error: error.message });
  }
});

// 健康检查
app.get("/health", (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`AI服务运行在 http://localhost:${PORT}`);
  console.log('可用接口:');
  console.log('  POST /sse - 聊天接口');
  console.log('  GET /session/:sessionId/history - 获取会话历史');
  console.log('  DELETE /session/:sessionId - 清除会话');
  console.log('  GET /sessions - 获取活跃会话列表');
  console.log('  GET /health - 健康检查');
});
