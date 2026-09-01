// La mida d'una imatge dita en el que l'usuari en farà: centímetres al paper.
//
// Va al costat de `useFormatBytes` perquè fan la mateixa feina —traduir un
// número tècnic a una unitat en què es pugui pensar— i perquè els dos els fan
// servir els mateixos tres llocs: el triador de qualitat, el botó de pujada i
// la llista d'imatges del compte. Amb dues implementacions, una imatge de
// 1.200 px podria sortir com a 10 cm en un lloc i 10,2 en un altre.
import { useIntl } from "react-intl";
import { printableSizeCm } from "@/utils/imagePrintSize";
import messages from "../components/AccountUsage.lang";

export const useFormatPrintSize = (): ((pixels: number) => string) => {
  const intl = useIntl();

  return (pixels: number): string =>
    intl.formatMessage(messages.centimeters, {
      value: intl.formatNumber(printableSizeCm(pixels)),
    });
};
