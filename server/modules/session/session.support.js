const methods = {};

methods.getSessionSummary = (session) => {
  const optionsTotal = {};
  let total = 0;

  Object.values(session.users).forEach(({ optionId, value }) => {
    if (!optionsTotal[optionId]) {
      optionsTotal[optionId] = 0;
    }

    optionsTotal[optionId] += value;

    total += value;
  });

  return {
    optionsTotal,
    total,
  };
};

methods.getSessionPrizePerUser = (session) => {
  if (!session || !session.summary) {
    return null;
  }
  const { users, summary, values } = session;
  const { optionsTotal, total } = summary;
  const answer = values ? values[0] : null;

  const usersPrize = Object.entries(users).reduce((prev, it) => {
    const [id, { optionId, value }] = it;

    if (answer != optionId) {
      return prev;
    }

    const optionSumm = Number(optionsTotal[optionId]) || 0;

    const rate = Number((value / optionSumm).toFixed(2));

    const state = {
      optionId,
      rate,
      value: total * rate,
    };

    return { ...prev, [id]: state };
  }, {});

  return usersPrize;
};

module.exports = methods;
