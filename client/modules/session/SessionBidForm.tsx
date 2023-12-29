import { useCallback, useContext } from "react";
import { ContestSessionContext } from "./sessionContext";
import { useForm } from "../form/useForm";
import { postSessionBid } from "./session.api";
import { ProfileContext } from "../profile/profileContext";
import { useNotification } from "../notification/useNotification";

export const SessionBidForm = () => {
  const [_, profile] = useContext(ProfileContext);
  const { show } = useNotification();
  const [loading, data, dispatch] = useContext(ContestSessionContext);

  const handleSubmit = useCallback(
    async (e, { option, value }) => {
      if (value > profile.assets) {
        show("Not enough assets");
        return false;
      }

      const _state = await postSessionBid(data.id, profile.id, {
        optionId: option,
        value,
      });

      if (_state && !_state.error) {
        dispatch(_state);
      }
    },
    [profile?.id, data?.id]
  );

  const { element } = useForm({
    onSubmit: handleSubmit,
    initialData: { value: null, bid: 0 },
    fields: [
      {
        type: "number",
        id: "value",
        inputProps: { min: 1, max: profile?.assets, autoComplete: "off" },
        required: true,
      },
      {
        type: "select",
        id: "option",
        options: data.options,
        required: true,
      },
    ],
  });

  if (data == null) {
    return null;
  }

  return <div>{element}</div>;
};
