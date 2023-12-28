import React, { useCallback, useContext, useMemo, useState } from "react";
import { ProfileNavigation } from "../../modules/navigation/ProfileNavigation";
import { FormField, useForm } from "../../modules/form/useForm";
import { useRouter } from "next/router";
import { ProfileContext } from "../../modules/profile/profileContext";
import { postSession } from "../../modules/session/session.api";

const sessionFields: FormField[] = [
  {
    id: "title",
    label: "Room Title",
    placeholder: "Enter Room Title",
    type: "string",
    required: true,
  },
  { id: "description", label: "Description", type: "string" },
  { id: "options", label: "Options", type: "list", required: true },
];

export const SessionFormPage = () => {
  const router = useRouter();
  const [_, profile] = useContext(ProfileContext);
  const [busy, setBusy] = useState(false);

  const handleSubmit = useCallback(
    async (e, formData) => {
      if (!profile?.id) {
        return;
      }

      setBusy(true);

      const { options, ...fields } = formData;

      const data = Object.assign(
        {
          ownerId: profile.id,
          options: options.map((text, index) => {
            return { text, id: index + 1 };
          }),
        },
        fields
      );

      const session = await postSession(data).catch(() => null);

      if (session) {
        router.replace(`/session/${session.id}`);
      }

      setBusy(false);
    },
    [profile?.id]
  );

  const { element } = useForm({
    initialData: null,
    fields: sessionFields,
    onSubmit: handleSubmit,
  });

  return (
    <main>
      <ProfileNavigation backUrl="/" />
      <div className="p-1">{element}</div>
    </main>
  );
};

export default SessionFormPage;
