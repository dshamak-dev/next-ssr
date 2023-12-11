import React, { useCallback, useContext } from "react";
import { ProfileContext } from "../../modules/profile/profileContext";
import { useForm } from "../../modules/form/useForm";
import { postTransaction } from "./profile.api";

interface Props {
  onClose?: () => void;
}

export const ProfileTransactionForm: React.FC<Props> = ({ onClose }) => {
  const [loading, data, logged, dispatch] = useContext(ProfileContext);

  const handleSubmit = useCallback(
    async (e, formData) => {
      const transaction = Object.assign(formData, {
        id: Date.now(),
        type: "personal transfer",
      });

      const response = await postTransaction(data?.id, transaction)
        .then((res) => res?.json())
        .catch(() => null);

      if (response != null) {
        dispatch({ type: "data", value: response });
      }

      if (onClose) {
        onClose();
      }
    },
    [data?.id, onClose]
  );

  const { element } = useForm({
    initialData: { value: 0, type: "add" },
    fields: [
      {
        id: "value",
        type: "number",
        label: "amount",
        required: true,
      },
    ],
    onSubmit: handleSubmit,
  });

  if (loading || !logged) {
    return null;
  }

  return <article>{element}</article>;
};
