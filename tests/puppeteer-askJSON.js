const puppeteer = require('puppeteer');
const os = require('os');

// get executable path for the browser
const osPlatform = os.platform(); // possible values are: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
let executablePath;
if (/^win/i.test(osPlatform)) {
  executablePath = '';
} else if (/^linux/i.test(osPlatform)) {
  executablePath = '/usr/bin/google-chrome';
}



const main = async () => {
  const pptrOpts = {
    executablePath,
    headless: false,
    devtools: true,  // Open Chrome devtools at the beginning of the test
    dumpio: false,
    slowMo: 130,  // Wait 130 ms each step of execution, for example chars typing

    // list of all args https://peter.sh/experiments/chromium-command-line-switches/
    args: [
      '--disable-dev-shm-usage',
      `--ash-host-window-bounds=1320x1050`,
      `--window-size=1320,1050`,
      `--window-position=700,20`,

      // required for iframe
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  };
  const browser = await puppeteer.launch(pptrOpts);
  const page = await browser.newPage();
  await page.setViewport({ width: 1800, height: 1000 });
  await page.goto('https://www.adsuu.com');

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
    const httpclientBro = new HTTPClientBro(opts);
    const answer = httpclientBro.askJSON('https://jsonplaceholder.typicode.com/todos/1');
    return answer;
  });

  console.log('answer::', answer);
};


main().catch(console.error);

