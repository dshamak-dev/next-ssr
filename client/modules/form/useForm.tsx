import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "../input/Input";
import { Button } from "../button/Button";
import { Select } from "../input/Select";

export interface FormField {
  type:
    | "string"
    | "number"
    | "date"
    | "boolean"
    | "password"
    | "email"
    | "select"
    | "list";
  id: string;
  label?: string;
  placeholder?: string;
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
        const value = _formData.get(it.id) || "";
        let fieldValue: any = value;

        switch (it.type) {
          case "number": {
            fieldValue = Number(value);
            break;
          }
          case "list": {
            fieldValue = (value as string).trim().split(" ");
            break;
          }
        }

        return Object.assign(prev, { [it.id]: fieldValue });
      }, {});

      if (onSubmit) {
        onSubmit(e, _formFields);
      }
    },
    [onSubmit]
  );

  const renderInput = (field) => {
    switch (field.type) {
      case "select": {
        const { id, options, label, ...props } = field;
        return (
          <Select
            options={options}
            label={label}
            placeholder={`Ender ${label || id}`}
            {...props}
            key={id}
            id={id}
            name={id}
            onChange={(e) => handleFieldChange(id, e.target.value)}
          />
        );
      }
      default: {
        return (
          <Input
            placeholder={`Ender ${field.label || field.id}`}
            {...field}
            key={field.id}
            label={field.label}
            id={field.id}
            name={field.id}
            type={field.type}
            defaultValue={formData ? formData[field.id] || "" : ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      }
    }
  };

  const element = useMemo(() => {
    return (
      <form onSubmit={handleSubmit}>
        {fields.map(renderInput)}
        <Button secondary>Submit</Button>
      </form>
    );
  }, [fields]);

  return { element, formData };
};
