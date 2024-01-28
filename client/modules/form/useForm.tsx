import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "../input/Input";
import { Button } from "../button/Button";
import { Select } from "../input/Select";
import { NumberInput } from "../input/NumberInput";
import { getFormEntries } from "./form.support";
import { ListInput } from "../input/ListInput";

export interface FormField {
  type?:
    | "string"
    | "number"
    | "date"
    | "boolean"
    | "password"
    | "email"
    | "date"
    | "select"
    | "list";
  id: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string[];
  className?: string;
  inputProps?: Record<string, string | number | boolean | Object>;
  options?: { text: string; value: any }[];
  valide?: (value: any) => boolean;
  required?: boolean;
}

interface Props {
  initialData: any;
  fields: FormField[];
  onChange?: (fieldName: string, fieldValue: string) => void;
  onSubmit?: (e, formData: any) => void;
}

export const useForm = ({
  initialData = null,
  fields = [],
  onSubmit,
}: Props) => {
  const [formData, setFormData] = useState(initialData);

  const handleFieldChange = useCallback((key, value) => {
    setFormData((prev) => {
      const next = prev || {};
      next[key] = value;

      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const entries = getFormEntries(e.target);

      const result = Object.assign({}, entries, formData);

      if (onSubmit) {
        onSubmit(e, result);
      }
    },
    [onSubmit, formData]
  );

  const renderInput = (field) => {
    const { id, options, label, inputProps = {}, ...props } = field;

    const commonProps = Object.assign(
      {
        id: id,
        name: id,
        placeholder: `Enter ${label || id}`,
        defaultValue: formData ? formData[field.id] || "" : "",
        inputProps,
        label,
        onChange: (e) => handleFieldChange(id, e.target.value),
      },
      props
    );

    switch (field.type) {
      case "number": {
        return <NumberInput key={id} {...commonProps} />;
      }
      case "select": {
        return <Select key={id} {...commonProps} options={options} />;
      }
      case "list": {
        return <ListInput key={id} {...commonProps} />;
      }
      default: {
        return <Input key={id} {...commonProps} />;
      }
    }
  };

  const element = useMemo(() => {
    return (
      <form onSubmit={handleSubmit} className="flex col gap">
        {fields.map(renderInput)}
        <div className="mt-1">
          <Button secondary>Submit</Button>
        </div>
      </form>
    );
  }, [fields, handleSubmit]);

  return { element, formData };
};
