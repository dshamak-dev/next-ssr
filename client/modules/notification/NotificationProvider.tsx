import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const NotificationProvider = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable={false}
      pauseOnHover
      theme="light"
    />
  );
};

export type ToasterType = "default" | "success" | "warning" | "error" | "info";

export const showToaster = (
  type: ToasterType = "default",
  content: any,
  props?: any
) => {
  let handler: any = toast;

  switch (type) {
    case "success":
    case "warning":
    case "error":
    case "info": {
      handler = toast[type];
      break;
    }
    default: {
      handler = toast;
      break;
    }
  }

  if (handler) {
    handler(content, props);
  }
};
