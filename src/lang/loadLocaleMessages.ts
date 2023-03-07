const loadLocalMessages = (locale: string) => {
  switch (locale) {
    case "ca-ES":
      return import("../lang/ca.json");

    default:
      return import("../lang/en.json");
  }
};

export default loadLocalMessages;
