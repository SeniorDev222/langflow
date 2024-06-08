import _, { cloneDeep } from "lodash";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useUpdateNodeInternals } from "reactflow";
import CodeAreaComponent from "../../../../components/codeAreaComponent";
import IconComponent from "../../../../components/genericIconComponent";
import ShadTooltip from "../../../../components/shadTooltipComponent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../../../components/ui/select-custom";
import { postCustomComponent } from "../../../../controllers/API";
import ConfirmationModal from "../../../../modals/confirmationModal";
import EditNodeModal from "../../../../modals/editNodeModal";
import ShareModal from "../../../../modals/shareModal";
import useAlertStore from "../../../../stores/alertStore";
import { useDarkStore } from "../../../../stores/darkStore";
import useFlowStore from "../../../../stores/flowStore";
import useFlowsManagerStore from "../../../../stores/flowsManagerStore";
import { useShortcutsStore } from "../../../../stores/shortcuts";
import { useStoreStore } from "../../../../stores/storeStore";
import { useTypesStore } from "../../../../stores/typesStore";
import { APIClassType } from "../../../../types/api";
import { nodeToolbarPropsType } from "../../../../types/components";
import { FlowType } from "../../../../types/flow";
import {
  createFlowComponent,
  downloadNode,
  expandGroupNode,
  updateFlowPosition,
} from "../../../../utils/reactflowUtils";
import { classNames, cn } from "../../../../utils/utils";
import ToolbarSelectItem from "./toolbarSelectItem";

export default function NodeToolbarComponent({
  data,
  deleteNode,
  setShowNode,
  numberOfHandles,
  showNode,
  name = "code",
  selected,
  updateNodeCode,
  setShowState,
  onCloseAdvancedModal,
  isOutdated,
  //  openWDoubleClick,
  //  setOpenWDoubleClick,
}: nodeToolbarPropsType): JSX.Element {
  const nodeLength = Object.keys(data.node!.template).filter(
    (templateField) =>
      templateField.charAt(0) !== "_" &&
      data.node?.template[templateField].show &&
      (data.node.template[templateField].type === "str" ||
        data.node.template[templateField].type === "bool" ||
        data.node.template[templateField].type === "float" ||
        data.node.template[templateField].type === "code" ||
        data.node.template[templateField].type === "prompt" ||
        data.node.template[templateField].type === "file" ||
        data.node.template[templateField].type === "Any" ||
        data.node.template[templateField].type === "int" ||
        data.node.template[templateField].type === "dict" ||
        data.node.template[templateField].type === "NestedDict"),
  ).length;

  const templates = useTypesStore((state) => state.templates);
  const hasStore = useStoreStore((state) => state.hasStore);
  const hasApiKey = useStoreStore((state) => state.hasApiKey);
  const validApiKey = useStoreStore((state) => state.validApiKey);
  const shortcuts = useShortcutsStore((state) => state.shortcuts);
  const unselectAll = useFlowStore((state) => state.unselectAll);

  function handleMinimizeWShortcut(e: KeyboardEvent) {
    e.preventDefault();
    if (isMinimal) {
      setShowState((show) => !show);
      setShowNode(data.showNode ?? true ? false : true);
      return;
    }
    setNoticeData({
      title:
        "Minimization are only available for nodes with one handle or fewer.",
    });
    return;
  }

  function handleUpdateWShortcut(e: KeyboardEvent) {
    e.preventDefault();
    if (hasApiKey || hasStore) {
      handleSelectChange("update");
    }
  }

  function handleGroupWShortcut(e: KeyboardEvent) {
    e.preventDefault();
    if (isGroup) {
      handleSelectChange("ungroup");
    }
  }

  function handleShareWShortcut(e: KeyboardEvent) {
    if (hasApiKey || hasStore) {
      e.preventDefault();
      setShowconfirmShare((state) => !state);
    }
  }

  function handleCodeWShortcut(e: KeyboardEvent) {
    e.preventDefault();
    if (hasCode) return setOpenModal((state) => !state);
    setNoticeData({ title: `You can not access ${data.id} code` });
  }

  function handleAdvancedWShortcut(e: KeyboardEvent) {
    e.preventDefault();
    if (!isGroup) {
      setShowModalAdvanced((state) => !state);
    }
  }

  function handleSaveWShortcut(e: KeyboardEvent) {
    e.preventDefault();
    if (isSaved) {
      setShowOverrideModal((state) => !state);
      return;
    }
    if (hasCode) {
      saveComponent(cloneDeep(data), false);
      setSuccessData({ title: `${data.id} saved successfully` });
      return;
    }
  }

  function handleDocsWShortcut(e: KeyboardEvent) {
    e.preventDefault();
    if (data.node?.documentation) {
      return openInNewTab(data.node?.documentation);
    }
    setNoticeData({
      title: `${data.id} docs is not available at the moment.`,
    });
  }

  function handleDownloadWShortcut(e: KeyboardEvent) {
    e.preventDefault();
    downloadNode(flowComponent!);
  }

  function handleFreeze(e: KeyboardEvent) {
    e.preventDefault();
    setNode(data.id, (old) => ({
      ...old,
      data: {
        ...old.data,
        node: {
          ...old.data.node,
          frozen: old.data?.node?.frozen ? false : true,
        },
      },
    }));
  }

  const advanced = useShortcutsStore((state) => state.advanced);
  const minimize = useShortcutsStore((state) => state.minimize);
  const share = useShortcutsStore((state) => state.share);
  const save = useShortcutsStore((state) => state.save);
  const docs = useShortcutsStore((state) => state.docs);
  const code = useShortcutsStore((state) => state.code);
  const group = useShortcutsStore((state) => state.group);
  const update = useShortcutsStore((state) => state.update);
  const download = useShortcutsStore((state) => state.download);
  const freeze = useShortcutsStore((state) => state.freeze);

  useHotkeys(minimize, handleMinimizeWShortcut);
  useHotkeys(update, handleUpdateWShortcut);
  useHotkeys(group, handleGroupWShortcut);
  useHotkeys(share, handleShareWShortcut);
  useHotkeys(code, handleCodeWShortcut);
  useHotkeys(advanced, handleAdvancedWShortcut);
  useHotkeys(save, handleSaveWShortcut);
  useHotkeys(docs, handleDocsWShortcut);
  useHotkeys(download, handleDownloadWShortcut);
  useHotkeys(freeze, handleFreeze);

  const isMinimal = numberOfHandles <= 1;
  const isGroup = data.node?.flow ? true : false;

  const frozen = data.node?.frozen ?? false;
  const paste = useFlowStore((state) => state.paste);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const setNodes = useFlowStore((state) => state.setNodes);

  const setEdges = useFlowStore((state) => state.setEdges);
  const saveComponent = useFlowsManagerStore((state) => state.saveComponent);
  const getNodePosition = useFlowStore((state) => state.getNodePosition);
  const flows = useFlowsManagerStore((state) => state.flows);
  const version = useDarkStore((state) => state.version);
  const takeSnapshot = useFlowsManagerStore((state) => state.takeSnapshot);
  const [showModalAdvanced, setShowModalAdvanced] = useState(false);
  const [showconfirmShare, setShowconfirmShare] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [flowComponent, setFlowComponent] = useState<FlowType>(
    createFlowComponent(cloneDeep(data), version),
  );

  //  useEffect(() => {
  //    if (openWDoubleClick) setShowModalAdvanced(true);
  //  }, [openWDoubleClick, setOpenWDoubleClick]);

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noreferrer");
  };

  useEffect(() => {
    if (!showModalAdvanced) {
      onCloseAdvancedModal!(false);
    }
  }, [showModalAdvanced]);
  const updateNodeInternals = useUpdateNodeInternals();

  const setLastCopiedSelection = useFlowStore(
    (state) => state.setLastCopiedSelection,
  );

  const setSuccessData = useAlertStore((state) => state.setSuccessData);
  const setNoticeData = useAlertStore((state) => state.setNoticeData);

  useEffect(() => {
    setFlowComponent(createFlowComponent(cloneDeep(data), version));
  }, [
    data,
    data.node,
    data.node?.display_name,
    data.node?.description,
    data.node?.template,
    showModalAdvanced,
    showconfirmShare,
  ]);

  const handleSelectChange = (event) => {
    switch (event) {
      case "save":
        if (isSaved) {
          return setShowOverrideModal(true);
        }
        saveComponent(cloneDeep(data), false);
        break;
      case "freeze":
        setNode(data.id, (old) => ({
          ...old,
          data: {
            ...old.data,
            node: {
              ...old.data.node,
              frozen: old.data?.node?.frozen ? false : true,
            },
          },
        }));
        break;
      case "code":
        setOpenModal(!openModal);
        break;
      case "advanced":
        setShowModalAdvanced(true);
        break;
      case "show":
        takeSnapshot();
        setShowNode(data.showNode ?? true ? false : true);
        break;
      case "Share":
        if (hasApiKey || hasStore) setShowconfirmShare(true);
        break;
      case "Download":
        downloadNode(flowComponent!);
        break;
      case "SaveAll":
        saveComponent(cloneDeep(data), false);
        break;
      case "documentation":
        if (data.node?.documentation) openInNewTab(data.node?.documentation);
        break;
      case "disabled":
        break;
      case "unselect":
        unselectAll();
        break;
      case "ungroup":
        takeSnapshot();
        expandGroupNode(
          data.id,
          updateFlowPosition(getNodePosition(data.id), data.node?.flow!),
          data.node!.template,
          nodes,
          edges,
          setNodes,
          setEdges,
        );
        break;
      case "override":
        setShowOverrideModal(true);
        break;
      case "delete":
        deleteNode(data.id);
        break;
      case "copy":
        const node = nodes.filter((node) => node.id === data.id);
        setLastCopiedSelection({ nodes: _.cloneDeep(node), edges: [] });
        break;
      case "duplicate":
        paste(
          {
            nodes: [nodes.find((node) => node.id === data.id)!],
            edges: [],
          },
          {
            x: 50,
            y: 10,
            paneX: nodes.find((node) => node.id === data.id)?.position.x,
            paneY: nodes.find((node) => node.id === data.id)?.position.y,
          },
        );
        break;
      case "update":
        takeSnapshot();
        // to update we must get the code from the templates in useTypesStore
        const thisNodeTemplate = templates[data.type]?.template;
        // if the template does not have a code key
        // return
        if (!thisNodeTemplate?.code) return;

        const currentCode = thisNodeTemplate.code.value;
        if (data.node) {
          postCustomComponent(currentCode, data.node)
            .then((apiReturn) => {
              const { data } = apiReturn;
              if (data && updateNodeCode) {
                updateNodeCode(data, currentCode, "code");
              }
            })
            .catch((err) => {
              console.log(err);
            });
          setNode(data.id, (oldNode) => {
            let newNode = cloneDeep(oldNode);
            newNode.data = {
              ...data,
            };
            newNode.data.node.template.code.value = currentCode;
            return newNode;
          });
        }

        break;
    }
  };

  const isSaved = flows.some((flow) =>
    Object.values(flow).includes(data.node?.display_name!),
  );

  const setNode = useFlowStore((state) => state.setNode);

  const handleOnNewValue = (
    newValue: string | string[] | boolean | Object[],
  ): void => {
    if (data.node!.template[name].value !== newValue) {
      takeSnapshot();
    }

    data.node!.template[name].value = newValue; // necessary to enable ctrl+z inside the input

    setNode(data.id, (oldNode) => {
      let newNode = cloneDeep(oldNode);

      newNode.data = {
        ...newNode.data,
      };

      newNode.data.node.template[name].value = newValue;

      return newNode;
    });
  };

  const handleNodeClass = (newNodeClass: APIClassType, code?: string): void => {
    if (!data.node) return;
    if (data.node!.template[name].value !== code) {
      takeSnapshot();
    }

    setNode(data.id, (oldNode) => {
      let newNode = cloneDeep(oldNode);

      newNode.data = {
        ...newNode.data,
        node: newNodeClass,
        description: newNodeClass.description ?? data.node!.description,
        display_name: newNodeClass.display_name ?? data.node!.display_name,
      };

      newNode.data.node.template[name].value = code;

      return newNode;
    });
    updateNodeInternals(data.id);
  };

  const [openModal, setOpenModal] = useState(false);
  const hasCode = Object.keys(data.node!.template).includes("code");

  return (
    <>
      <div className="w-26 nocopy nowheel nopan nodelete nodrag noundo h-10">
        <span className="isolate inline-flex rounded-md shadow-sm">
          {hasCode && (
            <ShadTooltip content="Code" side="top">
              <button
                className="relative inline-flex items-center rounded-l-md  bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
                onClick={() => {
                  setOpenModal(!openModal);
                }}
                data-testid="code-button-modal"
              >
                <IconComponent name="Code" className="h-4 w-4" />
              </button>
            </ShadTooltip>
          )}
          {nodeLength > 0 && (
            <ShadTooltip content="Advanced Settings" side="top">
              <button
                className="relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10"
                onClick={() => {
                  setShowModalAdvanced(true);
                }}
                data-testid="code-button-modal"
              >
                <IconComponent name="Settings2" className="h-4 w-4" />
              </button>
            </ShadTooltip>
          )}

          {/*<ShadTooltip content={"Save"} side="top">
            <button
              data-testid="save-button-modal"
              className={classNames(
                "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10",
                hasCode ? " " : " rounded-l-md ",
              )}
              onClick={(event) => {
                event.preventDefault();
                if (isSaved) {
                  return setShowOverrideModal(true);
                }
                saveComponent(cloneDeep(data), false);
              }}
            >
              <IconComponent name="SaveAll" className="h-4 w-4" />
            </button>
          </ShadTooltip>*/}
          <ShadTooltip content="Freeze" side="top">
            <button
              className={classNames(
                "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10",
              )}
              onClick={(event) => {
                event.preventDefault();
                setNode(data.id, (old) => ({
                  ...old,
                  data: {
                    ...old.data,
                    node: {
                      ...old.data.node,
                      frozen: old.data?.node?.frozen ? false : true,
                    },
                  },
                }));
              }}
            >
              <IconComponent
                name="Snowflake"
                className={cn(
                  "h-4 w-4 transition-all",
                  // TODO UPDATE THIS COLOR TO BE A VARIABLE
                  frozen ? "animate-wiggle text-ice" : "",
                )}
              />
            </button>
          </ShadTooltip>

          {/*<ShadTooltip content={"Duplicate"} side="top">
            <button
              data-testid="duplicate-button-modal"
              className={classNames(
                "relative -ml-px inline-flex items-center bg-background px-2 py-2 text-foreground shadow-md ring-1 ring-inset ring-ring  transition-all duration-500 ease-in-out hover:bg-muted focus:z-10",
              )}
              onClick={(event) => {
                event.preventDefault();
                handleSelectChange("duplicate");
              }}
            >
              <IconComponent name="Copy" className="h-4 w-4" />
            </button>
          </ShadTooltip>*/}

          <Select onValueChange={handleSelectChange} value="">
            <ShadTooltip content="More" side="top">
              <SelectTrigger>
                <div>
                  <div
                    data-testid="more-options-modal"
                    className={classNames(
                      "relative -ml-px inline-flex h-8 w-[31px] items-center rounded-r-md bg-background text-foreground  shadow-md ring-1 ring-inset  ring-ring transition-all duration-500 ease-in-out hover:bg-muted focus:z-10",
                    )}
                  >
                    <IconComponent
                      name="MoreHorizontal"
                      className="relative left-2 h-4 w-4"
                    />
                  </div>
                </div>
              </SelectTrigger>
            </ShadTooltip>
            <SelectContent>
              {hasCode && (
                <SelectItem value={"code"}>
                  <ToolbarSelectItem
                    shortcut={
                      shortcuts.find((obj) => obj.name === "Code")?.shortcut!
                    }
                    isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                    value={"Code"}
                    icon={"Code"}
                    dataTestId="code-button-modal"
                  />
                </SelectItem>
              )}
              {nodeLength > 0 && (
                <SelectItem value={nodeLength === 0 ? "disabled" : "advanced"}>
                  <ToolbarSelectItem
                    shortcut={
                      shortcuts.find((obj) => obj.name === "Advanced Settings")
                        ?.shortcut!
                    }
                    isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                    value={"Advanced"}
                    icon={"Settings2"}
                    dataTestId="edit-button-modal"
                  />
                </SelectItem>
              )}
              <SelectItem value={"save"}>
                <ToolbarSelectItem
                  shortcut={
                    shortcuts.find((obj) => obj.name === "Save")?.shortcut!
                  }
                  isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                  value={"Save"}
                  icon={"SaveAll"}
                  dataTestId="save-button-modal"
                />
              </SelectItem>
              <SelectItem value={"duplicate"}>
                <ToolbarSelectItem
                  shortcut={
                    shortcuts.find((obj) => obj.name === "Duplicate")?.shortcut!
                  }
                  isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                  value={"Duplicate"}
                  icon={"Copy"}
                  dataTestId="copy-button-modal"
                />
              </SelectItem>
              <SelectItem value={"copy"}>
                <ToolbarSelectItem
                  shortcut={
                    shortcuts.find((obj) => obj.name === "Copy")?.shortcut!
                  }
                  isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                  value={"Copy"}
                  icon={"Clipboard"}
                  dataTestId="copy-button-modal"
                />
              </SelectItem>
              {isOutdated && (
                <SelectItem value={"update"}>
                  <ToolbarSelectItem
                    shortcut={
                      shortcuts.find((obj) => obj.name === "Update")?.shortcut!
                    }
                    isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                    value={"Update"}
                    icon={"Code"}
                    dataTestId="update-button-modal"
                    ping={isOutdated}
                  />
                </SelectItem>
              )}
              {hasStore && (
                <SelectItem
                  value={"Share"}
                  disabled={!hasApiKey || !validApiKey}
                >
                  <ToolbarSelectItem
                    shortcut={
                      shortcuts.find((obj) => obj.name === "Share")?.shortcut!
                    }
                    isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                    value={"Share"}
                    icon={"Share3"}
                    dataTestId="share-button-modal"
                  />
                </SelectItem>
              )}
              {(!hasStore || !hasApiKey || !validApiKey) && (
                <SelectItem value={"Download"}>
                  <ToolbarSelectItem
                    shortcut={
                      shortcuts.find((obj) => obj.name === "Download")
                        ?.shortcut!
                    }
                    isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                    value={"Download"}
                    icon={"Download"}
                    dataTestId="Download-button-modal"
                  />
                </SelectItem>
              )}
              <SelectItem
                value={"documentation"}
                disabled={data.node?.documentation === ""}
              >
                <ToolbarSelectItem
                  shortcut={
                    shortcuts.find((obj) => obj.name === "Docs")?.shortcut!
                  }
                  isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                  value={"Docs"}
                  icon={"FileText"}
                  dataTestId="docs-button-modal"
                />
              </SelectItem>
              {isMinimal && (
                <SelectItem value={"show"}>
                  <ToolbarSelectItem
                    shortcut={
                      shortcuts.find((obj) => obj.name === "Minimize")
                        ?.shortcut!
                    }
                    isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                    value={showNode ? "Minimize" : "Expand"}
                    icon={showNode ? "Minimize2" : "Maximize2"}
                    dataTestId="minimize-button-modal"
                  />
                </SelectItem>
              )}
              {isGroup && (
                <SelectItem value="ungroup">
                  <ToolbarSelectItem
                    shortcut={
                      shortcuts.find((obj) => obj.name === "Group")?.shortcut!
                    }
                    isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                    value={"Ungroup"}
                    icon={"Ungroup"}
                    dataTestId="group-button-modal"
                  />
                </SelectItem>
              )}
              <SelectItem value="freeze">
                <ToolbarSelectItem
                  shortcut={
                    shortcuts.find((obj) => obj.name === "Freeze")?.shortcut!
                  }
                  isMac={navigator.userAgent.toUpperCase().includes("MAC")}
                  value={"Freeze"}
                  icon={"Snowflake"}
                  dataTestId="group-button-modal"
                  style={`${frozen ? " text-ice" : ""} transition-all`}
                />
              </SelectItem>
              <SelectItem value={"delete"} className="focus:bg-red-400/[.20]">
                <div className="font-red flex text-status-red">
                  <IconComponent
                    name="Trash2"
                    className="relative top-0.5 mr-2 h-4 w-4 "
                  />{" "}
                  <span className="">Delete</span>{" "}
                  <span>
                    <IconComponent
                      name="Delete"
                      className="absolute right-2 top-2 h-4 w-4 stroke-2 text-red-400"
                    ></IconComponent>
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <ConfirmationModal
            open={showOverrideModal}
            title={`Replace`}
            cancelText="Create New"
            confirmationText="Replace"
            size={"x-small"}
            icon={"SaveAll"}
            index={6}
            onConfirm={(index, user) => {
              saveComponent(cloneDeep(data), true);
              setSuccessData({ title: `${data.id} successfully overridden!` });
            }}
            onClose={setShowOverrideModal}
            onCancel={() => {
              saveComponent(cloneDeep(data), false);
              setSuccessData({ title: "New node successfully saved!" });
            }}
          >
            <ConfirmationModal.Content>
              <span>
                It seems {data.node?.display_name} already exists. Do you want
                to replace it with the current or create a new one?
              </span>
            </ConfirmationModal.Content>
          </ConfirmationModal>
          {showModalAdvanced && (
            <EditNodeModal
              //              setOpenWDoubleClick={setOpenWDoubleClick}
              data={data}
              nodeLength={nodeLength}
              open={showModalAdvanced}
              setOpen={setShowModalAdvanced}
            />
          )}
          {showconfirmShare && (
            <ShareModal
              open={showconfirmShare}
              setOpen={setShowconfirmShare}
              is_component={true}
              component={flowComponent!}
            />
          )}
          {hasCode && (
            <div className="hidden">
              {openModal && (
                <CodeAreaComponent
                  open={openModal}
                  setOpen={setOpenModal}
                  readonly={
                    data.node?.flow && data.node.template[name].dynamic
                      ? true
                      : false
                  }
                  dynamic={data.node?.template[name].dynamic ?? false}
                  setNodeClass={handleNodeClass}
                  nodeClass={data.node}
                  disabled={false}
                  value={data.node?.template[name].value ?? ""}
                  onChange={handleOnNewValue}
                  id={"code-input-node-toolbar-" + name}
                />
              )}
            </div>
          )}
        </span>
      </div>
    </>
  );
}
