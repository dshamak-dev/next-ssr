import React, { useCallback, useContext } from "react";
import { useAuth } from "../../modules/auth/useAuth";
import { postProfile } from "../../modules/profile/profile.api";
import { ProfileContext } from "../../modules/profile/profileContext";
import { useForm } from "../../modules/form/useForm";

interface Props {}

export const ProfileFormPage: React.FC<Props> = ({}) => {
  const { user, authId } = useAuth();
  const [loading, data, logged, dispatch] = useContext(ProfileContext);

  const handleSubmit = useCallback(
    async (e, formData) => {
      const profile = Object.assign(formData, { authId });

      dispatch({ type: "loading", value: true });

      const response = await postProfile(profile);

      console.log(response);

      if (response) {
        dispatch({ type: "data", value: response });
      } else {
        dispatch({ type: "error", value: "something went wrong. Try again" });
      }
    },
    [authId, dispatch]
  );

  const { element } = useForm({
    initialData: { displayName: user?.displayName, email: user?.email },
    fields: [
      {
        id: "displayName",
        type: "string",
        label: "name",
        required: true,
      },
      {
        id: "email",
        type: "email",
        label: "email",
        required: true,
      },
    ],
    onSubmit: handleSubmit,
  });

  if (user == null) {
    return null;
  }

  return (
    <article className="p-1">
      <div>Create Profile</div>
      {element}
    </article>
  );
};

export default ProfileFormPage;
