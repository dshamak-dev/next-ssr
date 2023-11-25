export const generateId = () => {
  const _d = new Date();
  let id = _d
    .toLocaleString("us", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "numeric",
      weekday: 'narrow'
    })
    .replace(/[,:]/g, "")
    .split(" ")
    .sort(() => (Math.random() > 0.5 ? 1 : -1))
    .join("");

  return id.toLowerCase();
};
