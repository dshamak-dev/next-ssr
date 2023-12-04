import classNames from "classnames";
import React from "react";
import styles from "./Link.module.scss";
import Link from "next/link";

interface Props extends React.PropsWithChildren<any> {}

export const LinkView: React.FC<Props> = ({ className, href, ...other }) => {
  return (
    <Link
      href={href}
      {...other}
      className={classNames(styles.link, className)}
    ></Link>
  );
};
