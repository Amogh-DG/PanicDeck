/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_AWS_REGION: string;
  readonly VITE_S3_BUCKET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace google {
  namespace accounts {
    namespace id {
      function initialize(config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }): void;
      function renderButton(
        parent: HTMLElement,
        options: {
          theme?: 'outline' | 'filled_blue' | 'filled_black';
          size?: 'large' | 'medium' | 'small';
          text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
          shape?: 'rectangular' | 'pill' | 'circle' | 'square';
          width?: number | string;
        }
      ): void;
      function prompt(callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getNotDisplayedReason: () => string }) => void): void;
      function disableAutoSelect(): void;
      function revoke(hint: string, done?: () => void): void;
    }
    namespace oauth2 {
      interface TokenResponse {
        access_token: string;
        token_type: string;
        expires_in: number;
        scope: string;
        error?: string;
        error_description?: string;
      }
      interface TokenClient {
        requestAccessToken(overrideConfig?: { prompt?: string }): void;
      }
      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        error_callback?: (error: unknown) => void;
      }): TokenClient;
    }
  }
}
