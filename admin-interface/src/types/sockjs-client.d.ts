declare module 'sockjs-client' {
  class SockJS {
    constructor(url: string, _reserved?: any, options?: any);
    close(code?: number, reason?: string): void;
    send(data: string): void;
    onopen: () => void;
    onclose: (e: any) => void;
    onmessage: (e: { data: string }) => void;
    onerror: (e: any) => void;
  }
  
  export default SockJS;
} 