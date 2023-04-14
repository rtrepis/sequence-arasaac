const useLoadLocalMessages = (locale: string) => {
  switch (locale) {
    case "es-ES":
      return import("./es.json");
    case "en-GB":
      return import("./en.json");
    case "ca-ES":
      return import("./ca.json");
    default:
      return import("./en.json");
  }
};

export default useLoadLocalMessages;
