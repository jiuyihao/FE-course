import OpenAI from "openai";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 存储会话上下文
const sessions = new Map();

// 清理过期会话（30分钟无活动）
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > 30 * 60 * 1000) {
      sessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // 每5分钟检查一次

function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      messages: [
        {
          role: "system",
          content: `你是一个专业的代码助手，专门帮助开发者编写、优化和调试代码。你的职责包括：

1. 根据用户描述生成高质量的代码
2. 分析和修复代码中的错误
3. 优化代码性能和可读性
4. 解释代码逻辑和最佳实践
5. 提供技术建议和解决方案

请始终：
- 提供清晰、可执行的代码
- 包含必要的注释和说明
- 考虑代码的可维护性和性能
- 遵循最佳编程实践
- 根据上下文提供相关建议

当用户提供代码上下文时，请仔细分析现有代码结构，确保你的建议与项目架构保持一致。`
        }
      ],
      codeContext: null,
      lastActivity: Date.now()
    });
  }
  
  // 更新最后活动时间
  sessions.get(sessionId).lastActivity = Date.now();
  return sessions.get(sessionId);
}

async function main(content, res, sessionId = 'default', codeContext = null) {
  try {
    const session = getOrCreateSession(sessionId);
    
    // 如果提供了代码上下文，更新会话中的上下文信息
    if (codeContext) {
      session.codeContext = codeContext;
      
      // 构建包含上下文的消息
      const contextMessage = `当前代码上下文：
文件名：${codeContext.selectedFileName}
当前文件内容：
\`\`\`${codeContext.currentFile.language}
${codeContext.currentFile.value}
\`\`\`

项目文件结构：
${Object.keys(codeContext.allFiles).map(fileName => `- ${fileName} (${codeContext.allFiles[fileName].language})`).join('\n')}

用户请求：${content}`;
      
      session.messages.push({
        role: "user",
        content: contextMessage
      });
    } else {
      // 普通消息
      session.messages.push({
        role: "user",
        content: content
      });
    }

    // 限制消息历史长度，保留最近的20条消息（包括系统消息）
    if (session.messages.length > 21) {
      session.messages = [
        session.messages[0], // 保留系统消息
        ...session.messages.slice(-20) // 保留最近20条
      ];
    }

    const response = await openai.chat.completions.create({
      messages: session.messages,
      model: "deepseek-chat",
      stream: true,
      temperature: 0.7,
      max_tokens: 4000
    });

    let assistantMessage = "";

    for await (const chunk of response) {
      if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta) {
        const content = chunk.choices[0].delta.content || "";
        assistantMessage += content;
        res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
      }
    }

    // 将助手的回复添加到会话历史
    session.messages.push({
      role: "assistant",
      content: assistantMessage
    });

  } catch (error) {
    console.error("Error in OpenAI request:", error);
    res.write(
      `event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`
    );
  } finally {
    res.end();
  }
}

// 获取会话历史
function getSessionHistory(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }
  
  return {
    messages: session.messages.filter(msg => msg.role !== 'system'),
    codeContext: session.codeContext,
    lastActivity: session.lastActivity
  };
}

// 清除会话
function clearSession(sessionId) {
  return sessions.delete(sessionId);
}

// 获取所有活跃会话
function getActiveSessions() {
  const now = Date.now();
  const activeSessions = [];
  
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity < 30 * 60 * 1000) {
      activeSessions.push({
        sessionId,
        lastActivity: session.lastActivity,
        messageCount: session.messages.length - 1 // 排除系统消息
      });
    }
  }
  
  return activeSessions;
}

export { main, getSessionHistory, clearSession, getActiveSessions };
