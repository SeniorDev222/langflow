import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { PopUpContext } from "../../contexts/popUpContext";
import { TextAreaComponentType } from "../../types/components";
import GenericModal from "../../modals/genericModal";
import { TypeModal } from "../../utils";
import { INPUT_STYLE } from "../../constants";
export default function TextAreaComponent({
  value,
  onChange,
  disabled,
  editNode = false,
}: TextAreaComponentType) {
  const [myValue, setMyValue] = useState(value);
  const { openPopUp, closePopUp } = useContext(PopUpContext);

  useEffect(() => {
    if (disabled) {
      setMyValue("");
      onChange("");
    }
  }, [disabled, onChange]);

  useEffect(() => {
    setMyValue(value);
  }, [closePopUp]);

  return (
    <div className={disabled ? "pointer-events-none cursor-not-allowed" : ""}>
      <div
        className={
          editNode
            ? "w-full flex items-center"
            : "w-full flex items-center gap-3"
        }
      >
        <span
          onClick={() => {
            openPopUp(
              <GenericModal
                type={TypeModal.TEXT}
                buttonText="Finishing Editing"
                modalTitle="Edit Text"
                value={myValue}
                setValue={(t: string) => {
                  setMyValue(t);
                  onChange(t);
                }}
              />
            );
          }}
          className={
            editNode
              ? "truncate cursor-pointer placeholder:text-center text-medium-gray border-1 block w-full pt-0.5 pb-0.5 form-input dark:bg-high-dark-gray dark:text-medium-low-gray dark:border-medium-dark-gray rounded-md border-medium-low-gray shadow-sm sm:text-sm" +
                INPUT_STYLE
              : "truncate block w-full text-medium-gray dark:text-muted px-3 py-2 rounded-md border border-medium-low-gray dark:border-almost-dark-gray shadow-sm sm:text-sm" +
                (disabled ? " bg-light-gray" : "")
          }
        >
          {myValue !== "" ? myValue : "Type something..."}
        </span>
        <button
          onClick={() => {
            openPopUp(
              <GenericModal
                type={TypeModal.TEXT}
                buttonText="Finishing Editing"
                modalTitle="Edit Text"
                value={myValue}
                setValue={(t: string) => {
                  setMyValue(t);
                  onChange(t);
                }}
              />
            );
          }}
        >
          {!editNode && (
            <ArrowTopRightOnSquareIcon className="w-6 h-6 hover:text-ring dark:text-medium-low-gray" />
          )}
        </button>
      </div>
    </div>
  );
}
