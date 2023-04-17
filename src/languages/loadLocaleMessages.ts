const useLoadLocalMessages = (locale: string) => {
  switch (locale) {
    case "es":
      return import("./es.json");
    case "en":
      return import("./en.json");
    case "ca":
      return import("./ca.json");
    default:
      return import("./en.json");
  }
};

export default useLoadLocalMessages;
