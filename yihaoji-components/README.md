# React 组件库 yihaoji-components

参考学习[《React 通关秘籍》](https://juejin.cn/book/7294082310658326565) 小册组件库案例

## Install

```
npm install --save yihaoji-components@latest
```

## Usage

### Watermark 组件

```javascript
import { Watermark } from "yihaoji-components";

const App = () => {
  return (
    <Watermark content={["测试水印", "一号机"]}>
      <div style={{ height: 800 }}>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod
          deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos
          recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet,
          id provident!
        </p>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod
          deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos
          recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet,
          id provident!
        </p>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod
          deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos
          recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet,
          id provident!
        </p>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod
          deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos
          recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet,
          id provident!
        </p>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod
          deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos
          recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet,
          id provident!
        </p>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod
          deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos
          recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet,
          id provident!
        </p>
        <p>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod
          deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos
          recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet,
          id provident!
        </p>
      </div>
    </Watermark>
  );
};

export default App;
```

### Calendar

```javascript
import dayjs from "dayjs";
import { Calendar } from "yihaoji-components";
import "yihaoji-components/dist/esm/Calendar/index.css";

function App() {
  return (
    <div>
      <Calendar value={dayjs("2024-07-01")}></Calendar>
    </div>
  );
}

export default App;
```

### Message

```javascript
import { ConfigProvider, useMessage } from "yihaoji-components";
import "yihaoji-components/dist/esm/Message/index.css";

function Aaa() {
  const message = useMessage();

  return (
    <button
      onClick={() => {
        message.add({
          content: "请求成功",
        });
      }}
    >
      成功
    </button>
  );
}

function App() {
  return (
    <ConfigProvider>
      <div>
        <Aaa></Aaa>
      </div>
    </ConfigProvider>
  );
}

export default App;
```

## unpkg 的使用

```js
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/dayjs@1.11.11/dayjs.min.js"></script>
    <script src="https://unpkg.com/yihaoji-components@0.0.3/dist/umd/yihaoji-components.js"></script>

    <link
      rel="stylesheet"
      href="https://unpkg.com/yihaoji-components@0.0.3/dist/esm/Calendar/index.css"
    />
  </head>
  <body>
    <div id="root"></div>
    <script>
      const container = document.getElementById("root");
      const root = ReactDOM.createRoot(container);

      root.render(
        React.createElement(Yihaoji.Calendar, { value: dayjs("2024-07-01") })
      );
    </script>
  </body>
</html>
```
