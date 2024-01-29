import React, { useCallback, useContext, useMemo } from "react";
import { ProfileContext } from "../../modules/profile/profileContext";
import { postTransaction, useProfileVoucher } from "./profile.api";
import { Tabs } from "../tabs/Tabs";
import { Form } from "../form/Form";
import { useNotification } from "../notification/useNotification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faTicket } from "@fortawesome/free-solid-svg-icons";

interface Props {
  onClose?: () => void;
}

export const ProfileTransactionForm: React.FC<Props> = ({ onClose }) => {
  const [loading, profile, logged, dispatch] = useContext(ProfileContext);
  const { show } = useNotification();

  const updateProfile = (nextState) => {
    if (nextState != null) {
      dispatch({ type: "data", value: nextState });
    }

    if (nextState && onClose) {
      onClose();
    }
  };

  const handleSubmitCard = useCallback(
    async (e, formData) => {
      const transaction = Object.assign(formData, {
        title: "personal transfer",
        sourceType: "private",
        type: "add",
        sourceId: profile.id,
      });

      const response = await postTransaction(profile?.id, transaction)
        .catch(() => null);

      updateProfile(response);
    },
    [profile?.id, onClose]
  );

  const handleSubmitVoucher = useCallback(
    async (e, { voucher }) => {
      const response = await useProfileVoucher(profile?.id, voucher)
        .catch((error) => {
          show('warning', error.message);

          return null;
        });

      updateProfile(response);
    },
    [profile?.id, onClose]
  );

  const tabs = useMemo(() => {
    return [
      {
        title: (
          <div
            title="Voucher"
            className="flex items-center justify-center rounded-full w-2 h-2 bg-black text-white"
          >
            <FontAwesomeIcon icon={faTicket} />
          </div>
        ),
        content: (
          <div>
            <Form
              initialData={{ voucher: null }}
              fields={[
                {
                  id: "voucher",
                  type: "string",
                  label: "Voucher",
                  placeholder: "Enter Voucher",
                  required: true,
                  className: "primary"
                },
              ]}
              onSubmit={handleSubmitVoucher}
            />
          </div>
        ),
      },
      // {
      //   title: (
      //     <div
      //       title="Card"
      //       className="flex items-center justify-center rounded-full w-2 h-2 bg-black text-white"
      //     >
      //       <FontAwesomeIcon icon={faCreditCard} />
      //     </div>
      //   ),
      //   content: (
      //     <div>
      //       <label>coming soon!</label>
      //       {/* <Form
      //         initialData={{ value: 0, type: "add" }}
      //         fields={[
      //           {
      //             id: "value",
      //             type: "number",
      //             label: "amount",
      //             required: true,
      //           },
      //         ]}
      //         onSubmit={handleSubmitCard}
      //       /> */}
      //     </div>
      //   ),
      // },
    ];
  }, []);

  if (loading || !logged) {
    return null;
  }

  return (
    <div className="flex col gap-1 text-center">
      <Tabs tabs={tabs} headerClassName="justify-center" />
    </div>
  );
};
