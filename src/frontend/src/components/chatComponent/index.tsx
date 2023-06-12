import { Context, useEffect, useRef, useState, useContext } from "react";
import ReactFlow, { useNodes } from "reactflow";
import { ChatMessageType, ChatType } from "../../types/chat";
import ChatTrigger from "./chatTrigger";
import BuildTrigger from "./buildTrigger";
import ChatModal from "../../modals/chatModal";

import _, { set } from "lodash";
import { getBuildStatus } from "../../controllers/API";
import { NodeType } from "../../types/flow";

export default function Chat({ flow }: ChatType) {
  const [open, setOpen] = useState(false);
  const [isBuilt, setIsBuilt] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === "K" || event.key === "k") &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        setOpen((oldState) => !oldState);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Define an async function within the useEffect hook
    const fetchBuildStatus = async () => {
      const response = await getBuildStatus(flow.id);
      setIsBuilt(response.built);
    };

    // Call the async function
    fetchBuildStatus();
  }, [flow]);

  const prevNodesRef = useRef<any[] | undefined>();
  const nodes = useNodes();
  useEffect(() => {
    const prevNodes = prevNodesRef.current;
    const currentNodes = nodes.map(
      (node: NodeType) => node.data.node.template.value
    );

    if (
      prevNodes &&
      JSON.stringify(prevNodes) !== JSON.stringify(currentNodes)
    ) {
      setIsBuilt(false);
      console.log("Nodes changed");
    }

    prevNodesRef.current = currentNodes;
  }, [nodes]);

  return (
    <>
      <ChatModal key={flow.id} flow={flow} open={open} setOpen={setOpen} />

      {isBuilt ? (
        <div>
          <BuildTrigger
            open={open}
            flow={flow}
            setIsBuilt={setIsBuilt}
            isBuilt={isBuilt}
          />
          <ChatTrigger open={open} setOpen={setOpen} isBuilt={isBuilt} />
        </div>
      ) : (
        <BuildTrigger
          open={open}
          flow={flow}
          setIsBuilt={setIsBuilt}
          isBuilt={isBuilt}
        />
      )}
    </>
  );
}
