import classnames from 'classnames'
import React, { useEffect, useState, useContext } from 'react'
import { marked } from 'marked'
import { PlaygroundContext } from '../../PlaygroundContext'

import styles from './index.module.scss'

export interface MessageProps {
    type: 'error' | 'warn'
    content: string
    onAskAI?: (errorMessage: string) => void
}

export const Message: React.FC<MessageProps> = (props) => {
  const { type, content, onAskAI } = props
  const [visible, setVisible] = useState(false)
  const { files, selectedFileName } = useContext(PlaygroundContext)

  useEffect(() => {
    setVisible(!!content)
  }, [content])

  const handleAskAI = () => {
    if (onAskAI) {
      const currentFile = files[selectedFileName]
      const contextInfo = `
当前文件: ${selectedFileName}
当前代码:
\`\`\`${currentFile.language}
${currentFile.value}
\`\`\`

错误信息: ${content}

请帮我分析这个错误并提供解决方案。`
      onAskAI(contextInfo)
    }
  }

  // 使用marked解析markdown内容
  const parseMarkdown = (text: string) => {
    try {
      return marked(text)
    } catch (error) {
      return text
    }
  }

  return visible ? (
    <div className={classnames(styles.msg, styles[type])}>
      <div 
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
      />
      <div className={styles.actions}>
        {onAskAI && (
          <button 
            className={styles.askAI} 
            onClick={handleAskAI}
            title="向AI提问"
          >
            🤖
          </button>
        )}
        <button className={styles.dismiss} onClick={() => setVisible(false)}>
          ✕
        </button>
      </div>
    </div>
  ) : null
}
