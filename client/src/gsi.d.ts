interface IdConfiguration {
  client_id: string;
  auto_select?: boolean;
  callback: (response: CredentialResponse) => void;
  cancel_on_tap_outside?: boolean;
  context?: string;
  native_login_button?: boolean;
  prompt_parent_id?: string;
  state_cookie_domain?: string;
  ux_mode?: "popup" | "redirect";
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
}

interface CredentialResponse {
  credential: string;
  select_by: string;
}

interface GsiButtonConfiguration {
  type: "standard" | "icon";
  shape?: "rectangular" | "pill" | "circle" | "square";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  width?: string | number;
  locale?: string;
  logo_alignment?: "left" | "center";
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize(config: IdConfiguration): void;
        renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
        disableAutoSelect(): void;
        storeCredential(credential: string, callback?: () => void): void;
        cancel(): void;
        onGoogleLibraryLoad?: () => void;
        prompt(momentListener?: (notification: PromptMomentNotification) => void): void;
      };
    };
  };
}
