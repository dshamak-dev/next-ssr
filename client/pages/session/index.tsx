import React, { useCallback, useContext, useMemo, useState } from "react";
import { ProfileNavigation } from "../../modules/navigation/ProfileNavigation";
import { FormField, useForm } from "../../modules/form/useForm";
import { useRouter } from "next/router";
import { ProfileContext } from "../../modules/profile/profileContext";
import { postSession } from "../../modules/session/session.api";
import { useNotification } from "../../modules/notification/useNotification";

const sessionFields: FormField[] = [
  {
    id: "title",
    label: "Session Title",
    placeholder: "Enter Session Title",
    type: "string",
    required: true,
  },
  {
    id: "description",
    label: "Describe your contest",
    placeholder: "Enter Description",
    type: "string",
  },
  {
    id: "options",
    label: "Answer Variants",
    type: "list",
    required: true,
    defaultValue: new Array(2).fill(""),
  },
];

export const SessionFormPage = () => {
  const router = useRouter();
  const { show } = useNotification();
  const [_, profile] = useContext(ProfileContext);
  const [busy, setBusy] = useState(false);

  const handleSubmit = useCallback(
    async (e, formData) => {
      if (!profile?.id) {
        return;
      }

      const { options, ...fields } = formData;
      const optionsNum = options?.length || 0;

      if (optionsNum < 1) {
        show("At least two options required");
        return;
      }

      setBusy(true);

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
