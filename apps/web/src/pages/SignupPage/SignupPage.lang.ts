import { defineMessages } from "react-intl";

// Traduccions de la pàgina de creació de compte
const messages = defineMessages({
  pageTitle: {
    id: "pages.signup.pageTitle",
    defaultMessage: "Crea el teu compte",
    description: "Títol de la pàgina de signup",
  },
  hint: {
    id: "pages.signup.hint",
    defaultMessage:
      "Amb un compte pots desar les teves seqüències al núvol i recuperar-les des de qualsevol dispositiu. T'enviarem un correu per confirmar l'adreça i triar la contrasenya — encara no cal que en posis cap aquí.",
    description: "Guia inicial de la pàgina de signup",
  },
  name: {
    id: "pages.signup.name",
    defaultMessage: "Nom",
    description: "Etiqueta del camp nom",
  },
  useCase: {
    id: "pages.signup.useCase",
    defaultMessage: "Com faràs servir l'aplicació?",
    description: "Etiqueta del selector d'ús de l'aplicació",
  },
  useCaseFamily: {
    id: "pages.signup.useCaseFamily",
    defaultMessage: "En família",
    description: "Opció d'ús de l'aplicació: família",
  },
  useCaseTeacher: {
    id: "pages.signup.useCaseTeacher",
    defaultMessage: "Com a docent",
    description: "Opció d'ús de l'aplicació: docent",
  },
  useCaseProfessional: {
    id: "pages.signup.useCaseProfessional",
    defaultMessage: "Com a professional (logopeda, terapeuta...)",
    description: "Opció d'ús de l'aplicació: professional",
  },
  useCaseOther: {
    id: "pages.signup.useCaseOther",
    defaultMessage: "Altres",
    description: "Opció d'ús de l'aplicació: altres",
  },
  useCaseOtherLabel: {
    id: "pages.signup.useCaseOtherLabel",
    defaultMessage: "Explica'ns breument com la faràs servir (opcional)",
    description: 'Etiqueta del camp de text lliure quan l\'ús és "altres"',
  },
  email: {
    id: "pages.signup.email",
    defaultMessage: "Correu electrònic",
    description: "Etiqueta del camp correu",
  },
  submit: {
    id: "pages.signup.submit",
    defaultMessage: "Crea el compte",
    description: "Botó per enviar el formulari de signup",
  },
  loginLink: {
    id: "pages.signup.loginLink",
    defaultMessage: "Ja tens compte? Inicia sessió",
    description: "Enllaç per tornar a l'aplicació i obrir el login",
  },
  pageSubtitle: {
    id: "pages.signup.pageSubtitle",
    defaultMessage:
      "És gratuït i opcional: l'aplicació funciona sencera sense compte.",
    description: "Línia sota el títol de la pàgina de signup",
  },
  useCaseHelp: {
    id: "pages.signup.useCaseHelp",
    defaultMessage:
      "Ens ajuda a saber per a qui fem l'aplicació. No es publica enlloc.",
    description: "Ajuda del selector d'ús de l'aplicació",
  },
  emailHelp: {
    id: "pages.signup.emailHelp",
    defaultMessage:
      "Hi enviarem l'enllaç per confirmar l'adreça i triar la contrasenya.",
    description: "Ajuda del camp correu",
  },
  continueWithoutAccount: {
    id: "pages.signup.continueWithoutAccount",
    defaultMessage: "Continua sense compte",
    description: "Enllaç per anar a l'aplicació sense crear cap compte",
  },
  asideTitle: {
    id: "pages.signup.asideTitle",
    defaultMessage: "Què hi guanyes",
    description: "Encapçalament de la columna d'arguments del signup",
  },
  benefitCloudTitle: {
    id: "pages.signup.benefitCloudTitle",
    defaultMessage: "Les seqüències, al núvol",
    description: "Títol de l'argument del desat al núvol",
  },
  benefitCloudText: {
    id: "pages.signup.benefitCloudText",
    defaultMessage:
      "Desa-les i torna-hi des de qualsevol dispositiu, sense dependre d'aquest navegador.",
    description: "Text de l'argument del desat al núvol",
  },
  benefitVocabularyTitle: {
    id: "pages.signup.benefitVocabularyTitle",
    defaultMessage: "El teu vocabulari",
    description: "Títol de l'argument del vocabulari personal",
  },
  benefitVocabularyText: {
    id: "pages.signup.benefitVocabularyText",
    defaultMessage:
      "Les paraules que fas servir sovint, amb el pictograma i les imatges que hi posis.",
    description: "Text de l'argument del vocabulari personal",
  },
  benefitSettingsTitle: {
    id: "pages.signup.benefitSettingsTitle",
    defaultMessage: "La teva configuració",
    description: "Títol de l'argument de la configuració sincronitzada",
  },
  benefitSettingsText: {
    id: "pages.signup.benefitSettingsText",
    defaultMessage:
      "Mides, colors i format de pàgina et segueixen d'un dispositiu a l'altre.",
    description: "Text de l'argument de la configuració sincronitzada",
  },
  benefitNoAccountTitle: {
    id: "pages.signup.benefitNoAccountTitle",
    defaultMessage: "Sense compte, també",
    description: "Títol de l'argument que l'app funciona sense compte",
  },
  benefitNoAccountText: {
    id: "pages.signup.benefitNoAccountText",
    defaultMessage:
      "Fer seqüències i imprimir-les no demana compte: el que hi guanyes és no perdre-les.",
    description: "Text de l'argument que l'app funciona sense compte",
  },
  limitedTitle: {
    id: "pages.signup.limitedTitle",
    defaultMessage: "Les altes són limitades",
    description: "Títol de l'avís de places limitades",
  },
  limitedProject: {
    id: "pages.signup.limitedProject",
    defaultMessage:
      "SequenciAAC és un projecte petit i s'aguanta amb serveis gratuïts. Obrim les altes a poc a poc perquè pugui créixer sense trencar-se.",
    description: "Explicació de per què les altes són limitades",
  },
  limitedToday: {
    id: "pages.signup.limitedToday",
    defaultMessage:
      "{remaining, plural, =0 {No queda cap alta} one {Queda # alta} other {Queden # altes}} de les {total} d'avui.",
    description: "Altes que queden avui",
  },
  limitedTotal: {
    id: "pages.signup.limitedTotal",
    defaultMessage:
      "{remaining, plural, =0 {No queda cap plaça en total} one {Queda # plaça en total} other {Queden # places en total}}.",
    description: "Places totals que queden quan són menys que les d'un dia",
  },
  limitedResets: {
    id: "pages.signup.limitedResets",
    defaultMessage: "Se'n tornen a obrir d'aquí a {countdown}, a les {time}.",
    description: "Compte enrere fins a la renovació de les altes del dia",
  },
  reopensIn: {
    id: "pages.signup.reopensIn",
    defaultMessage: "Torna-ho a provar d'aquí a {countdown}, a les {time}.",
    description: "Compte enrere quan les altes del dia ja s'han esgotat",
  },
  closedTodayTitle: {
    id: "pages.signup.closedTodayTitle",
    defaultMessage: "Avui ja s'han fet totes les altes",
    description: "Títol de l'avís quan s'han esgotat les altes del dia",
  },
  closedFullTitle: {
    id: "pages.signup.closedFullTitle",
    defaultMessage: "Ara mateix no hi queden places",
    description: "Títol de l'avís quan s'ha arribat al sostre d'usuaris",
  },
  closedRegistrationTitle: {
    id: "pages.signup.closedRegistrationTitle",
    defaultMessage: "El registre és tancat temporalment",
    description: "Títol de l'avís quan el registre està tancat",
  },
  socialProof: {
    id: "pages.signup.socialProof",
    defaultMessage: "Ja hi ha {total} persones fent servir SequenciAAC.",
    description:
      "Nombre de persones registrades — només s'ensenya a partir del llindar",
  },
  countdownHours: {
    id: "pages.signup.countdownHours",
    defaultMessage: "{hours} h {minutes} min",
    description: "Compte enrere amb hores",
  },
  countdownMinutes: {
    id: "pages.signup.countdownMinutes",
    defaultMessage: "{minutes} min {seconds} s",
    description: "Compte enrere amb minuts",
  },
  countdownSeconds: {
    id: "pages.signup.countdownSeconds",
    defaultMessage: "{seconds} s",
    description: "Compte enrere de l'últim minut",
  },
  successTitle: {
    id: "pages.signup.successTitle",
    defaultMessage: "Revisa el teu correu",
    description: "Títol de la pantalla d'èxit després del signup",
  },
  success: {
    id: "pages.signup.success",
    defaultMessage:
      "T'hem enviat un correu a {email} amb un enllaç per confirmar l'adreça i triar la contrasenya. Si no el veus a la safata d'entrada, mira també a spam.",
    description: "Missatge d'èxit després del signup",
  },
  failedTitle: {
    id: "pages.signup.failedTitle",
    defaultMessage: "No hem pogut enviar el correu",
    description: "Títol de la pantalla de signup quan el correu no ha sortit",
  },
  failed: {
    id: "pages.signup.failed",
    defaultMessage:
      "El compte de {email} s'ha creat, però el correu amb l'enllaç per triar la contrasenya no ha pogut sortir. Sense aquest enllaç encara no hi pots entrar: torna a demanar-lo.",
    description: "Missatge de signup amb el compte creat i el correu no enviat",
  },
  resend: {
    id: "pages.signup.resend",
    defaultMessage: "Torna a enviar el correu",
    description: "Botó per demanar de nou el correu de verificació",
  },
  resendDone: {
    id: "pages.signup.resendDone",
    defaultMessage:
      "Ho hem tornat a demanar. Si al cap d'uns minuts continua sense arribar, mira també a spam i prova-ho més tard.",
    description:
      "Confirmació d'haver tornat a demanar el correu de verificació",
  },
  goToApp: {
    id: "pages.signup.goToApp",
    defaultMessage: "Ves a l'aplicació",
    description: "Botó per tornar a l'aplicació des de la pantalla d'èxit",
  },
});

export default messages;
