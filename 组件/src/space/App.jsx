import "./app.css";
import Space from "./index";
import { ConfigProvider } from "./ConfigProvider";

export default function App() {
  return (
    <div>
      <ConfigProvider space={{ size: 20 }}>
        <Space direction="horizontal">
          <div className="box"></div>
          <div className="box"></div>
          <div className="box"></div>
        </Space>
        <Space direction="vertical">
          <div className="box"></div>
          <div className="box"></div>
          <div className="box"></div>
        </Space>
        
      </ConfigProvider>
    </div>
  );
}
