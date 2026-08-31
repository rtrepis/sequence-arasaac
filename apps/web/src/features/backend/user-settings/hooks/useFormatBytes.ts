// Pes d'una imatge dit en la unitat en què es pot pensar.
//
// Els bytes crus no serveixen per decidir res: el que ha de quedar clar és si
// una imatge és «mig mega» o «vuitanta ke». El llindar és 1 MB perquè per sota
// els decimals de megabyte (0,08 MB) es llegeixen pitjor que els kilobytes.
import { useIntl } from "react-intl";
import messages from "../components/AccountUsage.lang";

const KILOBYTE = 1024;
const MEGABYTE = 1024 * KILOBYTE;

export const useFormatBytes = (): ((bytes: number) => string) => {
  const intl = useIntl();

  return (bytes: number): string => {
    if (bytes >= MEGABYTE) {
      return intl.formatMessage(messages.megabytes, {
        value: intl.formatNumber(bytes / MEGABYTE, {
          maximumFractionDigits: 1,
        }),
      });
    }

    return intl.formatMessage(messages.kilobytes, {
      value: intl.formatNumber(Math.round(bytes / KILOBYTE)),
    });
  };
};
