import { useContext } from "react";
import { PopUpContext } from "../../../../contexts/popUpContext";
import { TabsContext } from "../../../../contexts/tabsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";

import { Link, useNavigate } from "react-router-dom";
import { alertContext } from "../../../../contexts/alertContext";
import { undoRedoContext } from "../../../../contexts/undoRedoContext";
import FlowSettingsModal from "../../../../modals/flowSettingsModal";
import { Button } from "../../../ui/button";
import IconComponent from "../../../genericIconComponent";

export const MenuBar = ({ flows, tabId }) => {
  const { updateFlow, setTabId, addFlow } = useContext(TabsContext);
  const { setErrorData } = useContext(alertContext);
  const { openPopUp } = useContext(PopUpContext);
  const { undo, redo } = useContext(undoRedoContext);

  const navigate = useNavigate();

  function handleAddFlow() {
    try {
      addFlow(null, true).then((id) => {
        navigate("/flow/" + id);
      });
      // saveFlowStyleInDataBase();
    } catch (err) {
      setErrorData(err);
    }
  }
  let current_flow = flows.find((flow) => flow.id === tabId);

  return (
    <div className="round-button-div">
      <Link to="/">
        <IconComponent
          name="ChevronLeft"
          style="w-4"
          method="LUCIDE"
        />
      </Link>
      <div className="header-menu-bar">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button asChild variant="primary" size="sm">
              <div className="header-menu-bar-display">
                <div className="header-menu-flow-name">{current_flow.name}</div>
                <IconComponent
                  name="ChevronDown"
                  style="h-4 w-4"
                  method="LUCIDE"
                />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-44">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                handleAddFlow();
              }}
              className="cursor-pointer"
            >
              <IconComponent
                name="Plus"
                style="header-menu-options"
                method="LUCIDE"
              />
              New
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                openPopUp(<FlowSettingsModal />);
              }}
              className="cursor-pointer"
            >
              <IconComponent
                name="Settings2"
                style="header-menu-options "
                method="LUCIDE"
              />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                undo();
              }}
              className="cursor-pointer"
            >
              <IconComponent
                name="Undo"
                style="header-menu-options "
                method="LUCIDE"
              />
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                redo();
              }}
              className="cursor-pointer"
            >
              <IconComponent
                name="Redo"
                style="header-menu-options "
                method="LUCIDE"
              />
              Redo
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuLabel>Projects</DropdownMenuLabel> */}
            {/* <DropdownMenuRadioGroup className="max-h-full overflow-scroll"
              value={tabId}
              onValueChange={(value) => {
                setTabId(value);
              }}
            >
              {flows.map((flow, idx) => {
                return (
                  <Link
                    to={"/flow/" + flow.id}
                    className="flex w-full items-center"
                  >
                    <DropdownMenuRadioItem
                      value={flow.id}
                      className="flex-1 w-full inline-block truncate break-words mr-2"
                    >
                      {flow.name}
                    </DropdownMenuRadioItem>
                  </Link>
                );
              })}
            </DropdownMenuRadioGroup> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MenuBar;
