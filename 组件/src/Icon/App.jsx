import { useRef } from "react";
import { IconAaa } from "./icnos/icon";
import { createFromIconfont } from "./createFrontIconfont";
import { IconEmail } from "./icnos/icon1";

function App() {
  const IconFont = createFromIconfont(
    "//at.alicdn.com/t/c/font_4443338_a2wwqhorbk4.js"
  );
  return (
    <div style={{ padding: "50px" }}>
      <IconAaa spin></IconAaa>
      <IconEmail></IconEmail>
      <div style={{ padding: "50px" }}>
        <IconFont type="icon-shouye-zhihui" size="40px"></IconFont>
        <IconFont
          type="icon-gerenzhongxin-zhihui"
          fill="blue"
          size="40px"
        ></IconFont>
      </div>
    </div>
  );
}

export default App;
