import { ReactFlowJsonObject, XYPosition } from "reactflow";
import { APIClassType } from "../api/index";

export type FlowType = {
  name: string;
  id: string;
  data: ReactFlowJsonObject | null;
  description: string;
  style?: FlowStyleType;
  is_component?: boolean;
};

export type NodeType = {
  id: string;
  type?: string;
  position: XYPosition;
  data: NodeDataType;
  selected?: boolean;
};

export type NodeDataType = {
  showNode?: boolean;
  type: string;
  node?: APIClassType;
  id: string;
  output_types?: string[];
};
// FlowStyleType is the type of the style object that is used to style the
// Flow card with an emoji and a color.
export type FlowStyleType = {
  emoji: string;
  color: string;
  flow_id: string;
};

export type TweaksType = Array<
  {
    [key: string]: {
      output_key?: string;
    };
  } & FlowStyleType
>;

// right side
export type sourceHandleType = {
  dataType: string;
  id: string;
  baseClasses: string[];
};
//left side
export type targetHandleType = {
  inputTypes?: string[];
  type: string;
  fieldName: string;
  id: string;
  proxy?: { field: string; id: string };
};
