// Dominis de correu descartable
//
// Llista curta i estàtica a propòsit: cap dependència externa en temps d'execució
// i cap descàrrega periòdica. Les llistes exhaustives de milers de dominis envelleixen
// malament i acaben bloquejant gent legítima — en una app d'AAC, deixar fora una
// família o un centre educatiu és molt pitjor que deixar entrar un compte temporal.
//
// Cobreix els serveis més habituals: la resta els atura el sostre global d'usuaris.

const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "20minutemail.com",
  "dispostable.com",
  "fakeinbox.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "mailinator.com",
  "maildrop.cc",
  "mailnesia.com",
  "mintemail.com",
  "mohmal.com",
  "sharklasers.com",
  "spam4.me",
  "temp-mail.org",
  "tempmail.com",
  "tempmailo.com",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
  "yopmail.net",
]);

// Indica si l'adreça pertany a un servei de correu temporal conegut
export const isDisposableEmail = (email: string): boolean => {
  const domain = email.trim().toLowerCase().split("@").pop();
  return domain !== undefined && DISPOSABLE_DOMAINS.has(domain);
};
