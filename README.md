# @mikosoft/httpclient-bro
> HTTP client for browser environment.

The API is simmilar as [@mikosoft/httpclient-bro](https://www.npmjs.com/package/@mikosoft/httpclient-bro).


## Installation
```bash
$ npm install --save @mikosoft/httpclient-bro
```

## Development
Before you make any changes run ```npm run dev``` to build the library by the webpack.




## Access by "window" global object
The library can be utilized by accessing its functions and features through the window global object in a web browser environment.
- *window.mikosoft.HTTPClientBro*

```
HTML
<script src="node_modules/httpclient-bro/build/httpclient-bro.js">
or
<script src="node_modules/httpclient-bro/build/httpclient-bro.min.js">

JS
const { HTTPClientBro } = window.mikosoft;
const httpClientBro = new HTTPClientBro(opts);
const answer = httpClientBro.askOnce('http://www.adsuu.com');
```

#### Example
A puppeteer example.

```js
/*** NodeJS script ***/
// inject to Chromium browser via <script> tag
 await page.addScriptTag({ path: '../build/httpclient-bro.min.js' });

 const answer = await page.evaluate(() => {
    // cookies
    const HTTPClientBro = window.mikosoft.HTTPClientBro;
    const opts = {
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
    const httpClientBro = new HTTPClientBro(opts);
    const answer = httpclientBro.askJSON('https://jsonplaceholder.typicode.com/todos/1');
    return answer;
});

console.log('answer::', answer);
```


## Access by ESM (ECMAScript Modules)
```js
import { HTTPClientBro } from '@mikosoft/httpclient-bro';

const httpClientBro = new HTTPClientBro(cookieOpts);
```


## API

#### constructor(opts:{encodeURI:boolean, timeout:number, retry:number, retryDelay:number, maxRedirects:number, headers:object})
- **encodeURI**	Encode URI before request is sent.	(false)
- **timeout**	Close socket on certain period of time in milliseconds. Same as timeout in NodeJS HTTP library.	(8000)
- **retry**	When HTTP Client receives an error response it will try to send requests repeatedly. The retry number determines the max allowed retries.	(3)
- **retryDelay**	Time delay after each retry in milliseconds.	(5500)
- **maxRedirects**	When HTTP Client receives 301 in Header response it will try to send new request to redirected URL. Number maxRedirects determines max redirects allowed to prevent infinite loops.	(3)
- **headers**	Definition of HTTP Headers used in HTTP request.	(see below)

```js
headers::
{
  'authorization': '',
  'user-agent': `DEX8-CLI/${pkg_json.version} https://dex8.com`, // 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
  'accept': '*/*', // 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
  'cache-control': 'no-cache',
  'host': '',
  'accept-encoding': 'gzip',
  'connection': 'close', // keep-alive
  'content-type': 'text/html; charset=UTF-8'
}
```


#### *async* askOnce(url, method = 'GET', body_obj)
Send one time HTTP/HTTPS request. Redirection is not handled. Response is a Promise so async/await can be used.
*httpclientBro.askOnce('https://www.dummy-api.com/create', 'POST', {first_name: 'Saša'});*


#### *async* ask(url, method = 'GET', body_obj)
Sends HTTP/HTTPS request to HTTP server. Redirection is handled maxRedirects times. Response is an array of resolved responses for every redirection stage. If there's no redirects then this array will contain only one response.
*httpclientBro.ask('www.yahoo.com');*

```
answers:
-----------------------------
[
  {
    requestURL: 'http://bing.com',
    requestMethod: 'GET',
    status: 301,
    statusMessage: 'Moved Permanently',
    httpVersion: '1.1',
    gzip: false,
    https: false,
    req: {
      headers: {
        authorization: '',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        accept: '*/*',
        'cache-control': 'no-cache',
        host: '',
        'accept-encoding': 'gzip',
        connection: 'close',
        'content-type': 'text/html; charset=UTF-8'
      },
      payload: undefined
    },
    res: {
      headers: {
        location: 'http://www.bing.com/',
        server: 'Microsoft-IIS/10.0',
        'x-msedge-ref': 'Ref A: BDA43350AD8448E0BF90BD7557179CC9 Ref B: ZAG30EDGE0120 Ref C: 2020-03-06T11:28:13Z',
        'set-cookie': [Array],
        date: 'Fri, 06 Mar 2020 11:28:13 GMT',
        connection: 'close',
        'content-length': '0'
      },
      content: ''
    }
  },
  {
    requestURL: 'http://www.bing.com/',
    requestMethod: 'GET',
    status: 302,
    statusMessage: '',
    httpVersion: '1.1',
    gzip: true,
    https: false,
    req: {
      headers: {
        authorization: '',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        accept: '*/*',
        'cache-control': 'no-cache',
        host: '',
        'accept-encoding': 'gzip',
        connection: 'close',
        'content-type': 'text/html; charset=UTF-8'
      },
      payload: undefined
    },
    res: {
      headers: {
        'cache-control': 'private',
        'content-length': '179',
        'content-type': 'text/html; charset=utf-8',
        'content-encoding': 'gzip',
        location: 'https://www.bing.com:443/?toHttps=1&redig=D1B8D19DDBFC4CD8A6B9FA690AD3919B',
        vary: 'Accept-Encoding',
        'x-msedge-ref': 'Ref A: 41FC9D16CE464F90A17D18B339B3A0A4 Ref B: ZAG30EDGE0116 Ref C: 2020-03-06T11:28:13Z',
        'set-cookie': [Array],
        date: 'Fri, 06 Mar 2020 11:28:13 GMT',
        connection: 'close'
      },
      content: '\r\n' +
        'Object moved to here.\r\n' +
        '\r\n'
    }
  },
  {
    requestURL: 'https://www.bing.com:443/?toHttps=1&redig=D1B8D19DDBFC4CD8A6B9FA690AD3919B',
    requestMethod: 'GET',
    status: 200,
    statusMessage: 'OK',
    httpVersion: '1.1',
    gzip: true,
    https: true,
    req: {
      headers: {
        authorization: '',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
        accept: '*/*',
        'cache-control': 'no-cache',
        host: '',
        'accept-encoding': 'gzip',
        connection: 'close',
        'content-type': 'text/html; charset=UTF-8'
      },
      payload: undefined
    },
    res: {
      headers: {
        'cache-control': 'private',
        'transfer-encoding': 'chunked',
        'content-type': 'text/html; charset=utf-8',
        'content-encoding': 'gzip',
        vary: 'Accept-Encoding',
        p3p: 'CP="NON UNI COM NAV STA LOC CURa DEVa PSAa PSDa OUR IND"',
        'set-cookie': [Array],
        'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
        'x-msedge-ref': 'Ref A: 7F6C67E1D8364C0DA87DE69A2455A213 Ref B: ZAG30EDGE0220 Ref C: 2020-03-06T11:28:14Z',
        date: 'Fri, 06 Mar 2020 11:28:13 GMT',
        connection: 'close'
      },
      content: ' ... '
    }
  }
]
```


#### *async* askJSON(url, method = 'GET', body)
Send HTTP/HTTPS request to API with JSON response. Redirection is not handled because we suppose that APIs are not using redirections.
Parameter body can be either string or object type.
As HTTP Client receives responses as string it will be automatically converted into object.
*httpclientBro.askJSON('http://dummy.restapiexample.com/api/v1/employees');*

```
JSON answer:
----------------------------------------
{
  requestURL: 'https://jsonplaceholder.typicode.com/todos/1',
  requestMethod: 'GET',
  status: 200,
  statusMessage: '',
  https: true,
  req: {
    headers: {
      authorization: '',
      accept: 'application/json',
      'content-type': 'application/json; charset=utf-8'
    }
  },
  res: {
    headers: {
      'access-control-allow-credentials': 'true',
      age: '17860',
      'alt-svc': 'h3="',
      'cache-control': 'max-age=43200',
      'cf-cache-status': 'HIT',
      'cf-ray': '7f616a214ac3c273-VIE',
      'content-encoding': 'br',
      'content-type': 'application/json; charset=utf-8',
      date: 'Sun, 13 Aug 2023 13',
      etag: 'W/"53-hfEnumeNh6YirfjyjaujcOPPT+s"',
      expires: '-1',
      nel: '{"success_fraction"',
      pragma: 'no-cache',
      'report-to': '{"endpoints"',
      server: 'cloudflare',
      vary: 'Origin, Accept-Encoding',
      via: '1.1 vegur',
      'x-content-type-options': 'nosniff',
      'x-powered-by': 'Express',
      'x-ratelimit-limit': '1000',
      'x-ratelimit-remaining': '999',
      'x-ratelimit-reset': '1686761608'
    },
    content: { userId: 1, id: 1, title: 'delectus aut autem', completed: false }
  },
  time: {
    req: '2023-08-13T13:48:14.776Z',
    res: '2023-08-13T13:48:14.948Z',
    duration: 0.172
  }
}

```


#### *async* askHTML(url)
Get the HTML file content.

#### *async* askJS(url)
Get the content of the Javascript file.


#### *async* sendFormData(url, formData)
Send POST request where body is new FormData() object.
For example (frontend code):
```js
// create form data
const formData = new FormData();
formData.append('db_id', db_id);
formData.append('coll_name', coll_name);
formData.append('csv_file', csv_file);
```


#### object2formdata(formObj)
Convert JS Object to FormData and prepare it for sendFormData()


#### kill()
Stop the sent request immediatelly.


#### setInterceptor(interceptor)
Set the interceptor function which will be executed every time before the HTTP request is sent.
*interceptor:Function* - callback function, for example (httpClient) => { httpClient.setReqHeader('Authorization', 'JWT aswas); }



#### setReqHeaders(headerObj)
Change request header object. The headerObj will be appended to previously defined this.req_headers and headers with the same name will be overwritten.
*headerObj:object* - {'authorization', 'user-agent', accept, 'cache-control', 'host', 'accept-encoding', 'connection'}
*httpclientBro.setHeaders({authorization: 'myToken, 'content-type': 'application/json; charset=utf-8', accept: 'application/json'});*

#### setReqHeader(headerName, headerValue)
Change only one request header. Previously defined header will be overwritten.
*headerName* - header field name
*headerValue* - header field value
*httpclientBro.setHeader('authorization', 'myToken);*

#### delReqHeaders(headerNames)
Delete the request headers.
*headerNames* - array of header names ['content-type', 'accept']
*httpclientBro.delHeaders(['content-type', 'accept']);*

#### getReqHeaders()
Get the current request headers.

#### getResHeaders()
Get the current response headers.


### License
The software licensed under [MIT](LICENSE).
