const loadLocalMessages = (locale: string) => {
  switch (locale) {
    case "ES":
      return import("./es.json");
    case "en-GB":
      return import("./en.json");
    case "ca-ES":
      return import("./ca.json");
    default:
      return import("./en.json");
  }
};

export default loadLocalMessages;
