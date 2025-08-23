import React from "react";
import classNames from "classnames";
import "./index.scss";
import { ConfigContext } from "./ConfigProvider";

const spaceSize = {
  small: 8,
  middle: 16,
  large: 24,
};

function getNumberSize(size) {
  return typeof size === "string" ? spaceSize[size] : size || 0;
}

const Space = (props) => {
  const { space } = React.useContext(ConfigContext);

  const {
    className,
    style,
    children,
    size = space?.size || "small",
    direction = "horizontal",
    align,
    split,
    wrap = false,
    ...otherProps
  } = props;

  const childNodes = React.Children.toArray(children);

  const mergedAlign =
    direction === "horizontal" && align === undefined ? "center" : align;
  const cn = classNames(
    "space",
    `space-${direction}`,
    {
      [`space-align-${mergedAlign}`]: mergedAlign,
    },
    className
  );

  const nodes = childNodes.map((child, i) => {
    const key = (child && child.key) || `space-item-${i}`;

    return (
      <>
        <div className="space-item" key={key}>
          {child}
        </div>
        {i < childNodes.length - 1 && split && (
          <span className={`${className}-split`} style={style}>
            {split}
          </span>
        )}
      </>
    );
  });

  const otherStyles = {};

  const [horizontalSize, verticalSize] = React.useMemo(
    () =>
      (Array.isArray(size) ? size : [size, size]).map((item) =>
        getNumberSize(item)
      ),
    [size]
  );

  otherStyles.columnGap = horizontalSize;
  otherStyles.rowGap = verticalSize;

  if (wrap) {
    otherStyles.flexWrap = "wrap";
  }

  return (
    <div
      className={cn}
      style={{
        ...otherStyles,
        ...style,
      }}
      {...otherProps}
    >
      {nodes}
    </div>
  );
};

export default Space;
