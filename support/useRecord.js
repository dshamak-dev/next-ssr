import { useState } from "react";

export const useRecord = (defaultState) => {
  // const [_, setUpdatedAt] = useState(null);
  const [_record] = useState(Object.assign({}, defaultState));

  // const setRecord = (entries) => {
  //   Object.entries(entries).forEach(([key, value]) => {
  //     _record[key] = value;
  //   });

  //   setUpdatedAt(Date.now());
  // };

  return _record;
};