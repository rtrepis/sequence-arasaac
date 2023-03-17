const toUrlPathApiAraSaac = (pictogram: number, skin: string | undefined) => {
  let path = `https://api.arasaac.org/api/pictograms/${pictogram}`;

  if (skin) {
    skin !== "default" &&
      (path += `?skin=${skin === "asian" ? "assian" : skin}`);
  }

  return path;
};

export default toUrlPathApiAraSaac;
