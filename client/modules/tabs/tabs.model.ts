import { ReactElement, ReactNode } from "react";

export interface ITab {
  title: string | ReactElement;
  content: ReactElement | (() => ReactElement);
}
