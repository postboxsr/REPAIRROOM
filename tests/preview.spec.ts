import {test,expect,type Page} from '@playwright/test';
async function prepare(page:Page,slot?:string){
 await page.goto('http://127.0.0.1:4173/REPAIRROOM/');await page.selectOption('#vehicle','compact');await page.getByRole('button',{name:'Festpreis & Termin finden'}).click();
 await expect(page.locator('.quote h2')).toContainText('129');
 const button=slot?page.getByRole('button',{name:slot,exact:true}):page.locator('.slots button').nth(2);
 await button.click();return (await button.textContent())!;
}
async function confirm(page:Page){await page.getByRole('button',{name:'Auswahl prüfen'}).click();await page.getByRole('button',{name:'Zur Demo-Zahlung'}).click();await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Demo-Zahlung & Testbuchung bestätigen'}).click();await expect(page.getByRole('heading',{level:1})).toHaveText('Testbuchung bestätigt.');}
test('complete browser demo, back navigation, reload and cancellation without backend calls',async({page})=>{
 const apiRequests:string[]=[];page.on('request',r=>{if(r.url().includes('/api/demo'))apiRequests.push(r.url());});
 const slot=await prepare(page);await expect(page.locator('.demo')).toContainText('BROWSER-DEMO');
 await page.getByRole('button',{name:'Auswahl prüfen'}).click();await page.getByRole('button',{name:'Zurück'}).click();await expect(page.locator('.selected')).toHaveText(slot);
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
 for(const route of ['','oelwechsel/','autoglas/','unfallinstandsetzung/','aufbereitung/','kontakt/','impressum/','datenschutz/','station/','buchen/','buchung/']){
  await page.goto('http://127.0.0.1:4173/REPAIRROOM/'+route);await expect(page.getByRole('heading',{level:1})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 }
 await page.goto('http://127.0.0.1:4173/REPAIRROOM/');if(test.info().project.name==='preview-mobile')await expect(page.locator('#vehicle')).toBeInViewport();
 await page.screenshot({path:`test-results-preview/${test.info().project.name}-first-screen.png`});
 await expect.poll(()=>page.locator('header .brand-logo img').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 await page.locator('.workshop img').scrollIntoViewIfNeeded();await expect.poll(()=>page.locator('.workshop img').evaluate(e=>(e as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 expect(await page.locator('.workshop img').getAttribute('src')).toContain('/REPAIRROOM/workshop-concept.png');
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
