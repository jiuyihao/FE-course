import React from "react";
import { MonacoDiffEditor } from "react-monaco-editor";
const App = () => {
  const code1 = `function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}`;
  const code2 = `function add(x, y) {
  return x + y;
}

function multiply(a, b) {
  return a * b;
}`;
  return (
    <div>
      <MonacoDiffEditor
        width="800"
        height="600"
        language="javascript"
        original={code1}
        value={code2}
      />
    </div>
  );
};

export default App;
