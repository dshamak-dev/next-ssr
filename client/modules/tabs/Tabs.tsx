import React, { PropsWithChildren, useMemo, useState } from "react";
import { ITab } from "./tabs.model";
import classNames from "classnames";

interface Props {
  tabs: ITab[];
  onChange?: (tab: ITab) => void;
  headerClassName?: string;
}

export const Tabs: React.FC<PropsWithChildren<Props>> = ({
  tabs = [],
  onChange,
  headerClassName,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const handleChange = (nextIndex: number) => {
    setActiveIndex(nextIndex);
  };

  const headerItems = useMemo(() => {
    if (tabs.length < 2) {
      return null;
    }

    return (
      tabs.map((it, index) => (
        <div
          key={index}
          onClick={() => handleChange(index)}
          className={classNames("select-none", {
            "pointer opacity-50 grayscale": activeIndex !== index,
          })}
        >
          {it.title}
        </div>
      )) || null
    );
  }, [tabs, activeIndex]);

  const content = useMemo(() => {
    const item = tabs[activeIndex];

    if (!item || !item.content) {
      return null;
    }

    const _content = item.content;

    if (typeof _content === "function") {
      return _content();
    }

    return _content;
  }, [tabs, activeIndex]);

  return (
    <div>
      {headerItems ? (
        <div className={classNames("tabs-header flex gap-1", headerClassName)}>
          {headerItems}
        </div>
      ) : null}
      <div className="tabs-content">{content}</div>
      <style jsx>{``}</style>
    </div>
  );
};
