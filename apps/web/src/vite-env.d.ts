/// <reference types="vite/client" />

// Variables d'entorn pròpies. Vite les declara amb un índex genèric que les
// dóna totes com a `any`: declarar-les aquí és el que fa que llegir-les no
// depengui d'un `any`.
interface ImportMetaEnv {
  // "false" apaga les funcions de compte (vegeu `configs/accountsConfig.ts`)
  readonly VITE_ACCOUNTS_ENABLED?: string;
}
