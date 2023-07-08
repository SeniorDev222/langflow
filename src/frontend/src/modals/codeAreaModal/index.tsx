import { DialogTitle } from "@radix-ui/react-dialog";
import "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-twilight";
import { TerminalSquare } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import { Button } from "../../components/ui/button";
import { CODE_PROMPT_DIALOG_SUBTITLE } from "../../constants";
import { alertContext } from "../../contexts/alertContext";
import { darkContext } from "../../contexts/darkContext";
import { PopUpContext } from "../../contexts/popUpContext";
import { postValidateCode } from "../../controllers/API";
import { APIClassType } from "../../types/api";
import BaseModal from "../baseModal";

export default function CodeAreaModal({
  value,
  setValue,
  nodeClass,
  setNodeClass,
}: {
  setValue: (value: string) => void;
  value: string;
  nodeClass: APIClassType;
  setNodeClass: (Class: APIClassType) => void;
}) {
  const [open, setOpen] = useState(true);
  const [code, setCode] = useState(value);
  const [loading, setLoading] = useState(false);
  const { dark } = useContext(darkContext);
  const { closePopUp } = useContext(PopUpContext);
  const { setErrorData, setSuccessData } = useContext(alertContext);
  const [error, setError] = useState<{
    detail: { error: string; traceback: string };
  }>(null);
  const ref = useRef();
  useEffect(() => {
    setValue(code);
  }, [code, setValue]);

  function handleClick() {
    setLoading(true);
    postValidateCode(code)
      .then((apiReturn) => {
        setLoading(false);
        if (apiReturn.data) {
          let importsErrors = apiReturn.data.imports.errors;
          let funcErrors = apiReturn.data.function.errors;
          if (funcErrors.length === 0 && importsErrors.length === 0) {
            setSuccessData({
              title: "Code is ready to run",
            });
            setValue(code);
            setOpen((old) => !old);
          } else {
            if (funcErrors.length !== 0) {
              setErrorData({
                title: "There is an error in your function",
                list: funcErrors,
              });
            }
            if (importsErrors.length !== 0) {
              setErrorData({
                title: "There is an error in your imports",
                list: importsErrors,
              });
            }
          }
        } else {
          setErrorData({
            title: "Something went wrong, please try again",
          });
        }
      })
      .catch((_) => {
        setLoading(false);
        setErrorData({
          title: "There is something wrong with this code, please review it",
        });
      });
  }

  return (
    <BaseModal open={true} setOpen={setOpen}>
      <BaseModal.Header description={CODE_PROMPT_DIALOG_SUBTITLE}>
        <DialogTitle className="flex items-center">
          <span className="pr-2">Edit Code</span>
          <TerminalSquare
            strokeWidth={1.5}
            className="h-6 w-6 pl-1 text-primary "
            aria-hidden="true"
          />
        </DialogTitle>
      </BaseModal.Header>
      <BaseModal.Content>
        <div className="flex h-full w-full flex-col transition-all">
          <div className="h-full w-full">
            <AceEditor
              value={code}
              mode="python"
              highlightActiveLine={true}
              showPrintMargin={false}
              fontSize={14}
              showGutter
              enableLiveAutocompletion
              theme={dark ? "twilight" : "github"}
              name="CodeEditor"
              onChange={(value) => {
                setCode(value);
              }}
              className="h-full w-full rounded-lg border-[1px] border-gray-300 custom-scroll dark:border-gray-600"
            />
          </div>
          <div
            className={
              "w-full transition-all delay-500 " +
              (error?.detail.error !== undefined ? "h-2/6" : "h-0")
            }
          >
            <div className="mt-1 h-full w-full overflow-x-clip overflow-y-scroll text-left custom-scroll">
              <h1 className="text-lg text-destructive">
                {error?.detail?.error}
              </h1>
              <div className="ml-2 w-full break-all text-sm text-status-red">
                <pre className="w-full whitespace-pre-wrap break-all">
                  {error?.detail?.traceback}
                </pre>
              </div>
            </div>
          </div>
          <div className="flex h-fit w-full justify-end">
            <Button className="mt-3" onClick={handleClick} type="submit">
              Check & Save
            </Button>
          </div>
        </div>
      </BaseModal.Content>
    </BaseModal>
  );
}
