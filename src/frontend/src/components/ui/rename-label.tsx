import { useState, useEffect, useRef } from "react";
import { cn } from "../../utils";

export default function RenameLabel(props) {
  const [internalState, setInternalState] = useState(false);
  const [isRename, setIsRename] = props.rename
    ? [props.rename, props.setRename]
    : [internalState, setInternalState];

  useEffect(() => {
    if (props.value) setMyValue(props.value);
  }, [props.value]);

  const [myValue, setMyValue] = useState(props.value);
  useEffect(() => {
    if (isRename) {
      setMyValue(props.value);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          setIsRename(false);
          props.setValue("");
        }
      });
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 100);
      }
    }
    resizeInput();
  }, [isRename]);

  const inputRef = useRef(null);

  const resizeInput = () => {
    const input = inputRef.current;
    if (input) {
      const span = document.createElement("span");
      span.style.position = "absolute";
      span.style.visibility = "hidden";
      span.style.whiteSpace = "pre";
      span.style.font = window.getComputedStyle(input).font;
      span.textContent = input.value;

      document.body.appendChild(span);
      const textWidth = span.getBoundingClientRect().width;
      document.body.removeChild(span);

      input.style.width = `${textWidth + 16}px`;
    }
  };
  return (
    <div>
      {isRename ? (
        <input
          autoFocus
          ref={inputRef}
          onInput={resizeInput}
          className={cn(
            "rounded-md bg-transparent px-2 outline-ring hover:outline focus:border-none focus:outline active:outline",
            props.className
          )}
          onBlur={() => {
            setIsRename(false);
            if (props.value !== "") {
              props.setValue(myValue);
            }
          }}
          value={myValue}
          onChange={(e) => {
            setMyValue(e.target.value);
          }}
        />
      ) : (
        <div className="flex items-center gap-2">
          <span
            className={cn("truncate px-2 text-left", props.className)}
            onDoubleClick={() => {
              setIsRename(true);
              setMyValue(props.value);
            }}
          >
            {props.value}
          </span>
        </div>
      )}
    </div>
  );
}
