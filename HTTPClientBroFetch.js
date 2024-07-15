class HTTPClientBroFetch {
  /**
   * Opts {
   *  encodeURI:boolean,
   *  timeout:number,
   *  responseType: ''|'text'|'blob', // 'blob' for file download (https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType)
   *  retry:number,
   *  retryDelay:number,
   *  maxRedirects:number,
   *  headers:object
   * }
   * @param {Object} opts - HTTP Client options {encodeURI, timeout, responseType, retry, retryDelay, maxRedirects, headers}
   */
  constructor(opts) {
    this.url;
    this.protocol = 'http:';
    this.hostname = '';
    this.port = 80;
    this.pathname = '/';
    this.queryString = '';

    this.opts = opts || {
      encodeURI: false,
      timeout: 8000,
      responseType: '', // 'blob' for file download (https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType)
      retry: 3,
      retryDelay: 5500,
      maxRedirects: 3,
      headers: {
        authorization: '',
        accept: '*/*' // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
      }
    };

    this.timeout = this.opts.timeout;
    this.responseType = this.opts.responseType;
    this.req_headers = { ...this.opts.headers };
    this.interceptor = null;
  }

  /********** REQUESTS *********/

  /**
   * Sending one HTTP request to HTTP server.
   *  - 301 redirections are not handled.
   *  - retries are not handled
   * @param {string} url - https://www.example.com/something?q=15
   * @param {string} method - GET, POST, PUT, DELETE, PATCH
   * @param {any} bodyPayload - http body payload
   * @returns {Promise<answer>}
   */
  async askOnce(url, method = 'GET', bodyPayload) {
    const answer = {
      requestURL: url,
      requestMethod: method,
      status: 0,
      statusMessage: '',
      https: false,
      req: {
        headers: this.req_headers,
        payload: undefined
      },
      res: {
        headers: undefined,
        content: undefined
      },
      time: {
        req: this._getTime(),
        res: undefined,
        duration: undefined
      }
    };

    try {
      url = this._parseUrl(url);
      answer.requestURL = url;
      answer.https = /^https/.test(this.protocol);
    } catch (err) {
      const ans = { ...answer };
      ans.status = 400;
      ans.statusMessage = err.message || 'Bad Request';
      ans.time.res = this._getTime();
      ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);
      return ans;
    }

    if (this.interceptor) await this.interceptor();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestOptions = {
      method,
      headers: this.req_headers,
      signal: controller.signal,
      ...(bodyPayload && !/GET/i.test(method) && {
        body: /application\/json/.test(this.req_headers['content-type'])
          ? JSON.stringify(bodyPayload)
          : bodyPayload
      })
    };

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      answer.status = response.status;
      answer.statusMessage = response.statusText;
      answer.res.headers = this._parseHeaders(response.headers);
      answer.res.content = await response[this.responseType || 'text']();
      answer.time.res = this._getTime();
      answer.time.duration = this._getTimeDiff(answer.time.req, answer.time.res);

      return answer;
    } catch (error) {
      console.log('ERRRRR:', error);
      clearTimeout(timeoutId);

      const ans = { ...answer };
      ans.status = error.name === 'AbortError' ? 408 : 400;
      ans.statusMessage = error.message;
      ans.time.res = this._getTime();
      ans.time.duration = this._getTimeDiff(ans.time.req, ans.time.res);

      return ans;
    }
  }

  /**
   * Sending HTTP request to HTTP server.
   *  - 301 redirections are handled.
   *  - retries are handled
   * @param {String} url - https://www.example.com/contact
   * @param {String} method - GET, POST, PUT, DELETE, PATCH
   * @param {Object} bodyPayload - http body
   * @returns {Promise<answer>}
   */
  async ask(url, method = 'GET', bodyPayload) {
    let answer = await this.askOnce(url, method, bodyPayload);
    const answers = [answer];

    let redirectCounter = 1;
    while (!!answer && /^3\d{2}/.test(answer.status) && redirectCounter <= this.opts.maxRedirects) {
      const url_new = new URL(url, answer.res.headers.location);
      answer = await this.askOnce(url_new, method, bodyPayload);
      answers.push(answer);
      redirectCounter++;
    }

    let retryCounter = 1;
    while (answer.status === 408 && retryCounter <= this.opts.retry) {
      await new Promise(resolve => setTimeout(resolve, this.opts.retryDelay));
      answer = await this.askOnce(url, method, bodyPayload);
      answers.push(answer);
      retryCounter++;
    }

    return answers;
  }

  /**
   * Fetch the JSON. Redirections and retries are not handled.
   * @param {string} url - https://api.example.com/someurl
   * @param {string} method - GET, POST, PUT, DELETE, PATCH
   * @param {object|string} body - http body as Object or String JSON type
   * @returns {Promise<answer>}
   */
  async askJSON(url, method = 'GET', body) {
    let bodyPayload = body;
    if (!!body && typeof body === 'string') {
      try {
        bodyPayload = JSON.parse(body);
      } catch (err) {
        throw new Error('Body string is not valid JSON.');
      }
    }

    this.setReqHeaders({
      'accept': 'application/json',
      'content-type': 'application/json; charset=utf-8'
    });

    const answer = await this.askOnce(url, method, bodyPayload);
    if (!!answer.res.content) {
      try {
        answer.res.content = JSON.parse(answer.res.content);
      } catch (err) {
        throw new Error('Response content is not valid JSON.');
      }
    }

    return answer;
  }

  /**
   * Get the HTML file content.
   * @param {string} url - http://example.com/page.html
   * @returns {Promise<answer>}
   */
  async askHTML(url) {
    this.setReqHeaders({
      'accept': 'text/html',
      'content-type': 'text/html'
    });
    const answer = await this.askOnce(url, 'GET');
    return answer;
  }

  /**
   * Get the content of the Javascript file.
   * @param {string} url - https://api.example.com/some.js
   * @returns {Promise<answer>}
   */
  async askJS(url) {
    this.setReqHeaders({
      'accept': 'application/javascript',
      'content-type': 'application/javascript; charset=utf-8'
    });
    const answer = await this.askOnce(url, 'GET');
    return answer;
  }

  /**
   * Send POST request where body is new FormData() object.
   * @param {string} url - https://api.example.com/someurl
   * @param {FormData} formData - the FormData instance
   * @returns {Promise<answer>}
   */
  async sendFormData(url, formData) {
    this.setReqHeaders({
      'accept': '*/*'
    });
    this.delReqHeaders(['content-type']);
    const answer = await this.askOnce(url, 'POST', formData);

    if (!!answer.res.content) {
      try {
        answer.res.content = JSON.parse(answer.res.content);
      } catch (err) {
        console.log('WARNING: Response content is not JSON.');
      }
    }

    return answer;
  }

  /**
   * Convert JS Object to FormData and prepare it for sendFormData()
   * @param {object} formObj - object which needs to be converted to FormData
   * @returns {FormData}
   */
  object2formdata(formObj) {
    const formData = new FormData();
    for (const [key, val] of Object.entries(formObj)) { formData.set(key, val); }
    return formData;
  }

  /**
   * Stop the sent request immediately.
   * @returns {void}
   */
  kill() {
    // The fetch API doesn't have an equivalent of `abort` for an already completed request.
    // This method is a no-op for now.
  }

  /**
   * Set the interceptor function which will be executed every time before the HTTP request is sent.
   * @param {Function} interceptor - callback function
   * @returns {void}
   */
  setInterceptor(interceptor) {
    this.interceptor = interceptor.bind(this);
  }

  /********** HEADERS **********/

  /**
   * Set HTTP request header(s).
   * @param {object} headerObj - e.g. {Authorization:'Bearer token', Accept:'application/json'}
   * @returns {void}
   */
  setReqHeaders(headerObj) {
    for (const [key, val] of Object.entries(headerObj)) {
      this.req_headers[key.toLowerCase()] = val;
    }
  }

  /**
   * Delete header by key.
   * @param {string[]} headerArr - the array of keys
   * @returns {void}
   */
  delReqHeaders(headerArr) {
    for (const key of headerArr) {
      delete this.req_headers[key.toLowerCase()];
    }
  }

  /********** UTILS **********/

  /**
   * Parse the URL and update the class instance properties.
   * @param {string} url - the URL to parse
   * @returns {string} - formatted URL
   */
  _parseUrl(url) {
    const parsedURL = new URL(url);

    this.protocol = parsedURL.protocol;
    this.hostname = parsedURL.hostname;
    this.port = parsedURL.port || (parsedURL.protocol === 'https:' ? 443 : 80);
    this.pathname = parsedURL.pathname;
    this.queryString = parsedURL.search;

    if (!!this.opts.encodeURI) {
      url = encodeURI(url);
    }

    return url;
  }

  /**
   * Get the current time in milliseconds.
   * @returns {number}
   */
  _getTime() {
    return Date.now();
  }

  /**
   * Get the duration between two time points in milliseconds.
   * @param {number} t1 - start time
   * @param {number} t2 - end time
   * @returns {number}
   */
  _getTimeDiff(t1, t2) {
    return t2 - t1;
  }

  /**
   * Parse the headers from the Fetch response.
   * @param {Headers} headers - the Headers object from Fetch response
   * @returns {object} - headers as a plain object
   */
  _parseHeaders(headers) {
    const headersObj = {};
    headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    return headersObj;
  }
}


// ESM
export default HTTPClientBroFetch;

// window
if (typeof window !== 'undefined') {
  if (!window.mikosoft) { window.mikosoft = {}; }
  window.mikosoft.HTTPClientBroFetch = HTTPClientBroFetch;
}
