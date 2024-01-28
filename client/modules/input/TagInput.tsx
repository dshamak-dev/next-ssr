import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input, InputProps } from "./Input";
import { useForm } from "../form/useForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

interface Props extends InputProps {
  defaultValue?: string[];
  onChange?: ({ target: { value } }) => void;
}

const preventEvents = (e) => {
  e.stopPropagation();
  e.preventDefault();
};

export const TagInput: React.FC<Props> = ({ defaultValue = [], id, label, required, onChange }) => {
  const ref = useRef<any>(null);
  const [value, setValue] = useState(defaultValue || []);

  const isRequired = useMemo(() => {
    return !!required;
  }, [required]);

  const handleRemove = (tag) => {
    setValue((prev) => prev?.filter((it) => it !== tag) || []);
  };

  const handleAdd = useCallback((e, { tag }) => {
    e.stopPropagation();
    const _t = tag?.trim();

    if (!_t) {
      return false;
    }

    setValue((prev) => {
      if (prev?.includes(_t)) {
        return prev;
      }

      return [...prev, _t];
    });
    return true;
  }, []);

  useEffect(() => {
    if (onChange) {
      onChange({ target: { value } });
    }
  }, [onChange, value]);

  useEffect(() => {
    if (ref.current != null) {
      ref.current.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          preventEvents(e);
          const el = e.target;

          const tag = el.value;

          const valid = handleAdd(e, { tag });

          if (valid) {
            el.value = "";
          }
        }
      });
    }
  }, [ref.current]);

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="input-label flex gap">
          {label}{isRequired ? <span className="required-mark text-red">*</span> : null}
        </label>
      ) : null}
      <div ref={ref} className="flex gap-1 wrap items-center">
        {value?.map((it, index) => {
          return (
            <div
              key={index}
              className="flex gap-1 min-w-fit border-1 items-center rounded p-x"
            >
              <span>{it}</span>
              <div
                className="p-small text-red"
                onClick={() => handleRemove(it)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </div>
            </div>
          );
        })}
        <Input
          {...{
            type: "string",
            id: "tag",
            placeholder: "Add Option",
          }}
        />
      </div>
    </div>
  );
};
