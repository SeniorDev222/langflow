import { AxiosError } from "axios";
import _, { cloneDeep } from "lodash";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  ReactFlowJsonObject,
  Viewport,
  XYPosition,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import ShortUniqueId from "short-unique-id";
import {
  deleteFlowFromDatabase,
  downloadFlowsFromDatabase,
  getVersion,
  readFlowsFromDatabase,
  saveFlowToDatabase,
  updateFlowInDatabase,
  uploadFlowsToDatabase,
} from "../controllers/API";
import { APIClassType } from "../types/api";
import { tweakType } from "../types/components";
import {
  FlowType,
  NodeDataType,
  NodeType,
  sourceHandleType,
  targetHandleType,
} from "../types/flow";
import { FlowsContextType, FlowsState } from "../types/tabs";
import {
  addVersionToDuplicates,
  checkOldEdgesHandles,
  cleanEdges,
  createFlowComponent,
  removeFileNameFromComponents,
  scapeJSONParse,
  scapedJSONStringfy,
  updateEdgesHandleIds,
  updateIds,
} from "../utils/reactflowUtils";
import {
  createRandomKey,
  getRandomDescription,
  getRandomName,
} from "../utils/utils";
import { alertContext } from "./alertContext";
import { AuthContext } from "./authContext";
import { typesContext } from "./typesContext";

const uid = new ShortUniqueId({ length: 5 });

const FlowsContextInitialValue: FlowsContextType = {
  //Remove tab id and get current id from url
  tabId: "",
  setTabId: (index: string) => {},
  isLoading: true,
  flows: [],
  removeFlow: (id: string) => {},
  addFlow: async (
    newProject: boolean,
    flowData?: FlowType,
    override?: boolean
  ) => "",
  deleteNode: () => {},
  deleteEdge: () => {},
  incrementNodeId: () => uid(),
  downloadFlow: (flow: FlowType) => {},
  downloadFlows: () => {},
  uploadFlows: () => {},
  uploadFlow: async () => "",
  isBuilt: false,
  setIsBuilt: (state: boolean) => {},
  saveFlow: async (flow?: FlowType, silent?: boolean) => {},
  lastCopiedSelection: null,
  setLastCopiedSelection: (selection: any) => {},
  isPending: false,
  setPending: (pending: boolean) => {},
  tabsState: {},
  setTabsState: () => {},
  getNodeId: (nodeType: string) => "",
  setTweak: (tweak: any) => {},
  getTweak: [],
  paste: (
    selection: { nodes: any; edges: any },
    position: { x: number; y: number; paneX?: number; paneY?: number }
  ) => {},
  saveComponent: async (component: NodeDataType, override: boolean) => "",
  deleteComponent: (key: string) => {},
  version: "",
  nodes: [],
  setNodes: () => {},
  setNode: () => {},
  getNode: () => undefined,
  onNodesChange: () => {},
  edges: [],
  setEdges: () => {},
  onEdgesChange: () => {},
};

export const FlowsContext = createContext<FlowsContextType>(
  FlowsContextInitialValue
);

export function FlowsProvider({ children }: { children: ReactNode }) {
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const { getAuthentication, isAuthenticated } = useContext(AuthContext);

  const [tabId, setTabId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [flows, setFlows] = useState<Array<FlowType>>([]);
  const { reactFlowInstance, setData } = useContext(typesContext);
  const [lastCopiedSelection, setLastCopiedSelection] = useState<{
    nodes: any;
    edges: any;
  } | null>(null);
  const [tabsState, setTabsState] = useState<FlowsState>({});
  const [getTweak, setTweak] = useState<tweakType>([]);

  const [nodes, setNodesInternal, onNodesChangeInternal] = useNodesState([]);

  const [edges, setEdgesInternal, onEdgesChangeInternal] = useEdgesState([]);

  const setPending = (pending: boolean) => {
    setTabsState((prev: FlowsState) => {
      return {
        ...prev,
        [tabId]: {
          ...prev[tabId],
          isPending: pending,
        },
      };
    });
  };

  const isPending = tabsState[tabId]?.isPending ?? false;

  const onNodesChange = useCallback(
    (change: NodeChange[]) => {
      onNodesChangeInternal(change);
      if (!isPending) setPending(true);
    },
    [onNodesChangeInternal, setPending, isPending]
  );

  const onEdgesChange = useCallback(
    (edges: EdgeChange[]) => {
      onEdgesChangeInternal(edges);
      if (!isPending) setPending(true);
    },
    [onEdgesChangeInternal, setPending, isPending]
  );

  const setNodes = (change: Node[] | ((oldState: Node[]) => Node[])) => {
    let newChange = typeof change === "function" ? change(nodes) : change;
    let newEdges = cleanEdges(newChange, edges);

    saveCurrentFlow(
      newChange,
      newEdges,
      reactFlowInstance?.getViewport() ?? { zoom: 1, x: 0, y: 0 }
    );
    setEdgesInternal(newEdges);
    setNodesInternal(newChange);
  };

  const setNode = (id: string, change: Node | ((oldState: Node) => Node)) => {
    let newChange =
      typeof change === "function"
        ? change(nodes.find((node) => node.id === id)!)
        : change;

    setNodes((oldNodes) =>
      oldNodes.map((node) => {
        if (node.id === id) {
          return newChange;
        }
        return node;
      })
    );
  };

  const getNode = (id: string) => {
    return nodes.find((node) => node.id === id);
  };

  const setEdges = (change: Edge[] | ((oldState: Edge[]) => Edge[])) => {
    let newChange = typeof change === "function" ? change(edges) : change;

    saveCurrentFlow(
      nodes,
      newChange,
      reactFlowInstance?.getViewport() ?? { zoom: 1, x: 0, y: 0 }
    );
    setEdgesInternal(newChange);
  };

  const newNodeId = useRef(uid());

  function incrementNodeId() {
    newNodeId.current = uid();
    return newNodeId.current;
  }

  function refreshFlows() {
    setIsLoading(true);
    getTabsDataFromDB().then((DbData) => {
      if (DbData) {
        try {
          processFlows(DbData, false);
          updateStateWithDbData(DbData);
          setIsLoading(false);
        } catch (e) {}
      }
    });
  }

  useEffect(() => {
    // If the user is authenticated, fetch the types. This code is important to check if the user is auth because of the execution order of the useEffect hooks.
    if (getAuthentication() === true) {
      // get data from db
      refreshFlows();
    }
  }, [getAuthentication(), tabId]);

  function getTabsDataFromDB() {
    //get tabs from db
    return readFlowsFromDatabase();
  }

  function processFlows(DbData: FlowType[], skipUpdate = true) {
    let savedComponents: { [key: string]: APIClassType } = {};
    DbData.forEach((flow: FlowType) => {
      try {
        if (!flow.data) {
          return;
        }
        if (flow.data && flow.is_component) {
          (flow.data.nodes[0].data as NodeDataType).node!.display_name =
            flow.name;
          savedComponents[
            createRandomKey(
              (flow.data.nodes[0].data as NodeDataType).type,
              uid()
            )
          ] = _.cloneDeep((flow.data.nodes[0].data as NodeDataType).node!);
          return;
        }
        if (!skipUpdate) processDataFromFlow(flow, false);
      } catch (e) {
        console.log(e);
      }
    });
    setData((prev) => {
      let newData = cloneDeep(prev);
      newData["saved_components"] = cloneDeep(savedComponents);
      return newData;
    });
  }

  function processFlowEdges(flow: FlowType) {
    if (!flow.data || !flow.data.edges) return;
    if (checkOldEdgesHandles(flow.data.edges)) {
      const newEdges = updateEdgesHandleIds(flow.data);
      flow.data.edges = newEdges;
    }
    //update edges colors
    flow.data.edges.forEach((edge) => {
      edge.className = "";
      edge.style = { stroke: "#555" };
    });
  }

  function updateStateWithDbData(tabsData: FlowType[]) {
    setFlows(tabsData);
  }

  /**
   * Downloads the current flow as a JSON file
   */
  function downloadFlow(
    flow: FlowType,
    flowName: string,
    flowDescription?: string
  ) {
    let clonedFlow = cloneDeep(flow);
    removeFileNameFromComponents(clonedFlow);
    // create a data URI with the current flow data
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify({
        ...clonedFlow,
        name: flowName,
        description: flowDescription,
      })
    )}`;

    // create a link element and set its properties
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${
      flowName && flowName != ""
        ? flowName
        : flows.find((f) => f.id === tabId)!.name
    }.json`;

    // simulate a click on the link element to trigger the download
    link.click();
  }

  function downloadFlows() {
    downloadFlowsFromDatabase().then((flows) => {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(flows)
      )}`;

      // create a link element and set its properties
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `flows.json`;

      // simulate a click on the link element to trigger the download
      link.click();
    });
  }

  function getNodeId(nodeType: string) {
    return nodeType + "-" + incrementNodeId();
  }

  /**
   * Creates a file input and listens to a change event to upload a JSON flow file.
   * If the file type is application/json, the file is read and parsed into a JSON object.
   * The resulting JSON object is passed to the addFlow function.
   */
  async function uploadFlow({
    newProject,
    file,
    isComponent = false,
    position = { x: 10, y: 10 },
  }: {
    newProject: boolean;
    file?: File;
    isComponent?: boolean;
    position?: XYPosition;
  }): Promise<String | never> {
    return new Promise(async (resolve, reject) => {
      let id;
      if (file) {
        let text = await file.text();
        let fileData = JSON.parse(text);
        if (
          newProject &&
          ((!fileData.is_component && isComponent === true) ||
            (fileData.is_component !== undefined &&
              fileData.is_component !== isComponent))
        ) {
          reject("You cannot upload a component as a flow or vice versa");
        } else {
          if (fileData.flows) {
            fileData.flows.forEach((flow: FlowType) => {
              id = addFlow(newProject, flow, undefined, position);
            });
            resolve("");
          } else {
            id = await addFlow(newProject, fileData, undefined, position);
            resolve(id);
          }
        }
      } else {
        // create a file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        // add a change event listener to the file input
        input.onchange = async (e: Event) => {
          if (
            (e.target as HTMLInputElement).files![0].type === "application/json"
          ) {
            const currentfile = (e.target as HTMLInputElement).files![0];
            let text = await currentfile.text();
            let fileData: FlowType = await JSON.parse(text);

            if (
              (!fileData.is_component && isComponent === true) ||
              (fileData.is_component !== undefined &&
                fileData.is_component !== isComponent)
            ) {
              reject("You cannot upload a component as a flow or vice versa");
            } else {
              id = await addFlow(newProject, fileData);
              resolve(id);
            }
          }
        };
        // trigger the file input click event to open the file dialog
        input.click();
      }
    });
  }

  function uploadFlows() {
    // create a file input
    const input = document.createElement("input");
    input.type = "file";
    // add a change event listener to the file input
    input.onchange = (event: Event) => {
      // check if the file type is application/json
      if (
        (event.target as HTMLInputElement).files![0].type === "application/json"
      ) {
        // get the file from the file input
        const file = (event.target as HTMLInputElement).files![0];
        // read the file as text
        const formData = new FormData();
        formData.append("file", file);
        uploadFlowsToDatabase(formData).then(() => {
          refreshFlows();
        });
      }
    };
    // trigger the file input click event to open the file dialog
    input.click();
  }
  /**
   * Removes a flow from an array of flows based on its id.
   * Updates the state of flows and tabIndex using setFlows and setTabIndex hooks.
   * @param {string} id - The id of the flow to remove.
   */
  async function removeFlow(id: string) {
    const index = flows.findIndex((flow) => flow.id === id);
    if (index >= 0) {
      await deleteFlowFromDatabase(id);
      //removes component from data if there is any
      setFlows(flows.filter((flow) => flow.id !== id));
      processFlows(flows.filter((flow) => flow.id !== id));
    }
  }
  /**
   * Add a new flow to the list of flows.
   * @param flow Optional flow to add.
   */
  function paste(
    selectionInstance: { nodes: Node[]; edges: Edge[] },
    position: { x: number; y: number; paneX?: number; paneY?: number }
  ) {
    let minimumX = Infinity;
    let minimumY = Infinity;
    let idsMap = {};
    let newNodes: Node<NodeDataType>[] = nodes;
    let newEdges = edges;
    selectionInstance.nodes.forEach((node: Node) => {
      if (node.position.y < minimumY) {
        minimumY = node.position.y;
      }
      if (node.position.x < minimumX) {
        minimumX = node.position.x;
      }
    });

    const insidePosition = position.paneX
      ? { x: position.paneX + position.x, y: position.paneY! + position.y }
      : reactFlowInstance!.screenToFlowPosition({
          x: position.x,
          y: position.y,
        });

    selectionInstance.nodes.forEach((node: NodeType) => {
      // Generate a unique node ID
      let newId = getNodeId(node.data.type);
      idsMap[node.id] = newId;

      // Create a new node object
      const newNode: NodeType = {
        id: newId,
        type: "genericNode",
        position: {
          x: insidePosition.x + node.position!.x - minimumX,
          y: insidePosition.y + node.position!.y - minimumY,
        },
        data: {
          ..._.cloneDeep(node.data),
          id: newId,
        },
      };

      // Add the new node to the list of nodes in state
      newNodes = newNodes
        .map((node) => ({ ...node, selected: false }))
        .concat({ ...newNode, selected: false });
    });
    setNodes(newNodes);

    selectionInstance.edges.forEach((edge: Edge) => {
      let source = idsMap[edge.source];
      let target = idsMap[edge.target];
      const sourceHandleObject: sourceHandleType = scapeJSONParse(
        edge.sourceHandle!
      );
      let sourceHandle = scapedJSONStringfy({
        ...sourceHandleObject,
        id: source,
      });
      sourceHandleObject.id = source;

      edge.data.sourceHandle = sourceHandleObject;
      const targetHandleObject: targetHandleType = scapeJSONParse(
        edge.targetHandle!
      );
      let targetHandle = scapedJSONStringfy({
        ...targetHandleObject,
        id: target,
      });
      targetHandleObject.id = target;
      edge.data.targetHandle = targetHandleObject;
      let id =
        "reactflow__edge-" +
        source +
        sourceHandle +
        "-" +
        target +
        targetHandle;
      newEdges = addEdge(
        {
          source,
          target,
          sourceHandle,
          targetHandle,
          id,
          data: cloneDeep(edge.data),
          style: { stroke: "#555" },
          className:
            targetHandleObject.type === "Text"
              ? "stroke-gray-800 "
              : "stroke-gray-900 ",
          animated: targetHandleObject.type === "Text",
          selected: false,
        },
        newEdges.map((edge) => ({ ...edge, selected: false }))
      );
    });
    setEdges(newEdges);
  }

  const addFlow = async (
    newProject: Boolean,
    flow?: FlowType,
    override?: boolean,
    position?: XYPosition
  ): Promise<String | undefined> => {
    if (newProject) {
      let flowData = flow
        ? processDataFromFlow(flow)
        : { nodes: [], edges: [], viewport: { zoom: 1, x: 0, y: 0 } };

      // Create a new flow with a default name if no flow is provided.

      if (override) {
        deleteComponent(flow!.name);
        const newFlow = createNewFlow(flowData, flow!);
        const { id } = await saveFlowToDatabase(newFlow);
        newFlow.id = id;
        //setTimeout  to prevent update state with wrong state
        setTimeout(() => {
          addFlowToLocalState(newFlow);
        }, 200);
        // addFlowToLocalState(newFlow);
        return;
      }

      const newFlow = createNewFlow(flowData, flow!);

      const newName = addVersionToDuplicates(newFlow, flows);

      newFlow.name = newName;
      try {
        const { id } = await saveFlowToDatabase(newFlow);
        // Change the id to the new id.
        newFlow.id = id;

        // Add the new flow to the list of flows.
        addFlowToLocalState(newFlow);

        // Return the id
        return id;
      } catch (error) {
        // Handle the error if needed
        throw error; // Re-throw the error so the caller can handle it if needed
      }
    } else {
      paste(
        { nodes: flow!.data!.nodes, edges: flow!.data!.edges },
        position ?? { x: 10, y: 10 }
      );
    }
  };

  const processDataFromFlow = (flow: FlowType, refreshIds = true) => {
    let data = flow?.data ? flow.data : null;
    if (data) {
      processFlowEdges(flow);
      //prevent node update for now
      // processFlowNodes(flow);
      //add animation to text type edges
      updateEdges(data.edges);
      // updateNodes(data.nodes, data.edges);
      if (refreshIds) updateIds(data, getNodeId); // Assuming updateIds is defined elsewhere
    }

    return data;
  };

  const updateEdges = (edges: Edge[]) => {
    if (edges)
      edges.forEach((edge) => {
        const targetHandleObject: targetHandleType = scapeJSONParse(
          edge.targetHandle!
        );
        edge.className =
          (targetHandleObject.type === "Text"
            ? "stroke-gray-800 "
            : "stroke-gray-900 ") + " stroke-connection";
        edge.animated = targetHandleObject.type === "Text";
      });
  };

  const createNewFlow = (
    flowData: ReactFlowJsonObject | null,
    flow: FlowType
  ) => ({
    description: flow?.description ?? getRandomDescription(),
    name: flow?.name ?? getRandomName(),
    data: flowData,
    id: "",
    is_component: flow?.is_component ?? false,
  });

  const addFlowToLocalState = (newFlow: FlowType) => {
    let newFlows: FlowType[] = [];
    setFlows((prevState) => {
      newFlows = newFlows.concat(prevState);
      newFlows.push(newFlow);
      return [...prevState, newFlow];
    });
    processFlows(newFlows);
  };

  /**
   * Updates an existing flow with new data
   * @param newFlow - The new flow object containing the updated data
   */
  function updateFlow(newFlow: FlowType) {
    setFlows((prevState) => {
      const newFlows = [...prevState];
      const index = newFlows.findIndex((flow) => flow.id === newFlow.id);
      if (index !== -1) {
        newFlows[index].description = newFlow.description ?? "";
        newFlows[index].data = newFlow.data;
        newFlows[index].name = newFlow.name;
      }
      newFlow = {
        ...newFlow,
      };
      return newFlows;
    });
  }

  const saveTimeoutId = useRef<NodeJS.Timeout | null>(null);

  const saveCurrentFlow = (
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ) => {
    // Clear the previous timeout if it exists.
    if (saveTimeoutId.current) {
      clearTimeout(saveTimeoutId.current);
    }

    // Set up a new timeout.
    saveTimeoutId.current = setTimeout(() => {
      const currentFlow = flows.find((flow: FlowType) => flow.id === tabId);
      if (currentFlow) {
        saveFlow({ ...currentFlow, data: { nodes, edges, viewport } }, true);
      }
    }, 300); // Delay of 300ms.
  };

  async function saveFlow(flow?: FlowType, silent?: boolean) {
    let newFlow;
    if (!flow) {
      const currentFlow = flows.find((flow) => flow.id === tabId)!;
      newFlow = {
        ...currentFlow,
        data: {
          nodes,
          edges,
          viewport: reactFlowInstance?.getViewport() ?? { zoom: 1, x: 0, y: 0 },
        },
      };
    } else {
      newFlow = flow;
    }

    try {
      // updates flow in db
      const updatedFlow = await updateFlowInDatabase(newFlow);
      if (updatedFlow) {
        // updates flow in state
        if (!silent) {
          setSuccessData({ title: "Changes saved successfully" });
        }
        updateFlow(newFlow);
        //update tabs state
        setPending(false);
      }
    } catch (err) {
      setErrorData({
        title: "Error while saving changes",
        list: [(err as AxiosError).message],
      });
    }
  }

  function saveComponent(component: NodeDataType, override: boolean) {
    component.node!.official = false;
    return addFlow(true, createFlowComponent(component, version), override);
  }

  function deleteComponent(key: string) {
    let componentFlow = flows.find(
      (componentFlow) =>
        componentFlow.is_component && componentFlow.name === key
    );

    if (componentFlow) {
      removeFlow(componentFlow.id);
    }
  }

  const [isBuilt, setIsBuilt] = useState(false);
  // Initialize state variable for the version
  const [version, setVersion] = useState("");
  useEffect(() => {
    getVersion().then((data) => {
      setVersion(data.version);
    });
  }, []);

  function deleteNode(idx: string | Array<string>) {
    setNodes((oldNodes) =>
      oldNodes.filter((node) =>
        typeof idx === "string" ? node.id !== idx : !idx.includes(node.id)
      )
    );
  }

  function deleteEdge(idx: string | Array<string>) {
    setEdges((oldEdges) =>
      oldEdges.filter((edge) =>
        typeof idx === "string" ? edge.id !== idx : !idx.includes(edge.id)
      )
    );
  }

  return (
    <FlowsContext.Provider
      value={{
        version,
        saveFlow,
        isBuilt,
        setIsBuilt,
        lastCopiedSelection,
        setLastCopiedSelection,
        tabId,
        setTabId,
        flows,
        incrementNodeId,
        removeFlow,
        addFlow,
        downloadFlow,
        downloadFlows,
        uploadFlows,
        uploadFlow,
        getNodeId,
        deleteNode,
        deleteEdge,
        isPending,
        setPending,
        tabsState,
        setTabsState,
        paste,
        getTweak,
        setTweak,
        isLoading,
        saveComponent,
        deleteComponent,
        nodes,
        setNodes,
        setNode,
        getNode,
        onNodesChange,
        edges,
        setEdges,
        onEdgesChange,
      }}
    >
      {children}
    </FlowsContext.Provider>
  );
}
