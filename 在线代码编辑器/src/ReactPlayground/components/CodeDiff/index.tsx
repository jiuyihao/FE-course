import React from "react";
import { MonacoDiffEditor } from "react-monaco-editor";
import { Button, Card, Space } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import "./index.scss";

interface CodeDiffProps {
  originalCode: string;
  modifiedCode: string;
  language: string;
  fileName?: string;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

export default function CodeDiff({
  originalCode,
  modifiedCode,
  language,
  fileName,
  onAccept,
  onReject,
  onClose,
}: CodeDiffProps) {
  return (
    <Card
      className="code-diff-container"
      title={`代码差异对比 ${fileName ? `- ${fileName}` : ""}`}
    >
      <div className="diff-editor-wrapper">
        <MonacoDiffEditor
          width="100%"
          height="400"
          language={language}
          original={originalCode}
          value={modifiedCode}
          options={{
            readOnly: false,
            renderSideBySide: true,
            enableSplitViewResizing: true,
            renderLineHighlight: "all",
            scrollBeyondLastLine: false,
            minimap: { enabled: false },
            wordWrap: "on",
            fontSize: 14,
            lineNumbers: "on",
            glyphMargin: true,
            folding: true,
            selectOnLineNumbers: true,
            automaticLayout: true,
          }}
        />
      </div>

      <div className="diff-actions">
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={onAccept}
            size="large"
          >
            Accept (接受更改)
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={onReject}
            size="large"
          >
            Reject (拒绝更改)
          </Button>
        </Space>
      </div>
    </Card>
  );
}
