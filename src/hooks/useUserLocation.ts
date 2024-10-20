import { useIntl } from "react-intl";

const useUserLocation = () => {
  const intl = useIntl();

  console.log(intl.locale);

  const pathLocation = window.location.pathname.slice(0, 4);
  const regexp = new RegExp(/^([/][A-Za-z]{2}[/])/g);
  const isPathLocation = regexp.test(pathLocation);

  const locale = isPathLocation
    ? pathLocation.slice(1, 3)
    : intl.locale.slice(0, 2).toLocaleLowerCase();

  return locale;
};

export default useUserLocation;
