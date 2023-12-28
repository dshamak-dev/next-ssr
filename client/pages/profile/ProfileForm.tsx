import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useAuth } from "../../modules/auth/useAuth";
import { getProfile, postProfile } from "../../modules/profile/profile.api";
import { waitFor } from "../../api/api.model";
import { Loader } from "../../modules/loader/Loader";
import { Label } from "../../modules/label/Label";
import { ProfileContext } from "../../modules/profile/profileContext";
import { useForm } from "../../modules/form/useForm";

interface Props {}

export const ProfileFormPage: React.FC<Props> = ({}) => {
  const { user, authId } = useAuth();
  const [loading, data, logged, dispatch] = useContext(ProfileContext);

  const handleSubmit = useCallback(async (e, formData) => {
    const profile = Object.assign(formData, { authId });

    console.log(profile);

    dispatch({ type: "loading", value: true });

    const response = await postProfile(profile);

    dispatch({ type: "data", value: response });
  }, [authId, dispatch]);

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
    <article>
      <div>Create Profile</div>
      {element}
    </article>
  );
};

export default ProfileFormPage;