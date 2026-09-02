// Avís de places limitades de la pàgina de creació de compte.
//
// Diu tres coses, i en aquest ordre: que el projecte és petit i per això les
// altes van comptades, quantes en queden, i quan se'n tornen a obrir. Qui
// arriba aquí i es troba el formulari tancat ha de saber **per què** i **quan**
// tornar-hi; sense això, un formulari que no deixa registrar-se sembla espatllat.
import React from "react";
import { Alert, AlertTitle, Box, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import type { RegistrationStatus } from "@sequence-arasaac/shared-types";
import useCountdown, { Countdown } from "@/utils/useCountdown";
import messages from "./SignupPage.lang";

/**
 * A partir d'aquesta xifra, el nombre de persones registrades s'ensenya.
 *
 * Per sota no: una xifra petita no diu "hi ha lloc", diu "aquí no hi ha
 * ningú", i el que aquesta pàgina ha d'explicar és justament el contrari —que
 * les altes van a poc a poc **perquè** el projecte es pugui sostenir.
 */
export const SIGNUP_SOCIAL_PROOF_MIN_USERS = 200;

/** Per què no es pot crear un compte ara mateix, o null si sí que es pot. */
export type SignupClosedReason = "registration" | "full" | "today";

export const getClosedReason = (
  status: RegistrationStatus | null,
): SignupClosedReason | null => {
  // Sense estat (el servidor no ha respost) no es tanca res: qui decideix si hi
  // cap una alta més és el servidor en rebre-la
  if (!status || status.canSignup) return null;
  if (!status.registrationOpen) return "registration";
  if (status.remainingUsers === 0) return "full";
  return "today";
};

interface SignupRegistrationNoticeProps {
  status: RegistrationStatus | null;
  /** Es crida quan el compte enrere arriba a zero: cal tornar a demanar l'estat. */
  onCountdownOver: () => void;
}

const SignupRegistrationNotice = ({
  status,
  onCountdownOver,
}: SignupRegistrationNoticeProps): React.ReactElement | null => {
  const intl = useIntl();
  const countdown = useCountdown(status?.resetsAt ?? null, onCountdownOver);

  if (!status) return null;

  const closedReason = getClosedReason(status);

  // Tres formats segons el que queda: amb hores, els segons no aporten res i
  // només fan ballar la xifra; a l'últim minut són l'única cosa que es mou
  const formatCountdown = ({ hours, minutes, seconds }: Countdown): string => {
    if (hours > 0)
      return intl.formatMessage(messages.countdownHours, { hours, minutes });
    if (minutes > 0)
      return intl.formatMessage(messages.countdownMinutes, {
        minutes,
        seconds,
      });
    return intl.formatMessage(messages.countdownSeconds, { seconds });
  };

  // Les places totals només s'ensenyen quan són elles les que manen: si en
  // queden menys que un dia sencer d'altes, la xifra del dia enganya
  const totalIsBinding = status.remainingUsers < status.maxDailySignups;

  const resetLine = countdown
    ? intl.formatMessage(
        closedReason === "today" ? messages.reopensIn : messages.limitedResets,
        {
          countdown: formatCountdown(countdown),
          time: intl.formatTime(status.resetsAt),
        },
      )
    : null;

  return (
    <Alert
      severity={closedReason ? "warning" : "info"}
      variant="outlined"
      // role="note" i no el "alert" que MUI hi posa per defecte: el compte
      // enrere canvia cada segon i una regió viva el faria llegir en veu alta
      // cada vegada. L'hora exacta hi va al costat justament per això —i perquè
      // un compte enrere sol no diu a quina hora s'hi ha de tornar.
      role="note"
    >
      <AlertTitle>
        {intl.formatMessage(
          closedReason === "registration"
            ? messages.closedRegistrationTitle
            : closedReason === "full"
              ? messages.closedFullTitle
              : closedReason === "today"
                ? messages.closedTodayTitle
                : messages.limitedTitle,
        )}
      </AlertTitle>

      <Typography variant="body2" component="p">
        {intl.formatMessage(messages.limitedProject)}
      </Typography>

      <Box component="p" sx={{ m: 0, mt: 1 }}>
        {closedReason !== "registration" && closedReason !== "full" && (
          <Typography
            variant="body2"
            component="span"
            sx={{ display: "block" }}
          >
            {intl.formatMessage(messages.limitedToday, {
              remaining: status.remainingToday,
              total: status.maxDailySignups,
            })}
          </Typography>
        )}

        {totalIsBinding && (
          <Typography
            variant="body2"
            component="span"
            sx={{ display: "block" }}
          >
            {intl.formatMessage(messages.limitedTotal, {
              remaining: status.remainingUsers,
            })}
          </Typography>
        )}

        {resetLine &&
          closedReason !== "registration" &&
          closedReason !== "full" && (
            <Typography
              variant="body2"
              component="span"
              sx={{ display: "block", fontWeight: 700 }}
            >
              {resetLine}
            </Typography>
          )}

        {status.totalUsers >= SIGNUP_SOCIAL_PROOF_MIN_USERS && (
          <Typography
            variant="body2"
            component="span"
            sx={{ display: "block" }}
          >
            {intl.formatMessage(messages.socialProof, {
              total: status.totalUsers,
            })}
          </Typography>
        )}
      </Box>
    </Alert>
  );
};

export default SignupRegistrationNotice;
