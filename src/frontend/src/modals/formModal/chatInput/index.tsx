import { useEffect } from "react";
import IconComponent from "../../../components/genericIconComponent";
import { classNames } from "../../../utils/utils";
import { Textarea } from "../../../components/ui/textarea";

export default function ChatInput({
  lockChat,
  chatValue,
  sendMessage,
  setChatValue,
  inputRef,
  noInput,
}) {
  useEffect(() => {
    if (!lockChat && inputRef.current) {
      inputRef.current.focus();
    }
  }, [lockChat, inputRef]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "inherit"; // Reset the height
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`; // Set it to the scrollHeight
    }
  }, [chatValue]);

  return (
    <div className="relative">
      <Textarea 
        onKeyDown={(event) => {
          if (event.key === "Enter" && !lockChat && !event.shiftKey) {
            sendMessage();
          }
        }}
        rows={1}
        ref={inputRef}
        disabled={lockChat || noInput}
        style={{
          resize: "none",
          bottom: `${inputRef?.current?.scrollHeight}px`,
          maxHeight: "150px",
          overflow: `${
            inputRef.current && inputRef.current.scrollHeight > 150
              ? "auto"
              : "hidden"
          }`,
        }}
        value={lockChat ? "Thinking..." : chatValue}
        onChange={(e) => {
          setChatValue(e.target.value);
        }}
        className={classNames(
          lockChat
            ? " form-modal-lock-true bg-input"
            : noInput
            ? "form-modal-no-input bg-input"
            : " form-modal-lock-false bg-background",

          "form-modal-lockchat"
        )}
        placeholder={
          noInput
            ? "No chat input variables found. Click to run your flow."
            : "Send a message..."
        }
      />
      <div className="form-modal-send-icon-position">
        <button
          className={classNames(
            "form-modal-send-button",
            noInput
              ? "bg-indigo-600 text-background"
              : chatValue === ""
              ? "text-primary"
              : "bg-emerald-600 text-background"
          )}
          disabled={lockChat}
          onClick={() => sendMessage()}
        >
          {lockChat ? (
            <IconComponent
              name="Lock"
              className="form-modal-lock-icon"
              aria-hidden="true"
            />
          ) : noInput ? (
            <IconComponent
              name="Sparkles"
              className="form-modal-play-icon"
              aria-hidden="true"
            />
          ) : (
            <IconComponent
              name="LucideSend"
              className="form-modal-send-icon "
              aria-hidden="true"
            />
          )}
        </button>
      </div>
    </div>
  );
}
