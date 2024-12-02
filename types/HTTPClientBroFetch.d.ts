declare class HTTPClientBroFetch {
  private url: string;
  private protocol: string;
  private hostname: string;
  private port: number;
  private pathname: string;
  private queryString: string;
  private opts: {
    encodeURI: boolean;
    timeout: number;
    responseType: string;
    retry: number;
    retryDelay: number;
    maxRedirects: number;
    headers: Record<string, string>;
  };
  private timeout: number;
  private responseType: string;
  private req_headers: Record<string, string>;
  private fetchInit: RequestInit;
  private interceptor?: () => void;

  /**
   * Constructor for HTTPClientBroFetch.
   * @param opts - Configuration options for the HTTP client.
   */
  constructor(opts?: {
    encodeURI?: boolean;
    timeout?: number;
    responseType?: string;
    retry?: number;
    retryDelay?: number;
    maxRedirects?: number;
    headers?: Record<string, string>;
  });

  /**
   * Sends a single HTTP request using the Fetch API.
   * @param url - The request URL.
   * @param method - HTTP method, e.g., GET, POST, PUT, DELETE, PATCH.
   * @param bodyPayload - Optional body data for POST/PUT requests.
   * @returns A promise that resolves to the response.
   */
  askOnce(url: string, method?: string, bodyPayload?: any): Promise<any>;

  /**
   * Sends an HTTP request using the Fetch API with support for retries and redirections.
   * @param url - The request URL.
   * @param method - HTTP method, e.g., GET, POST, PUT, DELETE, PATCH.
   * @param bodyPayload - Optional body data for POST/PUT requests.
   * @returns A promise that resolves to the response.
   */
  ask(url: string, method?: string, bodyPayload?: any): Promise<any[]>;

  /**
   * Sends a GET or POST request using the Fetch API and parses the response as JSON.
   * @param url - The request URL.
   * @param method - HTTP method, e.g., GET, POST.
   * @param body - Optional body data for POST requests.
   * @returns A promise that resolves to the response in JSON format.
   */
  askJSON(url: string, method?: string, body?: object | string): Promise<any>;

  /**
   * Sends a GET request using the Fetch API to fetch an HTML page.
   * @param url - The URL to fetch.
   * @returns A promise that resolves to the response.
   */
  askHTML(url: string): Promise<any>;

  /**
   * Sends a GET request using the Fetch API to fetch a JavaScript file.
   * @param url - The URL of the JavaScript file.
   * @returns A promise that resolves to the response.
   */
  askJS(url: string): Promise<any>;

  /**
   * Sends a POST request using the Fetch API with FormData as the body.
   * @param url - The request URL.
   * @param formData - The FormData object to send.
   * @returns A promise that resolves to the response.
   */
  sendFormData(url: string, formData: FormData): Promise<any>;

  /**
   * Converts a JavaScript object to FormData using the Fetch API.
   * @param formObj - The object to convert to FormData.
   * @returns The converted FormData object.
   */
  object2formdata(formObj: object): FormData;

  /**
   * Stops the ongoing request immediately.
   */
  kill(): void;

  /**
   * Sets an interceptor function to modify the request before it is sent.
   * @param interceptor - The interceptor function.
   */
  setInterceptor(interceptor: (httpClient: HTTPClientBroFetch) => void): void;

  /**
   * Sets custom request headers.
   * @param headerObj - The headers to set.
   */
  setReqHeaders(headerObj: Record<string, string>): void;

  /**
   * Sets a single request header.
   * @param headerName - The header name.
   * @param headerValue - The header value.
   */
  setReqHeader(headerName: string, headerValue: string): void;

  /**
   * Deletes specific request headers.
   * @param headerNames - The headers to delete.
   */
  delReqHeaders(headerNames: string[]): void;

  /**
   * Gets the current request headers.
   * @returns The current request headers.
   */
  getReqHeaders(): Record<string, string>;

  /**
   * Gets the response headers.
   * @returns The response headers.
   */
  getResHeaders(): Record<string, string>;
}

export { HTTPClientBroFetch };
