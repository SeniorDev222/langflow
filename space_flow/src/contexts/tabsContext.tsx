import { createContext, useState } from "react";

type flow={name:string,id:string,data:any}

type TabsContextType={
    tabIndex:number;
    setTabIndex:(index:number)=>void;
    flows:Array<flow>
    removeFlow:(index:number)=>void;
    addFlow:(newFlow:flow)=>void;
    updateFlow:(newFLow:flow)=>void;
}

const TabsContextInitialValue = {
    tabIndex : 0,
    setTabIndex:(index:number)=>{},
    flows:[],
    removeFlow:(index:number)=>{},
    addFlow:(newFlow:flow)=>{},
    updateFlow:(newFLow:flow)=>{}
    

}

export const TabsContext = createContext<TabsContextType>(TabsContextInitialValue)

export function TabsProvider({children}){
    const [tabIndex,setTabIndex] = useState(0)
    const [flows,setFlows] = useState<Array<flow>>([])
    function removeFlow(index:number){
        let newFlows = flows
        newFlows.splice(index,1)
        window.sessionStorage.setItem('tabs',JSON.stringify(newFlows))
        setFlows(newFlows)
    }
    function addFlow(newFlow: flow) {
        setFlows(prevState => {
          const newFlows = [...prevState, newFlow];
          window.sessionStorage.setItem('tabs', JSON.stringify(newFlows));
          return newFlows;
        });
      }
    function updateFlow(newFlow:flow){
        setFlows(prevState=>{
            const newFlows = [...prevState];
            const index = newFlows.findIndex(flow=>flow.id===newFlow.id)
            if(index!==-1){
                newFlows[index].data = newFlow.data
            }
            window.sessionStorage.setItem('tabs', JSON.stringify(newFlows));
            return newFlows;
        });
    }

    return(
        <TabsContext.Provider value={{tabIndex,setTabIndex,flows,removeFlow,addFlow,updateFlow}}>
            {children}
        </TabsContext.Provider>
    )
}