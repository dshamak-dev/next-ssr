import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "../input/Input";
import { Button } from "../button/Button";
import { Select } from "../input/Select";
import { NumberInput } from "../input/NumberInput";
import { TagInput } from "../input/TagInput";

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
  className?: string;
  inputProps?: Record<string, string | number | boolean>;
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

      const _formData = new FormData(e.target);
      const _formFields = fields.reduce((prev, it) => {
        const type = it.type || "text";
        const id = it.id;
        const value = _formData.get(id) || "";
        let fieldValue: any = value;

        switch (type) {
          case "number": {
            fieldValue = Number(value);
            break;
          }
          case "list": {
            fieldValue = formData[id];
            break;
          }
        }

        return Object.assign(prev, { [id]: fieldValue });
      }, {});

      const result = _formFields;

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
        placeholder: `Ender ${label || id}`,
        defaultValue: formData ? formData[field.id] || "" : "",
        inputProps,
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
        return <TagInput key={id} {...commonProps} />;
      }
      default: {
        return <Input key={id} {...commonProps} />;
      }
    }
  };

  const element = useMemo(() => {
    return (
      <form onSubmit={handleSubmit} className="flex col gap-1">
        {fields.map(renderInput)}
        <Button secondary>Submit</Button>
      </form>
    );
  }, [fields]);

  return { element, formData };
};
