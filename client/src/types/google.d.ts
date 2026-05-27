
export interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (options: any) => void;
        prompt: (notification?: any) => void;
        renderButton: (element: HTMLElement, options?: any) => void;
      };
    };
  };
}