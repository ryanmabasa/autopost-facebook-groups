const puppeteer = require('puppeteer-core');
const fs = require('fs');

const credentials = {
    username: 'test',
    password: 'test',
    url: {
        group: 'https://www.facebook.com/groups',
        login: 'https://www.facebook.com/login'
    }
};

const browserOptions = {
    headless: false,
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ignoreDefaultArgs: true,
    args: ['--disable-notifications','--no-sandbox']
};

const text = fs.readFileSync('post.txt','utf8');

(async () => {
    
        const browser = await puppeteer.launch(browserOptions);
        const page = await browser.newPage();

        //Enable console 
        page.on('console', msg => {
            for (let i = 0; i < msg.args.length; ++i)
                console.log(`${i}: ${msg.args[i]}`);
        });

        //Login
        console.log('Login...');
        await page.goto(credentials.url.login);

        const emailField = await page.$('input[name=email]');
        await emailField.click();
        await emailField.type(credentials.username);
        await emailField.dispose();
        const passwordField = await page.$('input[name=pass]');
        await passwordField.click();
        await passwordField.type(credentials.password);
        await passwordField.dispose();
        const loginButton = await page.$('button[name=login]');
        await loginButton.focus();
        await loginButton.click();
        await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });
        await page.goto(credentials.url.group);


        // Auto Scroll
        console.log('Auto Scrolling...');
        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });

        // Group List
        console.log('Adding Group Id...');
        await page.waitForSelector('div._4-jm');

        let arr = await page.evaluate(() => {
            let urlArr = [];

            let groupListNode = document.querySelectorAll('div._4-jm');

            for (var i = 0; i < 3; i++) {
                groupListNode[i].id = "grp" + i;
            }

            for (var i = 0; i < 3; i++) {
                console.log("Getting urls... ")
                let href = document.querySelector('#grp' + i + ' div._4-jy  div._4-jk div._266w a').href;
                urlArr.push({ "url": href });
            }

            return urlArr;

        });

        console.log('Auto Posting...');
        for (var i = 0; i < arr.length; i++) {
            await page.goto("" + arr[i].url);
            // console.log('Auto Posting in' + arr[i].url);
            await page.waitFor(8000);
            if (await page.$('textarea._4h98.navigationFocus') !== null) {
                let tf = await page.$('textarea._4h98.navigationFocus');
                await tf.click();
                await tf.type(text);
                await page.waitFor(10000);
                // let postBtn = await page.$('button._1mf7._4jy0._4jy3._4jy1._51sy.selected._42ft');
                page.click('button._1mf7._4jy0._4jy3._4jy1._51sy.selected._42ft');
                await page.waitFor(50000);
               
            }
           
        }

  

        console.log('Closing Browser...');
        await page.waitFor(6000);
        await browser.close();
    
})();







