/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _mtm?: any;
}

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
  readonly TURNSTILE_SECRET_KEY: string;
  readonly POSTMARK_SERVER_API_KEY: string;
  readonly DESTINATION_EMAIL: string;
  readonly SOURCE_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
