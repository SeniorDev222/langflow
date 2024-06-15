import React, { forwardRef } from "react";
import SvgMetaIcon from "./MetaIcon";

export const MetaIcon = forwardRef<SVGSVGElement, React.PropsWithChildren<{}>>(
  (props, ref) => {
    return <SvgMetaIcon ref={ref} {...props} />;
  },
);
