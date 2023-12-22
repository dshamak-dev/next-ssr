import { useContext, useMemo } from "react";
import { ContestSessionContext } from "./sessionContext";
import { ProfileContext } from "../profile/profileContext";
import { Button } from "../button/Button";
import { lockSession, resolveSession } from "./session.api";
import { SessionStageType, SessionState } from "./session.model";
import { PopupButton } from "../popup/PopupButton";
import { Form } from "../form/Form";

export const SessionAdmin = () => {
  const [_, profile] = useContext(ProfileContext);
  const [loading, data, dispatch] = useContext(ContestSessionContext);

  if (data == null || !data.admin) {
    return null;
  }

  const { options } = data;

  const handleLock = async () => {
    const state = await lockSession(data.id, profile.id);

    if (state && !state.error) {
      dispatch(state);
    }
  };

  const handleResolve = async (e, { optionId }) => {
    const state = await resolveSession(data.id, profile.id, { options: [optionId] });

    if (state && !state.error) {
      dispatch(state);
    }
  };

  const content = useMemo(() => {
    if (data == null) {
      return null;
    }

    const { stage } = data as SessionState;

    switch (stage) {
      case SessionStageType.Draft:
      case SessionStageType.Lobby: {
        return (
          <div>
            <Button primary onClick={handleLock}>
              Lock Session
            </Button>
          </div>
        );
      }
      case SessionStageType.Active: {
        return (
          <div>
            <PopupButton
              buttonProps={{
                primary: true,
              }}
              offText="Resolve Session"
              onText="Cancel"
            >
              <Form
                initialData={{}}
                onSubmit={handleResolve}
                fields={[
                  {
                    id: "optionId",
                    type: "select",
                    options,
                  },
                ]}
              />
            </PopupButton>
          </div>
        );
      }
      default: {
        return null;
      }
    }
  }, [data]);

  return content;
};
