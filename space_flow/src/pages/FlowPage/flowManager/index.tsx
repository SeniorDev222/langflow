import { PlusIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { ReactFlowProvider } from "reactflow";
import FlowPage from "..";
import { TabsContext } from "../../../contexts/tabsContext";
import TabComponent from "./tabComponent";
var _ = require("lodash");

export function TabsManager() {
	const { flows, addFlow, tabIndex, setTabIndex } = useContext(TabsContext);
	useEffect(() => {
		if (flows.length === 0) {
			addFlow({ name: "untitled", data: null, id: _.uniqueId() });
			addFlow({ name: "untitle", data: null, id: _.uniqueId() });
		}
	}, []);

	return (
		<div className="h-full w-full flex flex-col">
			<div className="w-full flex pr-2 flex-row text-center items-center">
				{flows.map((flow, index) => {
          console.log(tabIndex)
					return (
						<TabComponent selected={index === tabIndex} key={index} id={flow.id}>
							<div onClick={() => setTabIndex(index)}>{flow.name}</div>
						</TabComponent>
					);
				})}
        <div onClick={()=>addFlow({ name: "untitled", data: null, id: _.uniqueId() })} className="cursor-pointer"><PlusIcon color="black" width={24}></PlusIcon></div>
			</div>
			<div className="w-full h-full">
				<ReactFlowProvider>
					<FlowPage flow={flows[tabIndex]}></FlowPage>
				</ReactFlowProvider>
			</div>
		</div>
	);
}
