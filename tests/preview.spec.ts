import {test,expect,type Page} from '@playwright/test';
async function prepare(page:Page,slot?:string){
 await page.goto('http://127.0.0.1:4173/REPAIRROOM/');await page.selectOption('#vehicle','compact');await page.getByRole('button',{name:'Ölwechselpreis berechnen'}).click();
 await expect(page.locator('.quote h2')).toContainText('129');
 await page.locator('.calendar-days button:not(:disabled)').last().click();
 const button=slot?page.getByRole('button',{name:slot,exact:true}):page.locator('.slots button').nth(2);
 await button.click();return (await button.getAttribute('aria-label'))!;
}
async function confirm(page:Page){await page.getByRole('button',{name:'Auswahl prüfen'}).click();await page.getByRole('button',{name:'Zur Demo-Zahlung'}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Demo-Zahlung & Testbuchung bestätigen'}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Testbuchung bestätigt.');}
test('complete browser demo, back navigation, reload and cancellation without backend calls',async({page})=>{
 const apiRequests:string[]=[];page.on('request',r=>{if(r.url().includes('/api/demo'))apiRequests.push(r.url());});
 const slot=await prepare(page);await expect(page.locator('.demo')).toContainText('BROWSER-DEMO');
 await page.getByRole('button',{name:'Auswahl prüfen'}).click();await page.getByRole('button',{name:'Zurück'}).click();await expect(page.locator('.selected')).toHaveAttribute('aria-label',slot);
 await confirm(page);expect(new URL(page.url()).pathname).toMatch(/^\/REPAIRROOM\/buchung\/?$/);
 await page.reload();await expect(page.getByRole('heading',{level:1})).toHaveText('Testbuchung bestätigt.');
 await page.getByRole('button',{name:'Testbuchung stornieren'}).click();await page.getByRole('button',{name:'Stornierung bestätigen'}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Testbuchung storniert.');
 expect(apiRequests).toEqual([]);
});
test('each browser has its own simulated bookings',async({page,browser})=>{
 const other=await browser.newContext();const second=await other.newPage();
 try{const slot=await prepare(page);await confirm(page);await prepare(second,slot);await confirm(second);await page.reload();await expect(page.getByRole('heading',{level:1})).toHaveText('Testbuchung bestätigt.');}
 finally{await other.close();}
});
test('pages, image and styles work under repository subpath',async({page})=>{
 for(const route of ['','oelwechsel/','bremsen/','inspektion/','reifen/','klimaservice/','diagnose/','werkstattservice/','autoglas/','unfallinstandsetzung/','aufbereitung/','kontakt/','impressum/','datenschutz/','station/','buchen/','buchung/']){
  await page.goto('http://127.0.0.1:4173/REPAIRROOM/'+route);await expect(page.getByRole('heading',{level:1})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 }
 await page.goto('http://127.0.0.1:4173/REPAIRROOM/');if(test.info().project.name==='preview-mobile')await expect(page.locator('#vehicle')).toBeInViewport();
 await page.screenshot({path:`test-results-preview/${test.info().project.name}-first-screen.png`});
 await expect.poll(()=>page.locator('header .brand-logo img').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 await expect(page.locator('.workshop-scene')).toBeVisible();
 await expect(page.locator('.motion-page img')).toHaveCount(0);
 expect(await page.locator('.demo').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(37, 39, 36)');
 await page.screenshot({path:`test-results-preview/${test.info().project.name}.png`,fullPage:true});
});
test('management token links remain scoped to this browser',async({page,browser})=>{
 await prepare(page);await confirm(page);const link=page.url();const other=await browser.newContext();
 try{const otherPage=await other.newPage();await otherPage.goto(link);await expect(otherPage.locator('p[role="alert"]')).toContainText(/Browser|gefunden/i);await expect(otherPage.getByRole('heading',{level:1})).toHaveText('Buchung verwalten.');}
 finally{await other.close();}
});
test('static deployment contains no booking API or development credential files',async({request})=>{
 for(const url of ['api/demo','api/demo/','.postgres/local.json','.env.local','.env','.git/config','../../package.json'])expect((await request.get('http://127.0.0.1:4173/REPAIRROOM/'+url)).status()).toBe(404);
});
test('pending reservation resumes after reload and backing out releases the window',async({page})=>{
 const slot=await prepare(page);await page.getByRole('button',{name:'Auswahl prüfen'}).click();await page.getByRole('button',{name:'Zur Demo-Zahlung'}).click();
 await expect(page.getByTestId('hold-countdown')).toHaveText(/\d+:\d{2}/);const token=await page.evaluate(()=>localStorage.getItem('rr-preview-checkout'));expect(token).toBeTruthy();
 await page.reload();await expect(page.getByRole('heading',{name:'Online bezahlen – simuliert.'})).toBeVisible();await expect(page.locator('dd').filter({hasText:slot})).toBeVisible();
 expect(await page.evaluate(()=>localStorage.getItem('rr-preview-checkout'))).toBe(token);
 await page.getByRole('button',{name:'Zurück'}).click();await page.getByRole('button',{name:'Zurück'}).click();await expect(page.getByRole('button',{name:slot,exact:true})).toBeVisible();expect(await page.evaluate(()=>localStorage.getItem('rr-preview-checkout'))).toBeNull();
});
test('expired browser reservation cannot be paid and a new window can be selected',async({page})=>{
 await prepare(page);await page.getByRole('button',{name:'Auswahl prüfen'}).click();await page.getByRole('button',{name:'Zur Demo-Zahlung'}).click();
 await expect(page.getByTestId('hold-countdown')).toBeVisible();
 await page.evaluate(()=>{const state=JSON.parse(localStorage.getItem('repairroom-browser-demo-v1')!);const token=localStorage.getItem('rr-preview-checkout');state.bookings.find((b:{token:string})=>b.token===token).expires=new Date(Date.now()-1000).toISOString();localStorage.setItem('repairroom-browser-demo-v1',JSON.stringify(state));});
 await page.reload();await expect(page.getByText('Reservierungsfrist abgelaufen.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Demo-Zahlung & Testbuchung bestätigen'})).toHaveCount(0);
 await page.getByRole('button',{name:'Neues Zeitfenster wählen'}).click();await expect(page.locator('#car')).toHaveValue('compact');await expect(page.locator('.slots button').first()).toBeVisible();
});

test('calendar switches available days and clears stale time selection',async({page})=>{
 await prepare(page);await expect(page.locator('.selected')).toHaveCount(1);
 const days=page.locator('.calendar-days button:not(:disabled)');await days.nth(1).click();
 await expect(page.locator('.selected')).toHaveCount(0);await expect(page.getByRole('button',{name:'Auswahl prüfen'})).toBeDisabled();
 await expect(page.locator('.slots button').first()).toBeVisible();await page.locator('.slots button').first().click();
 await expect(page.getByRole('button',{name:'Auswahl prüfen'})).toBeEnabled();
 await page.getByRole('button',{name:'Auswahl prüfen'}).click();await page.getByRole('button',{name:'Zurück'}).click();
 await expect(page.locator('.selected')).toHaveCount(1);
 await page.screenshot({path:`test-results-preview/calendar-${test.info().project.name}.png`,fullPage:true});
});

test('relaunch has an immediately visible booking entry and working service cards',async({page})=>{
 await page.goto('http://127.0.0.1:4173/REPAIRROOM/');
 await expect(page.getByRole('heading',{level:1})).toContainText('FAST SERVICE.');
 const cta=page.getByRole('button',{name:'Ölwechselpreis berechnen'});await expect(cta).toBeVisible();
 const bounds=await cta.boundingBox();expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
 await expect(page.locator('.service-card')).toHaveCount(9);
 for(const route of ['bremsen','inspektion','reifen','klimaservice','diagnose']){
  await page.locator(`.service-card[href$="/${route}/"]`).click();await expect(page.getByRole('heading',{level:1})).toBeVisible();await expect(page.locator('.eyebrow').first()).toContainText('ANGEBOT IN PLANUNG');await page.goBack();
 }
 await page.getByText('Welche Zahlungsmethoden sind geplant?',{exact:true}).click();
 await expect(page.getByText('Apple Pay, Kreditkarte und eine geeignete Bankdirektzahlung',{exact:false})).toBeVisible();
 await page.evaluate(()=>{for(const animation of document.getAnimations()){animation.currentTime=4000;animation.pause();}});
 await page.screenshot({path:`test-results-preview/relaunch-home-${test.info().project.name}.png`,fullPage:true});
 await page.locator('.motion-hero').screenshot({path:`test-results-preview/motion-hero-${test.info().project.name}.png`});
 await page.locator('.service-cards').screenshot({path:`test-results-preview/service-scenes-${test.info().project.name}.png`});
 await page.locator('.booking-journey').screenshot({path:`test-results-preview/booking-scenes-${test.info().project.name}.png`});
});

test('hero animation can be paused without changing the booking form',async({page})=>{
 await page.goto('http://127.0.0.1:4173/REPAIRROOM/');
 const toggle=page.getByRole('button',{name:'Animation pausieren'});await toggle.scrollIntoViewIfNeeded();
 await expect(page.locator('.motion-frame')).toHaveAttribute('data-paused','false');
 await expect(page.locator('.scene-car')).toHaveCSS('animation-play-state','running');
 await toggle.click();await expect(page.getByRole('button',{name:'Animation abspielen'})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.scene-car')).toHaveCSS('animation-play-state','paused');
 await page.getByRole('button',{name:'Animation abspielen'}).click();await expect(page.locator('.scene-car')).toHaveCSS('animation-play-state','running');
 await page.selectOption('#vehicle','sport');await page.getByRole('button',{name:'Ölwechselpreis berechnen'}).click();await expect(page.locator('.quote h2')).toContainText('189');
});
test('reduced motion shows a complete static scene and keeps booking usable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173/REPAIRROOM/');
 await expect(page.locator('.workshop-scene')).toBeVisible();await expect(page.locator('.scene-car')).toHaveCSS('animation-name','none');
 await expect(page.locator('.car-lift')).toHaveCSS('transform','none');await expect(page.locator('.scene-service')).toHaveCSS('opacity','1');
 await expect(page.locator('.motion-toggle')).toBeHidden();await expect(page.locator('.booking-journey>li')).toHaveCount(4);
 await page.selectOption('#vehicle','compact');await page.getByRole('button',{name:'Ölwechselpreis berechnen'}).click();await expect(page.locator('.quote h2')).toContainText('129');
});

test('keyboard users can pause the scene and follow the first service action',async({page})=>{
 await page.goto('http://127.0.0.1:4173/REPAIRROOM/');
 const pause=page.getByRole('button',{name:'Animation pausieren'});await pause.focus();
 await page.keyboard.press('Space');await expect(page.getByRole('button',{name:'Animation abspielen'})).toBeFocused();
 await expect(page.locator('.scene-car')).toHaveCSS('animation-play-state','paused');
 await page.keyboard.press('Space');await expect(page.locator('.scene-car')).toHaveCSS('animation-play-state','running');
 await page.locator('.oil-feature a').focus();await page.keyboard.press('Tab');
 const oil=page.locator('.service-card').first();await expect(oil).toBeFocused();
 await expect(oil.locator('.service-oil-flow')).toHaveCSS('animation-name','rr-detail-oil');
 await page.emulateMedia({reducedMotion:'reduce'});await expect(oil.locator('.service-oil-flow')).toHaveCSS('animation-name','none');
 await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/oelwechsel\/$/);
});
test('hero automatically pauses outside the viewport and resumes when visible',async({page})=>{
 await page.goto('http://127.0.0.1:4173/REPAIRROOM/');await page.locator('.motion-frame').scrollIntoViewIfNeeded();
 await expect(page.locator('.motion-frame')).toHaveAttribute('data-paused','false');
 await page.locator('footer').scrollIntoViewIfNeeded();await expect(page.locator('.motion-frame')).toHaveAttribute('data-paused','true');
 await page.locator('.motion-frame').scrollIntoViewIfNeeded();await expect(page.locator('.motion-frame')).toHaveAttribute('data-paused','false');
});
test('additional phone and tablet widths keep the homepage and calendar usable',async({page})=>{
 const sizes=test.info().project.name==='preview-mobile'?[{width:320,height:740},{width:375,height:812},{width:414,height:896}]:[{width:768,height:1024},{width:1440,height:900}];
 for(const size of sizes){
  await page.setViewportSize(size);await page.goto('http://127.0.0.1:4173/REPAIRROOM/');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.getByRole('button',{name:'Ölwechselpreis berechnen'})).toBeVisible();
  await expect(page.locator('.booking-journey')).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.screenshot({path:`test-results-preview/motion-width-${size.width}.png`});
  await page.selectOption('#vehicle','compact');await page.getByRole('button',{name:'Ölwechselpreis berechnen'}).click();
  await expect(page.locator('.slots button').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('illustrated service details link to the genuine next action',async({page})=>{
 await page.goto('http://127.0.0.1:4173/REPAIRROOM/autoglas/');
 await expect(page.locator('.service-detail-art')).toBeVisible();
 await expect(page.getByText('Es werden derzeit keine Anfragen versendet.',{exact:false})).toBeVisible();
 await page.screenshot({path:`test-results-preview/autoglas-detail-${test.info().project.name}.png`,fullPage:true});
 await page.getByRole('link',{name:'Weitere Leistungen ansehen'}).click();await expect(page).toHaveURL(/\/REPAIRROOM\/#leistungen$/);
 await page.locator('.service-card').first().click();await page.getByRole('link',{name:'Ölwechsel-Demo starten'}).click();
 await expect(page.locator('#car')).toBeVisible();await expect(page.locator('.progress')).toContainText('Demo-Zahlung');
});
