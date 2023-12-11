import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "../input/Input";
import { ButtonView } from "../button/ButtonView";

interface FormField {
  type: "string" | "number" | "date" | "boolean" | "password" | "email";
  id: string;
  label?: string;
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
        return Object.assign(prev, { [it.id]: _formData.get(it.id) });
      }, {});

      if (onSubmit) {
        onSubmit(e, _formFields);
      }
    },
    [onSubmit]
  );

  const element = useMemo(() => {
    return (
      <form onSubmit={handleSubmit}>
        {fields.map((field) => {
          return (
            <Input
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
        })}
        <ButtonView secondary>Submit</ButtonView>
      </form>
    );
  }, [fields]);

  return { element, formData };
};
