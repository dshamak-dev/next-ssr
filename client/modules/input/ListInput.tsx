import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

export const ListInput: React.FC<Props> = ({
  defaultValue = [],
  id,
  label,
  required,
  onChange,
}) => {
  const ref = useRef<any>(null);
  const [list, setList] = useState(defaultValue || []);

  const isRequired = useMemo(() => {
    return !!required;
  }, [required]);

  const handleRemove = (index) => {
    setList((prev) => {
      const state = prev?.slice() || [];

      state.splice(index, 1);

      return state;
    });
  };

  const handleSetItem = useCallback((index, value) => {
    setList((prev) => {
      const state = prev || [];
      state[index] = value;

      return state;
    });
  }, []);

  const handleAdd = useCallback((value) => {
    setList((prev) => {
      return [...prev, value];
    });

    return true;
  }, []);

  const handleSave = useCallback(() => {
    setList((prev) => {
      return prev?.slice() || [];
    });
  }, []);

  useEffect(() => {
    if (onChange) {
      onChange({ target: { value: list } });
    }
  }, [onChange, list]);

  return (
    <div className="list-wrap flex col gap wrap">
      {label ? (
        <label htmlFor={id} className="input-label flex gap">
          {label}
          {isRequired ? (
            <span className="required-mark text-red">*</span>
          ) : null}
        </label>
      ) : null}
      <div ref={ref} className="flex col gap wrap">
        {list?.map((it, index) => {
          const optionLabel = `Variant ${index + 1}`;
          const key = Math.random();

          return (
            <div key={key} className="list-item">
              <Input
                label={optionLabel}
                type="string"
                inputProps={{
                  placeholder: `Enter ${optionLabel}`,
                  defaultValue: it,
                  onBlur: handleSave,
                }}
                onChange={(e) => handleSetItem(index, e.target.value)}
              />
              <div className="mb">
                <div
                  className="flex items-center justify-center h-2 w-2 rounded-full text-red bg-black"
                  onClick={() => handleRemove(index)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </div>
              </div>
            </div>
          );
        })}
        <div className="input-container">
          <div
            className="input-field text-center uppercase"
            onClick={() => handleAdd("")}
          >
            add variant
          </div>
        </div>
      </div>
      <style jsx>{`
        .list-wrap {
          margin-top: 1rem;
        }

        .input-label {
          margin-left: 0;
        }

        .list-item {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: end;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};
