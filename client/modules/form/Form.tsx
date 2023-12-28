import React from "react";
import { FormField, useForm } from "./useForm";

interface Props extends React.PropsWithChildren<any> {
  initialData;
  fields: FormField[];
  onSubmit: (e, data) => void;
}

export const Form: React.FC<Props> = ({ initialData, fields, onSubmit }) => {
  const { element } = useForm({ initialData, fields, onSubmit });

  return element;
};
