import "./App.css";
import dayjs from "dayjs";
import { Calendar, Watermark } from "yihaoji-components";

function App() {
  return (
    <Watermark content={["测试水印", "一号机"]}>
      <div style={{ padding: 16 }}>
        <Calendar value={dayjs("2024-07-01")} />
      </div>
    </Watermark>
  );
}

export default App;
