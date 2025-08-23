import React, { forwardRef } from 'react';
import { Icon } from '.';

export function createIcon(options) {
  const { content, iconProps = {}, viewBox = '0 0 1024 1024' } = options;
  return forwardRef((props, ref) => {
    return (
      <Icon
        ref={ref}
        viewBox={viewBox}
        {...iconProps}
        {...props}
      >
        {content}
      </Icon>
    );
  });
}
    