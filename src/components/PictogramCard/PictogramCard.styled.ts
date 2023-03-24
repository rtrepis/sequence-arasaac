export const pictogram__card = (border: any, variant: any) => {
  const sx = {
    alignSelf: "center",
    minWidth: 195,
    maxWidth: 195,
    textAlign: "center",
    paddingInline: 1.5,
    border: `${border?.out === undefined ? 2 : border.out.size}px solid`,
    borderColor: border?.out?.color,
    borderRadius: `${border?.out === undefined ? 20 : border?.out.radius}px`,
    boxShadow: `${variant === undefined ? "" : "none"}`,
    "&:hover": {
      boxShadow: `${
        variant === undefined ? "0px 0px 10px 3px #A6A6A6" : "none"
      }`,
    },
  };

  return sx;
};

export const pictogram__media = (border: any, view: any) => {
  const sx = {
    marginTop: `${view === "complete" ? 0 : 2}`,
    width: 150,
    border: `${border?.in === undefined ? 2 : border?.in.size}px solid`,
    borderColor: border?.in?.color,
    borderRadius: `${border?.in === undefined ? 20 : border?.in.radius}px`,
  };

  return sx;
};
