export const getFormEntries = (formElement) => {
  const data = new FormData(formElement);
  // const formFields = fields.reduce((prev, it) => {
  //   const type = it.type || "text";
  //   const id = it.id;
  //   const value = _formData.get(id) || "";
  //   let fieldValue: any = value;

  //   console.log({ formData, id });
  //   switch (type) {
  //     case "number": {
  //       fieldValue = Number(value);
  //       break;
  //     }
  //     case "list": {
  //       fieldValue = formData[id];
  //       break;
  //     }
  //   }

  //   return Object.assign(prev, { [id]: fieldValue });
  // }, {});
  const fields = {};

  const applyStep = (iterator) => {
    if (!iterator || !iterator.next) {
      return null;
    }

    const res = iterator.next();

    if (res.value) {
      fields[res.value[0]] = res.value[1];
    }

    return res;
  };

  let step = applyStep(data.entries());

  while(step && !step.done) {
    step = applyStep(step);
  }

  return fields;
};
