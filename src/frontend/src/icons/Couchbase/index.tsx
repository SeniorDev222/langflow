import React, { forwardRef } from "react";
import SvgCouchbaseIcon from "./Couchbase";

export const CouchbaseIcon = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <SvgCouchbaseIcon ref={ref} {...props} />;
});
