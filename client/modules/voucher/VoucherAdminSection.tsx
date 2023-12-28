import React, { useCallback, useContext } from "react";
import { IVoucher } from "./voucher.model";
import { Voucher } from "./Voucher";
import { ProfileContext } from "../profile/profileContext";
import { useApi } from "../../support/useApi";
import { getVouchers, postVoucher } from "./voucher.api";
import { VoucherList } from "./VoucherList";
import { Loader } from "../loader/Loader";
import { PopupButton } from "../popup/PopupButton";
import { VoucherForm } from "./VoucherForm";
import { useNotification } from "../notification/useNotification";

interface Props {}

const closePopupEventName = "closePopup";

export const VoucherAdminSection: React.FC<Props> = ({}) => {
  const [loadingProfile, profile] = useContext(ProfileContext);
  const [
    loadingVouchers,
    vouchers,
    vouchersError,
    requestVouchers,
    setVouchers,
  ] = useApi(async () => getVouchers(profile?.id), [], profile?.id != null);
  const { show } = useNotification();

  const handleAddVoucher = useCallback(async (e, formData) => {
    const event = new CustomEvent(closePopupEventName, {
      bubbles: true,
      detail: {},
    });

    const voucher = await postVoucher(profile?.id, formData).catch(
      (err) => null
    );

    if (voucher) {
      setVouchers([...vouchers, voucher]);

      e.target.dispatchEvent(event);
    } else {
      show({ text: `Can't create voucher. Try again!` });
    }
  }, [vouchers]);

  return (
    <div className="flex col gap-2">
      <PopupButton
        onText="cancel"
        offText="add voucher"
        buttonProps={{
          primary: true,
          className: "w-fit",
        }}
        closeEvents={[closePopupEventName]}
      >
        <VoucherForm onSubmit={handleAddVoucher} />
      </PopupButton>
      {loadingVouchers ? <Loader /> : null}
      <VoucherList vouchers={vouchers} />
    </div>
  );
};
