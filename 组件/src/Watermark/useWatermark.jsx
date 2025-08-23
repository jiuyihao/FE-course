import { useEffect, useRef, useState } from "react";
import { merge } from "lodash-es";

// 判断是否为有效数字
export function isNumber(obj) {
  return (
    Object.prototype.toString.call(obj) === "[object Number]" && obj === obj
  );
}

// 将值转换为数字（支持默认值）
const toNumber = (value, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }
  if (isNumber(value)) {
    return value;
  }
  const numberVal = parseFloat(value);
  return isNumber(numberVal) ? numberVal : defaultValue;
};

// 默认水印配置项
const defaultOptions = {
  rotate: -20,
  zIndex: 1,
  width: 100,
  gap: [100, 100],
  fontStyle: {
    fontSize: "16px",
    color: "rgba(0, 0, 0, 0.15)",
    fontFamily: "sans-serif",
    fontWeight: "normal",
  },
  getContainer: () => document.body,
};

// 合并用户配置与默认配置
const getMergedOptions = (o) => {
  const options = o || {};

  const mergedOptions = {
    ...options,
    rotate: options.rotate || defaultOptions.rotate,
    zIndex: options.zIndex || defaultOptions.zIndex,
    fontStyle: { ...defaultOptions.fontStyle, ...options.fontStyle },
    width: toNumber(
      options.width,
      options.image ? defaultOptions.width : undefined
    ),
    height: toNumber(options.height, undefined),
    getContainer: options.getContainer,
    gap: [
      toNumber(options.gap?.[0], defaultOptions.gap[0]),
      toNumber(options.gap?.[1] || options.gap?.[0], defaultOptions.gap[1]),
    ],
  };

  // 处理偏移量
  const mergedOffsetX = toNumber(mergedOptions.offset?.[0], 0);
  const mergedOffsetY = toNumber(
    mergedOptions.offset?.[1] || mergedOptions.offset?.[0],
    0
  );
  mergedOptions.offset = [mergedOffsetX, mergedOffsetY];

  return mergedOptions;
};

// 测量文本尺寸（考虑旋转角度）
const measureTextSize = (ctx, content, rotate) => {
  let width = 0;
  let height = 0;
  const lineSize = [];

  content.forEach((item) => {
    const {
      width: textWidth,
      fontBoundingBoxAscent,
      fontBoundingBoxDescent,
    } = ctx.measureText(item);

    const textHeight = fontBoundingBoxAscent + fontBoundingBoxDescent;

    if (textWidth > width) {
      width = textWidth;
    }

    height += textHeight;
    lineSize.push({ height: textHeight, width: textWidth });
  });

  // 计算旋转后的尺寸
  const angle = (rotate * Math.PI) / 180;
  return {
    originWidth: width,
    originHeight: height,
    width: Math.ceil(
      Math.abs(Math.sin(angle) * height) + Math.abs(Math.cos(angle) * width)
    ),
    height: Math.ceil(
      Math.abs(Math.sin(angle) * width) + Math.abs(height * Math.cos(angle))
    ),
    lineSize,
  };
};

// 生成Canvas水印数据
const getCanvasData = async (options) => {
  const { rotate, image, content, fontStyle, gap } = options;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio;

  // 配置Canvas尺寸和旋转
  const configCanvas = (size) => {
    const canvasWidth = gap[0] + size.width;
    const canvasHeight = gap[1] + size.height;

    canvas.setAttribute("width", `${canvasWidth * ratio}px`);
    canvas.setAttribute("height", `${canvasHeight * ratio}px`);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // 处理缩放和旋转
    ctx.translate((canvasWidth * ratio) / 2, (canvasHeight * ratio) / 2);
    ctx.scale(ratio, ratio);
    const RotateAngle = (rotate * Math.PI) / 180;
    ctx.rotate(RotateAngle);
  };

  // 绘制文本水印
  const drawText = () => {
    const { fontSize, color, fontWeight, fontFamily } = fontStyle;
    const realFontSize = toNumber(fontSize, 0) || fontStyle.fontSize;

    ctx.font = `${fontWeight} ${realFontSize}px ${fontFamily}`;
    const measureSize = measureTextSize(ctx, [...content], rotate);

    const width = options.width || measureSize.width;
    const height = options.height || measureSize.height;

    configCanvas({ width, height });

    // 设置文本样式并绘制
    ctx.fillStyle = color;
    ctx.font = `${fontWeight} ${realFontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    [...content].forEach((item, index) => {
      const { height: lineHeight, width: lineWidth } =
        measureSize.lineSize[index];
      const xStartPoint = -lineWidth / 2;
      const yStartPoint =
        -(options.height || measureSize.originHeight) / 2 + lineHeight * index;

      ctx.fillText(
        item,
        xStartPoint,
        yStartPoint,
        options.width || measureSize.originWidth
      );
    });

    return Promise.resolve({ base64Url: canvas.toDataURL(), height, width });
  };

  // 绘制图片水印
  const drawImage = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.referrerPolicy = "no-referrer";

      img.src = image;
      img.onload = () => {
        let { width, height } = options;
        // 计算图片尺寸（保持比例）
        if (!width || !height) {
          if (width) {
            height = (img.height / img.width) * +width;
          } else {
            width = (img.width / img.height) * +height;
          }
        }

        configCanvas({ width, height });
        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        resolve({ base64Url: canvas.toDataURL(), width, height });
      };
      // 图片加载失败时 fallback 到文本水印
      img.onerror = () => resolve(drawText());
    });
  };

  // 根据配置选择绘制方式
  return image ? drawImage() : drawText();
};

// 水印核心钩子
export default function useWatermark(params) {
  const [options, setOptions] = useState(params || {});
  const mergedOptions = getMergedOptions(options);
  const watermarkDiv = useRef();
  const mutationObserver = useRef();

  const container = mergedOptions.getContainer();
  const { zIndex, gap } = mergedOptions;

  // 绘制水印到容器
  const drawWatermark = () => {
    if (!container) return;

    getCanvasData(mergedOptions).then(({ base64Url, width, height }) => {
      const offsetLeft = mergedOptions.offset[0] + "px";
      const offsetTop = mergedOptions.offset[1] + "px";

      // 构建水印样式
      const wmStyle = `
        width:calc(100% - ${offsetLeft});
        height:calc(100% - ${offsetTop});
        position:absolute;
        top:${offsetTop};
        left:${offsetLeft};
        bottom:0;
        right:0;
        pointer-events: none;
        z-index:${zIndex};
        background-position: 0 0;
        background-size:${gap[0] + width}px ${gap[1] + height}px;
        background-repeat: repeat;
        background-image:url(${base64Url})
      `;

      // 创建或更新水印元素
      if (!watermarkDiv.current) {
        const div = document.createElement("div");
        watermarkDiv.current = div;
        container.append(div);
        container.style.position = "relative";
      }
      watermarkDiv.current?.setAttribute("style", wmStyle.trim());

      // 监听水印元素变化，防止被篡改
      if (container) {
        mutationObserver.current?.disconnect();
        mutationObserver.current = new MutationObserver((mutations) => {
          const isChanged = mutations.some((mutation) => {
            let flag = false;
            // 检测水印元素是否被移除
            if (mutation.removedNodes.length) {
              flag = Array.from(mutation.removedNodes).some(
                (node) => node === watermarkDiv.current
              );
            }
            // 检测水印样式是否被修改
            if (
              mutation.type === "attributes" &&
              mutation.target === watermarkDiv.current
            ) {
              flag = true;
            }
            return flag;
          });

          // 水印被篡改时重新绘制
          if (isChanged) {
            watermarkDiv.current?.parentNode?.removeChild(watermarkDiv.current);
            watermarkDiv.current = undefined;
            drawWatermark();
          }
        });

        // 启动监听
        mutationObserver.current.observe(container, {
          attributes: true,
          subtree: true,
          childList: true,
        });
      }
    });
  };

  // 配置变化时重新绘制水印
  useEffect(() => {
    drawWatermark();
  }, [options]);

  // 提供更新水印配置的方法
  return {
    generateWatermark: (newOptions) => {
      setOptions(merge({}, options, newOptions));
    },
  };
}
