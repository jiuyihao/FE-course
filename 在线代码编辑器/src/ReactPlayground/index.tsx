import { Allotment } from "allotment";
import "allotment/dist/style.css";
import Header from "./components/Header";
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";
import AIAssistant from "./components/AIAssistant";
import { useContext } from "react";
import { PlaygroundContext } from "./PlaygroundContext";

import "./index.scss";

export default function ReactPlayground() {
  const { theme } = useContext(PlaygroundContext);

  return (
    <div className={theme} style={{ height: "100vh" }}>
      <Header />
      <Allotment defaultSizes={[60, 25, 15]}>
        <Allotment.Pane minSize={200}>
          <CodeEditor />
        </Allotment.Pane>
        <Allotment.Pane minSize={200}>
          <Preview />
        </Allotment.Pane>
        <Allotment.Pane minSize={300}>
          <AIAssistant />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
}
