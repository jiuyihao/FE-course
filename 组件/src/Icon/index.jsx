import React, { forwardRef } from "react";
import cs from "classnames";
import "./index.scss";
export const getSize = (size) => {
  if (Array.isArray(size) && size.length === 2) {
    return size;
  }
  const width = size || "1em";
  const height = size || "1em";
  return [width, height];
};
export const Icon = forwardRef((props, ref) => {
  const { style, className, spin, size = "1em", children, ...rest } = props;
  const [width, height] = getSize(size);
  const cn = cs(
    "icon",
    {
      "icon-spin": spin,
    },
    className
  );
  return (
    <svg
      ref={ref}
      className={cn}
      style={style}
      width={width}
      height={height}
      fill="currentColor" //SVG用fill="currentColor"将使用父元素的color
      {...rest}
    >
      {children}
    </svg>
  );
});
