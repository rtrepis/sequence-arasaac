// Codis d'error i els seus textos (vegeu ADR-004, decisió 7). El back no envia
// mai text a l'API: envia un codi ({ errorCode }) i el front el tradueix amb el
// catàleg `messages/errors/`, on cada clau és `error.<CODI>`.

// Tots els codis que l'API pot enviar al client
export const API_ERROR_CODES = [
  "ACCOUNTS_DISABLED",
  "ACCOUNT_SUSPENDED",
  "ASSET_INVALID_ID",
  "ASSET_NOT_FOUND",
  "AUTH_TOKEN_INVALID",
  "AUTH_TOKEN_MISSING",
  "CLIENT_ERROR_NOT_FOUND",
  "DAILY_SIGNUP_LIMIT_REACHED",
  "DISPOSABLE_EMAIL",
  "DOCUMENT_INVALID_FORMAT",
  "DOCUMENT_NOT_FOUND",
  "EMAIL_INVALID_FORMAT",
  "EMAIL_NOT_VERIFIED",
  "EMAIL_REQUIRED",
  "FORBIDDEN",
  "IMAGE_INVALID",
  "IMAGE_TOO_LARGE",
  "INTERNAL_ERROR",
  "INVALID_CREDENTIALS",
  "INVALID_DATA",
  "INVALID_REFRESH_TOKEN",
  "MAIL_SEND_FAILED",
  "MAX_USERS_REACHED",
  "NAME_REQUIRED",
  "NAME_TOO_LONG",
  "PASSWORD_MISMATCH",
  "PASSWORD_MISSING_LOWERCASE",
  "PASSWORD_MISSING_NUMBER",
  "PASSWORD_MISSING_UPPERCASE",
  "PASSWORD_REQUIRED",
  "PASSWORD_TOO_LONG",
  "PASSWORD_TOO_SHORT",
  "QUOTA_DOCUMENTS_EXCEEDED",
  "QUOTA_STORAGE_EXCEEDED",
  "QUOTA_WORD_PROFILES_EXCEEDED",
  "REFRESH_TOKEN_EXPIRED",
  "REFRESH_TOKEN_MISSING",
  "REGISTRATION_CLOSED",
  "TOO_MANY_ATTEMPTS",
  "TOO_MANY_REGISTRATIONS",
  "UNKNOWN_ERROR",
  "USER_NOT_FOUND",
  "USE_CASE_REQUIRED",
  "VERIFICATION_TOKEN_INVALID",
  "VERIFICATION_TOKEN_MISSING",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

// Cos de tota resposta d'error de l'API
export interface ApiErrorBody {
  errorCode: ApiErrorCode;
}

// Codis de l'API sense text propi: no arriben a l'usuari tal qual (sessió que es
// refresca sola, eines d'administració, errors interns) i, si n'arriba un,
// l'usuari hi veu el missatge genèric del context on ha passat
export const API_ERROR_CODES_WITHOUT_TEXT = [
  "ACCOUNTS_DISABLED",
  "ASSET_INVALID_ID",
  "ASSET_NOT_FOUND",
  "AUTH_TOKEN_INVALID",
  "AUTH_TOKEN_MISSING",
  "CLIENT_ERROR_NOT_FOUND",
  "DOCUMENT_NOT_FOUND",
  "FORBIDDEN",
  "IMAGE_INVALID",
  "INTERNAL_ERROR",
  "INVALID_DATA",
  "MAIL_SEND_FAILED",
] as const satisfies readonly ApiErrorCode[];

// Codis que només fa servir el front: el missatge genèric de cada context
export const CLIENT_ERROR_CODES = [
  "AUTH_ERROR",
  "DOCUMENT_SAVE_ERROR",
  "REGISTER_ERROR",
  "SET_PASSWORD_ERROR",
  "VERIFICATION_EMAIL_FAILED",
] as const;

export type ClientErrorCode = (typeof CLIENT_ERROR_CODES)[number];

// Codis que tenen text al catàleg `errors`
export type ErrorCodeWithText =
  | Exclude<ApiErrorCode, (typeof API_ERROR_CODES_WITHOUT_TEXT)[number]>
  | ClientErrorCode;

export const ERROR_CODES_WITH_TEXT: readonly ErrorCodeWithText[] = [
  ...API_ERROR_CODES.filter(
    (code): code is Exclude<ApiErrorCode, (typeof API_ERROR_CODES_WITHOUT_TEXT)[number]> =>
      !(API_ERROR_CODES_WITHOUT_TEXT as readonly string[]).includes(code),
  ),
  ...CLIENT_ERROR_CODES,
];

export const isApiErrorCode = (value: string | null | undefined): value is ApiErrorCode =>
  (API_ERROR_CODES as readonly string[]).includes(value ?? "");

const hasErrorText = (value: string): value is ErrorCodeWithText =>
  (ERROR_CODES_WITH_TEXT as readonly string[]).includes(value);

// Descriptor del text d'un codi conegut, per a react-intl
export const errorMessage = (code: ErrorCodeWithText): { id: string } => ({
  id: `error.${code}`,
});

// Descriptor del text d'un codi que arriba de fora (la resposta de l'API, un
// estat de Redux): si no en té, el de `fallback`, el genèric del context
export const errorMessageFor = (
  code: string | null | undefined,
  fallback: ErrorCodeWithText,
): { id: string } => errorMessage(code && hasErrorText(code) ? code : fallback);
