const loadLocalMessages = (locale: string) => {
  switch (locale) {
    case "ca-ES":
      return import("./ca.json");

    default:
      return import("./en.json");
  }
};

export default loadLocalMessages;
