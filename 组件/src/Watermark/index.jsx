import { useRef, useCallback, useEffect } from "react";
import useWatermark from "./useWatermark";

const Watermark = (props) => {
  const {
    className,
    style,
    zIndex,
    width,
    height,
    rotate,
    image,
    content,
    fontStyle,
    gap,
    offset,
    children,
  } = props;

  const containerRef = useRef(null);

  const getContainer = useCallback(() => {
    return props.getContainer ? props.getContainer() : containerRef.current;
  }, [containerRef.current, props.getContainer]);

  const { generateWatermark } = useWatermark({
    zIndex,
    width,
    height,
    rotate,
    image,
    content,
    fontStyle,
    gap,
    offset,
    getContainer,
  });

  useEffect(() => {
    generateWatermark({
      zIndex,
      width,
      height,
      rotate,
      image,
      content,
      fontStyle,
      gap,
      offset,
      getContainer,
    });
  }, [
    zIndex,
    width,
    height,
    rotate,
    image,
    content,
    JSON.stringify(fontStyle),
    JSON.stringify(gap),
    JSON.stringify(offset),
    getContainer,
  ]);

  return children ? (
    <div className={className} style={style} ref={containerRef}>
      {children}
    </div>
  ) : null;
};

export default Watermark;
