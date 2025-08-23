import React from "react";

// 创建上下文，默认值为空对象
export const ConfigContext = React.createContext({});

export function ConfigProvider(props) {
  const { space, children } = props;

  return (
    <ConfigContext.Provider value={{ space }}>
      {children}
    </ConfigContext.Provider>
  );
}
