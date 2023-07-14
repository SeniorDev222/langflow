import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-twilight";
import {
  ReactNode,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
// import "ace-builds/webpack-resolver";
import { Check, Clipboard, Code2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import AccordionComponent from "../../components/AccordionComponent";
import ShadTooltip from "../../components/ShadTooltipComponent";
import CodeAreaComponent from "../../components/codeAreaComponent";
import Dropdown from "../../components/dropdownComponent";
import FloatComponent from "../../components/floatComponent";
import InputComponent from "../../components/inputComponent";
import InputFileComponent from "../../components/inputFileComponent";
import InputListComponent from "../../components/inputListComponent";
import IntComponent from "../../components/intComponent";
import PromptAreaComponent from "../../components/promptComponent";
import TextAreaComponent from "../../components/textAreaComponent";
import ToggleShadComponent from "../../components/toggleShadComponent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  EXPORT_CODE_DIALOG,
  getCurlCode,
  getPythonApiCode,
  getPythonCode,
} from "../../constants";
import { TabsContext } from "../../contexts/tabsContext";
import { FlowType } from "../../types/flow/index";
import { buildTweaks, classNames } from "../../utils";
import BaseModal from "../baseModal";
import { PopUpContext } from "../../contexts/popUpContext";

const ApiModal = forwardRef(
  (
    {
      flow,
      children,
    }: {
      flow: FlowType;
      children: ReactNode;
    },
    ref
  ) => {

    const [activeTab, setActiveTab] = useState("0");
    const [isCopied, setIsCopied] = useState<Boolean>(false);
    const [openAccordion, setOpenAccordion] = useState([]);
    const tweak = useRef([]);
    const tweaksList = useRef([]);
    const { setTweak, getTweak, tabsState } = useContext(TabsContext);
    const { closePopUp } = useContext(PopUpContext);

    const copyToClipboard = () => {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        return;
      }

      navigator.clipboard.writeText(tabs[activeTab].code).then(() => {
        setIsCopied(true);

        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      });
    };
    const pythonApiCode = getPythonApiCode(flow, tweak.current, tabsState);
    const curl_code = getCurlCode(flow, tweak.current, tabsState);
    const pythonCode = getPythonCode(flow, tweak.current, tabsState);
    const tweaksCode = buildTweaks(flow);
    const tabs = [
      {
        name: "cURL",
        mode: "bash",
        image: "https://curl.se/logo/curl-symbol-transparent.png",
        code: curl_code,
      },
      {
        name: "Python API",
        mode: "python",
        image:
          "https://images.squarespace-cdn.com/content/v1/5df3d8c5d2be5962e4f87890/1628015119369-OY4TV3XJJ53ECO0W2OLQ/Python+API+Training+Logo.png?format=1000w",
        code: pythonApiCode,
      },
      {
        name: "Python Code",
        mode: "python",
        image: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
        code: pythonCode,
      },
    ];

    useEffect(() => {
      
      filterNodes();

      if(getTweak.length == 0){
        const t = buildTweaks(flow);
        tweak?.current?.push(t);
      }
      if (Object.keys(tweaksCode).length > 0) {
        tabs.push({
          name: "Tweaks",
          mode: "python",
          image: "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
          code: pythonCode,
        });
      }
      
    }, [closePopUp]);


    function filterNodes() {
      let arrNodesWithValues = [];

      flow["data"]["nodes"].forEach((t) => {
        Object.keys(t["data"]["node"]["template"])
          .filter(
            (n) =>
              n.charAt(0) !== "_" &&
              t.data.node.template[n].show &&
              (t.data.node.template[n].type === "str" ||
                t.data.node.template[n].type === "bool" ||
                t.data.node.template[n].type === "float" ||
                t.data.node.template[n].type === "code" ||
                t.data.node.template[n].type === "prompt" ||
                t.data.node.template[n].type === "file" ||
                t.data.node.template[n].type === "int")
          )
          .map((n, i) => {
            arrNodesWithValues.push(t["id"]);
          });
      });

      tweaksList.current = arrNodesWithValues.filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
    }

    function buildTweakObject(tw, changes, template) {
      if (template.type === "float") {
        changes = parseFloat(changes);
      }
      if (template.type === "int") {
        changes = parseInt(changes);
      }
      if (template.list === true && Array.isArray(changes)) {
        changes = changes?.filter((x) => x !== "");
      }

      const existingTweak = tweak.current.find((element) =>
        element.hasOwnProperty(tw)
      );

      if (existingTweak) {
        existingTweak[tw][template["name"]] = changes;

        if (existingTweak[tw][template["name"]] == template.value) {
          tweak.current.forEach((element) => {
            if (element[tw] && Object.keys(element[tw])?.length === 0) {
              tweak.current = tweak.current.filter((obj) => {
                const prop = obj[Object.keys(obj)[0]].prop;
                return prop !== undefined && prop !== null && prop !== "";
              });
            }
          });
        }
      } else {
        const newTweak = {
          [tw]: {
            [template["name"]]: changes,
          },
        };
        tweak.current.push(newTweak);
      }

      const pythonApiCode = getPythonApiCode(flow, tweak.current);
      const curl_code = getCurlCode(flow, tweak.current);
      const pythonCode = getPythonCode(flow, tweak.current);

      tabs[0].code = curl_code;
      tabs[1].code = pythonApiCode;
      tabs[2].code = pythonCode;

      setTweak(tweak.current);
    }

    function buildContent(value) {
      const htmlContent = (
        <div className="w-[200px]">
          <span>{value != null && value != "" ? value : "None"}</span>
        </div>
      );
      return htmlContent;
    }

    function getValue(value, node, template) {
      let returnValue = value ?? "";

      if (getTweak.length > 0) {
        for (const obj of getTweak) {
          Object.keys(obj).forEach((key) => {
            const value = obj[key];
            if (key == node["id"]) {
              Object.keys(value).forEach((key) => {
                if (key == template["name"]) {
                  returnValue = value[key];
                }
              });
            }
          });
        }
      } else {
        return value ?? "";
      }
      return returnValue;
    }

    function openAccordions() {
      let accordionsToOpen = [];
      tweak.current.forEach((el) => {
        Object.keys(el).forEach((key) => {
          if (Object.keys(el[key]).length > 0) {
            accordionsToOpen.push(key);
            setOpenAccordion(accordionsToOpen);
          }
        });
      });
    }

    const setOpen = (x: boolean) => {
      if(x) {
        closePopUp();
      }
    };

    return (
      <BaseModal setOpen={setOpen}>
        <BaseModal.Trigger>{children}</BaseModal.Trigger>
        <BaseModal.Header description={EXPORT_CODE_DIALOG}>
          <span className="pr-2">Code</span>
          <Code2
            strokeWidth={1.5}
            className="h-6 w-6 pl-1 text-primary "
            aria-hidden="true"
          />
        </BaseModal.Header>
        <BaseModal.Content>
          <Tabs
            value={activeTab}
            className="api-modal-tabs"
            onValueChange={(value) => {
              setActiveTab(value);
              if (value === "3") {
                openAccordions();
              }
            }}
          >
            <div className="api-modal-tablist-div">
              <TabsList>
                {tabs.map((tab, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    {tab.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Number(activeTab) < 3 && (
                <div className="float-right">
                  <button
                    className="flex items-center gap-1.5 rounded bg-none p-1 text-xs text-gray-500 dark:text-gray-300"
                    onClick={copyToClipboard}
                  >
                    {isCopied ? <Check size={18} /> : <Clipboard size={15} />}
                    {isCopied ? "Copied!" : "Copy code"}
                  </button>
                </div>
              )}
            </div>

            {tabs.map((tab, index) => (
              <TabsContent
                value={index.toString()}
                className="api-modal-tabs-content"
                key={index} // Remember to add a unique key prop
              >
                {index < 3 ? (
                  <SyntaxHighlighter
                    className="h-[70vh] w-full overflow-auto custom-scroll"
                    language={tab.mode}
                    style={oneDark}
                  >
                    {tab.code}
                  </SyntaxHighlighter>
                ) : index === 3 ? (
                  <>
                    <div className="api-modal-according-display">
                      <div
                        className={classNames(
                          "h-[70vh] w-full rounded-lg bg-muted",
                          1 == 1
                            ? "overflow-scroll overflow-x-hidden custom-scroll"
                            : "overflow-hidden"
                        )}
                      >
                        {flow["data"]["nodes"].map((t: any, index) => (
                          <div className="px-3" key={index}>
                            {tweaksList.current.includes(t["data"]["id"]) && (
                              <AccordionComponent
                                trigger={t["data"]["id"]}
                                open={openAccordion}
                              >
                                <div className="api-modal-table-arrangement">
                                  <Table className="table-fixed bg-muted outline-1">
                                    <TableHeader className="h-10 border-input text-xs font-medium text-ring">
                                      <TableRow className="dark:border-b-muted">
                                        <TableHead className="h-7 text-center">
                                          PARAM
                                        </TableHead>
                                        <TableHead className="h-7 p-0 text-center">
                                          VALUE
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody className="p-0">
                                      {Object.keys(
                                        t["data"]["node"]["template"]
                                      )
                                        .filter(
                                          (n) =>
                                            n.charAt(0) !== "_" &&
                                            t.data.node.template[n].show &&
                                            (t.data.node.template[n].type ===
                                              "str" ||
                                              t.data.node.template[n].type ===
                                                "bool" ||
                                              t.data.node.template[n].type ===
                                                "float" ||
                                              t.data.node.template[n].type ===
                                                "code" ||
                                              t.data.node.template[n].type ===
                                                "prompt" ||
                                              t.data.node.template[n].type ===
                                                "file" ||
                                              t.data.node.template[n].type ===
                                                "int")
                                        )
                                        .map((n, i) => {
                                          //console.log(t.data.node.template[n]);

                                          return (
                                            <TableRow
                                              key={i}
                                              className="h-10 dark:border-b-muted"
                                            >
                                              <TableCell className="p-0 text-center text-sm text-foreground">
                                                {n}
                                              </TableCell>
                                              <TableCell className="p-0 text-xs text-foreground">
                                                <div className="m-auto w-[250px]">
                                                  {t.data.node.template[n]
                                                    .type === "str" &&
                                                  !t.data.node.template[n]
                                                    .options ? (
                                                    <div className="mx-auto">
                                                      {t.data.node.template[n]
                                                        .list ? (
                                                        <InputListComponent
                                                          editNode={true}
                                                          disabled={false}
                                                          value={
                                                            !t.data.node
                                                              .template[n]
                                                              .value ||
                                                            t.data.node
                                                              .template[n]
                                                              .value === ""
                                                              ? [""]
                                                              : t.data.node
                                                                  .template[n]
                                                                  .value
                                                          }
                                                          onChange={(k) => {}}
                                                          onAddInput={(k) => {
                                                            buildTweakObject(
                                                              t["data"]["id"],
                                                              k,
                                                              t.data.node
                                                                .template[n]
                                                            );
                                                          }}
                                                        />
                                                      ) : t.data.node.template[
                                                          n
                                                        ].multiline ? (
                                                        <ShadTooltip
                                                          content={buildContent(
                                                            t.data.node
                                                              .template[n].value
                                                          )}
                                                        >
                                                          <div>
                                                            <TextAreaComponent
                                                              disabled={false}
                                                              editNode={true}
                                                              value={getValue(
                                                                t.data.node
                                                                  .template[n]
                                                                  .value,
                                                                t.data,
                                                                t.data.node
                                                                  .template[n]
                                                              )}
                                                              onChange={(k) => {
                                                                buildTweakObject(
                                                                  t["data"][
                                                                    "id"
                                                                  ],
                                                                  k,
                                                                  t.data.node
                                                                    .template[n]
                                                                );
                                                              }}
                                                            />
                                                          </div>
                                                        </ShadTooltip>
                                                      ) : (
                                                        <InputComponent
                                                          editNode={true}
                                                          disabled={false}
                                                          password={
                                                            t.data.node
                                                              .template[n]
                                                              .password ?? false
                                                          }
                                                          value={getValue(
                                                            t.data.node
                                                              .template[n]
                                                              .value,
                                                            t.data,
                                                            t.data.node
                                                              .template[n]
                                                          )}
                                                          onChange={(k) => {
                                                            buildTweakObject(
                                                              t["data"]["id"],
                                                              k,
                                                              t.data.node
                                                                .template[n]
                                                            );
                                                          }}
                                                        />
                                                      )}
                                                    </div>
                                                  ) : t.data.node.template[n]
                                                      .type === "bool" ? (
                                                    <div className="ml-auto">
                                                      {" "}
                                                      <ToggleShadComponent
                                                        enabled={
                                                          t.data.node.template[
                                                            n
                                                          ].value
                                                        }
                                                        setEnabled={(e) => {
                                                          t.data.node.template[
                                                            n
                                                          ].value = e;
                                                          buildTweakObject(
                                                            t["data"]["id"],
                                                            e,
                                                            t.data.node
                                                              .template[n]
                                                          );
                                                        }}
                                                        size="small"
                                                        disabled={false}
                                                      />
                                                    </div>
                                                  ) : t.data.node.template[n]
                                                      .type === "file" ? (
                                                    <ShadTooltip
                                                      content={buildContent(
                                                        getValue(
                                                          t.data.node.template[
                                                            n
                                                          ].value,
                                                          t.data,
                                                          t.data.node.template[
                                                            n
                                                          ]
                                                        )
                                                      )}
                                                    >
                                                      <div className="mx-auto">
                                                        <InputFileComponent
                                                          editNode={true}
                                                          disabled={false}
                                                          value={
                                                            t.data.node
                                                              .template[n]
                                                              .value ?? ""
                                                          }
                                                          onChange={(
                                                            k: any
                                                          ) => {}}
                                                          fileTypes={
                                                            t.data.node
                                                              .template[n]
                                                              .fileTypes
                                                          }
                                                          suffixes={
                                                            t.data.node
                                                              .template[n]
                                                              .suffixes
                                                          }
                                                          onFileChange={(
                                                            k: any
                                                          ) => {}}
                                                        ></InputFileComponent>
                                                      </div>
                                                    </ShadTooltip>
                                                  ) : t.data.node.template[n]
                                                      .type === "float" ? (
                                                    <div className="mx-auto">
                                                      <FloatComponent
                                                        disabled={false}
                                                        editNode={true}
                                                        value={getValue(
                                                          t.data.node.template[
                                                            n
                                                          ].value,
                                                          t.data,
                                                          t.data.node.template[
                                                            n
                                                          ]
                                                        )}
                                                        onChange={(k) => {
                                                          buildTweakObject(
                                                            t["data"]["id"],
                                                            k,
                                                            t.data.node
                                                              .template[n]
                                                          );
                                                        }}
                                                      />
                                                    </div>
                                                  ) : t.data.node.template[n]
                                                      .type === "str" &&
                                                    t.data.node.template[n]
                                                      .options ? (
                                                    <div className="mx-auto">
                                                      <Dropdown
                                                        editNode={true}
                                                        apiModal={true}
                                                        options={
                                                          t.data.node.template[
                                                            n
                                                          ].options
                                                        }
                                                        onSelect={(k) => {
                                                          buildTweakObject(
                                                            t["data"]["id"],
                                                            k,
                                                            t.data.node
                                                              .template[n]
                                                          );
                                                        }}
                                                        value={getValue(
                                                          t.data.node.template[
                                                            n
                                                          ].value,
                                                          t.data,
                                                          t.data.node.template[
                                                            n
                                                          ]
                                                        )}
                                                      ></Dropdown>
                                                    </div>
                                                  ) : t.data.node.template[n]
                                                      .type === "int" ? (
                                                    <div className="mx-auto">
                                                      <IntComponent
                                                        disabled={false}
                                                        editNode={true}
                                                        value={getValue(
                                                          t.data.node.template[
                                                            n
                                                          ].value,
                                                          t.data,
                                                          t.data.node.template[
                                                            n
                                                          ]
                                                        )}
                                                        onChange={(k) => {
                                                          buildTweakObject(
                                                            t["data"]["id"],
                                                            k,
                                                            t.data.node
                                                              .template[n]
                                                          );
                                                        }}
                                                      />
                                                    </div>
                                                  ) : t.data.node.template[n]
                                                      .type === "prompt" ? (
                                                    <ShadTooltip
                                                      content={buildContent(
                                                        getValue(
                                                          t.data.node.template[
                                                            n
                                                          ].value,
                                                          t.data,
                                                          t.data.node.template[
                                                            n
                                                          ]
                                                        )
                                                      )}
                                                    >
                                                      <div className="mx-auto">
                                                        <PromptAreaComponent
                                                          editNode={true}
                                                          disabled={false}
                                                          value={getValue(
                                                            t.data.node
                                                              .template[n]
                                                              .value,
                                                            t.data,
                                                            t.data.node
                                                              .template[n]
                                                          )}
                                                          onChange={(k) => {
                                                            buildTweakObject(
                                                              t["data"]["id"],
                                                              k,
                                                              t.data.node
                                                                .template[n]
                                                            );
                                                          }}
                                                        />
                                                      </div>
                                                    </ShadTooltip>
                                                  ) : t.data.node.template[n]
                                                      .type === "code" ? (
                                                    <ShadTooltip
                                                      content={buildContent(
                                                        getValue(
                                                          t.data.node.template[
                                                            n
                                                          ].value,
                                                          t.data,
                                                          t.data.node.template[
                                                            n
                                                          ]
                                                        )
                                                      )}
                                                    >
                                                      <div className="mx-auto">
                                                        <CodeAreaComponent
                                                          disabled={false}
                                                          editNode={true}
                                                          value={getValue(
                                                            t.data.node
                                                              .template[n]
                                                              .value,
                                                            t.data,
                                                            t.data.node
                                                              .template[n]
                                                          )}
                                                          onChange={(k) => {
                                                            buildTweakObject(
                                                              t["data"]["id"],
                                                              k,
                                                              t.data.node
                                                                .template[n]
                                                            );
                                                          }}
                                                        />
                                                      </div>
                                                    </ShadTooltip>
                                                  ) : t.data.node.template[n]
                                                      .type === "Any" ? (
                                                    "-"
                                                  ) : (
                                                    <div className="hidden"></div>
                                                  )}
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </AccordionComponent>
                            )}

                            {tweaksList.current.length === 0 && (
                              <>
                                <div className="pt-3">
                                  No tweaks are available for this flow.
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}
              </TabsContent>
            ))}
          </Tabs>
        </BaseModal.Content>
      </BaseModal>
    );
  }
);

export default ApiModal;
