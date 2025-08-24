import React, { useState, useContext, useRef, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  List,
  Avatar,
  Spin,
  message,
  Dropdown,
  Menu,
  Modal,
} from "antd";
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  CodeOutlined,
  CopyOutlined,
  DeleteOutlined,
  HistoryOutlined,
  SettingOutlined,
  DiffOutlined,
} from "@ant-design/icons";
import { marked } from "marked";
import { PlaygroundContext } from "../../PlaygroundContext";
import CodeDiff from "../CodeDiff";
import "./index.scss";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}

interface CodeBlock {
  language: string;
  code: string;
  fileName?: string;
}

interface DiffState {
  isVisible: boolean;
  originalCode: string;
  modifiedCode: string;
  language: string;
  fileName: string;
  codeBlock: CodeBlock;
}

const { TextArea } = Input;

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [diffState, setDiffState] = useState<DiffState>({
    isVisible: false,
    originalCode: "",
    modifiedCode: "",
    language: "javascript",
    fileName: "",
    codeBlock: { language: "javascript", code: "" },
  });
  const [sessionId, setSessionId] = useState(() => {
    const saved = localStorage.getItem("ai-session-id");
    if (saved) return saved;
    const newId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("ai-session-id", newId);
    return newId;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { files, selectedFileName, setFiles } = useContext(PlaygroundContext);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 组件加载时恢复会话历史
  useEffect(() => {
    loadSessionHistory();
  }, [sessionId]);

  // 监听来自错误弹窗的AI提问事件
  useEffect(() => {
    const handleAskAIEvent = (event: CustomEvent) => {
      const question = event.detail;
      setInputValue(question);
      // 自动发送消息
      setTimeout(() => {
        sendMessage();
      }, 100);
    };

    window.addEventListener("askAI", handleAskAIEvent as EventListener);

    return () => {
      window.removeEventListener("askAI", handleAskAIEvent as EventListener);
    };
  }, []);
  const loadSessionHistory = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/session/${sessionId}/history`
      );
      if (response.ok) {
        const history = await response.json();
        const restoredMessages: ChatMessage[] = history.messages.map(
          (msg: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            type: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
            timestamp: new Date(),
            codeBlocks:
              msg.role === "assistant" ? extractCodeBlocks(msg.content) : [],
          })
        );
        setMessages(restoredMessages);
      }
    } catch (error) {
      console.log("无法加载会话历史:", error);
    }
  };

  const clearSession = async () => {
    try {
      await fetch(`http://localhost:8080/session/${sessionId}`, {
        method: "DELETE",
      });
      setMessages([]);
      message.success("会话已清除");
    } catch (error) {
      console.error("清除会话失败:", error);
      message.error("清除会话失败");
    }
  };

  const newSession = () => {
    const newId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newId);
    localStorage.setItem("ai-session-id", newId);
    setMessages([]);
    message.success("已创建新会话");
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // 构建代码上下文
      const codeContext = {
        currentFile: files[selectedFileName],
        allFiles: files,
        selectedFileName,
      };

      const response = await fetch("http://123.57.155.100:8080/sse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: inputValue,
          sessionId: sessionId,
          codeContext: codeContext,
        }),
      });

      if (!response.ok) {
        throw new Error("网络请求失败");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "",
        timestamp: new Date(),
        codeBlocks: [],
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                assistantMessage.content += data.text;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...assistantMessage };
                  return newMessages;
                });
              }
            } catch (e) {
              console.error("解析响应数据失败:", e);
            }
          }
        }
      }

      // 解析代码块
      const codeBlocks = extractCodeBlocks(assistantMessage.content);
      assistantMessage.codeBlocks = codeBlocks;
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { ...assistantMessage };
        return newMessages;
      });
    } catch (error) {
      console.error("发送消息失败:", error);
      message.error("发送消息失败，请检查网络连接");
    } finally {
      setIsLoading(false);
    }
  };

  const extractCodeBlocks = (content: string): CodeBlock[] => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const blocks: CodeBlock[] = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || "javascript",
        code: match[2].trim(),
      });
    }

    // 只保留最长的代码块（有完整代码的）
    if (blocks.length === 0) return [];

    // 找到最长的代码块
    const longestBlock = blocks.reduce((longest, current) => {
      return current.code.length > longest.code.length ? current : longest;
    });

    return [longestBlock];
  };

  const applyCodeToEditor = (codeBlock: CodeBlock) => {
    const currentFile = files[selectedFileName];
    const newFiles = {
      ...files,
      [selectedFileName]: {
        ...currentFile,
        value: codeBlock.code,
      },
    };
    setFiles(newFiles);
    message.success("代码已应用到编辑器");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success("代码已复制到剪贴板");
  };

  const sessionMenu = (
    <Menu>
      <Menu.Item key="new" icon={<HistoryOutlined />} onClick={newSession}>
        新建会话
      </Menu.Item>
      <Menu.Item key="clear" icon={<DeleteOutlined />} onClick={clearSession}>
        清除当前会话
      </Menu.Item>
    </Menu>
  );

  // 配置marked选项
  useEffect(() => {
    marked.setOptions({
      breaks: true, // 支持换行
      gfm: true, // 支持GitHub风格的markdown
    });
  }, []);

  // 渲染markdown内容
  const renderMarkdownContent = (content: string) => {
    try {
      const htmlContent = marked(content);
      return (
        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    } catch (error) {
      console.error("Markdown解析错误:", error);
      return <span>{content}</span>;
    }
  };

  const showCodeDiff = (codeBlock: CodeBlock) => {
    const currentFile = files[selectedFileName];
    const originalCode = currentFile?.value || "";
    const language = currentFile?.language || "javascript";

    setDiffState({
      isVisible: true,
      originalCode,
      modifiedCode: codeBlock.code,
      language,
      fileName: selectedFileName,
      codeBlock,
    });
  };

  const handleAcceptDiff = () => {
    applyCodeToEditor(diffState.codeBlock);
    setDiffState((prev) => ({ ...prev, isVisible: false }));
    message.success("代码更改已接受并应用到编辑器");
  };

  const handleRejectDiff = () => {
    setDiffState((prev) => ({ ...prev, isVisible: false }));
    message.info("代码更改已拒绝");
  };

  const handleCloseDiff = () => {
    setDiffState((prev) => ({ ...prev, isVisible: false }));
  };

  const renderMessage = (msg: ChatMessage) => {
    return (
      <div key={msg.id} className={`message ${msg.type}`}>
        <div className="message-header">
          <Avatar
            icon={msg.type === "user" ? <UserOutlined /> : <RobotOutlined />}
            size="small"
          />
          <span className="message-time">
            {msg.timestamp.toLocaleTimeString()}
          </span>
        </div>
        <div className="message-content">
          <div className="message-text">
            {msg.type === "assistant" ? (
              renderMarkdownContent(msg.content)
            ) : (
              <span>{msg.content}</span>
            )}
          </div>
          {msg.codeBlocks && msg.codeBlocks.length > 0 && (
            <div className="code-actions">
              {msg.codeBlocks.map((block, index) => (
                <Card key={index} size="small" className="code-block-card">
                  <div className="code-block-header">
                    <span>代码块 ({block.language})</span>
                    <div className="code-block-actions">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyCode(block.code)}
                      >
                        复制
                      </Button>
                      <Button
                        size="small"
                        icon={<DiffOutlined />}
                        onClick={() => showCodeDiff(block)}
                      >
                        查看差异
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        icon={<CodeOutlined />}
                        onClick={() => applyCodeToEditor(block)}
                      >
                        直接应用
                      </Button>
                    </div>
                  </div>
                  <pre className="code-preview">
                    <code>
                      {block.code.substring(0, 200)}
                      {block.code.length > 200 ? "..." : ""}
                    </code>
                  </pre>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="ai-assistant">
      <div className="ai-header">
        <div className="header-left">
          <RobotOutlined style={{ marginRight: 8 }} />
          AI 代码助手
        </div>
        <div className="header-right">
          <Dropdown overlay={sessionMenu} trigger={["click"]}>
            <Button size="small" icon={<SettingOutlined />} />
          </Dropdown>
        </div>
      </div>

      <div className="session-info">
        <span className="session-id">会话: {sessionId.split("-").pop()}</span>
      </div>

      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <RobotOutlined
              style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }}
            />
            <h3>AI 代码助手</h3>
            <p>我会记住我们的对话历史，可以帮助您：</p>
            <ul>
              <li>生成和优化代码</li>
              <li>修复错误和bug</li>
              <li>解释代码逻辑</li>
              <li>提供技术建议</li>
              <li>基于上下文持续对话</li>
            </ul>
          </div>
        )}

        {messages.map(renderMessage)}

        {isLoading && (
          <div className="loading-message">
            <Avatar icon={<RobotOutlined />} size="small" />
            <Spin size="small" style={{ marginLeft: 8 }} />
            <span style={{ marginLeft: 8 }}>AI 正在思考...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="描述您需要的代码功能或问题...（支持上下文对话）"
          autoSize={{ minRows: 2, maxRows: 4 }}
          onPressEnter={(e) => {
            if (e.shiftKey) return;
            e.preventDefault();
            sendMessage();
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          loading={isLoading}
          disabled={!inputValue.trim()}
        >
          发送
        </Button>
      </div>

      <Modal
        open={diffState.isVisible}
        onCancel={handleCloseDiff}
        footer={null}
        width={1000}
        className="code-diff-modal"
        destroyOnClose
      >
        <CodeDiff
          originalCode={diffState.originalCode}
          modifiedCode={diffState.modifiedCode}
          language={diffState.language}
          fileName={diffState.fileName}
          onAccept={handleAcceptDiff}
          onReject={handleRejectDiff}
          onClose={handleCloseDiff}
        />
      </Modal>
    </div>
  );
}
