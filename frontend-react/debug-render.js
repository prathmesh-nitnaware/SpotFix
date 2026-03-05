import puppeteer from 'puppeteer';

(async () => {
    console.log("Launching headless browser to debug Admin Dashboard...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Catch console logs
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`PAGE ERROR: ${msg.text()}`);
        }
    });

    page.on('pageerror', error => {
        console.log(`PAGE EXCEPTION: ${error.message}`);
    });

    try {
        console.log("Navigating to http://localhost:5174/admin");
        await page.goto('http://localhost:5174/admin', { waitUntil: 'networkidle0', timeout: 10000 });
        console.log("Navigation complete. If no errors are printed above, check if you need to be logged in.");
    } catch (e) {
        console.log(`Navigation failed: ${e.message}`);
    }

    await browser.close();
})();
