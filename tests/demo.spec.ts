import {test,expect} from '@playwright/test';
test('guest booking, back navigation, simulated payment and cancellation',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{level:1})).toContainText('Dein Ölwechsel.');
 await page.selectOption('#vehicle','touring');await page.getByRole('button',{name:'Festpreis & Termin finden'}).click();
 await expect(page.locator('#car')).toHaveValue('touring');await expect(page.locator('.quote h2')).toContainText('159');
 await page.locator('.slots button').first().click();const slot=await page.locator('.selected').textContent();
 await page.getByRole('button',{name:'Auswahl prüfen'}).click();await page.getByRole('button',{name:'Zurück'}).click();
 await expect(page.locator('.selected')).toHaveText(slot!);await expect(page.locator('#car')).toHaveValue('touring');
 await page.getByRole('button',{name:'Auswahl prüfen'}).click();await page.getByRole('button',{name:'Zur Demo-Zahlung'}).click();
 await expect(page.getByRole('button',{name:'Demo-Zahlung & Testbuchung bestätigen'})).toBeDisabled();
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Demo-Zahlung & Testbuchung bestätigen'}).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('Testbuchung bestätigt.');
 await page.reload();await expect(page.getByRole('heading',{level:1})).toHaveText('Testbuchung bestätigt.');
 await page.getByRole('button',{name:'Testbuchung stornieren'}).click();await page.getByRole('button',{name:'Stornierung bestätigen'}).click();
 await expect(page.getByRole('heading',{level:1})).toHaveText('Testbuchung storniert.');
});
test('server owns price, rejects unsupported vehicles and concurrent duplicate booking',async({request})=>{
 const catalog=await (await request.get('/api/demo')).json();
 const foreign=await request.post('/api/demo',{headers:{origin:'https://foreign.example'},data:{action:'quote',vehicle:'compact'}});expect(foreign.status()).toBe(403);
 const invalid=await request.post('/api/demo',{data:{action:'quote',vehicle:'unlicensed-real-car'}});expect(invalid.status()).toBe(400);
 const data={action:'book',vehicle:'compact',slot:catalog.slots[0],price:1};
 const responses=await Promise.all([request.post('/api/demo',{data}),request.post('/api/demo',{data})]);
 expect(responses.map(r=>r.status()).sort()).toEqual([200,400]);
 const booked=await responses.find(r=>r.status()===200)!.json();expect(booked.price).toBe(12900);expect(booked.payment).toBe('simulated');
 expect((await request.get('/api/demo?token=../../etc/passwd')).status()).toBe(400);
 await request.post('/api/demo',{data:{action:'cancel',token:booked.token}});
 const after=await (await request.get('/api/demo')).json();expect(after.slots).toContain(data.slot);
});
test('all service and legal pages render, no horizontal overflow',async({page})=>{
 for(const route of ['/','/oelwechsel','/autoglas','/unfallinstandsetzung','/aufbereitung','/kontakt','/impressum','/datenschutz','/station','/buchen','/buchung']){
 await page.goto(route);await expect(page.getByRole('heading',{level:1})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 }
 await page.goto('/');await page.getByText('Brauche ich ein Kundenkonto?',{exact:true}).click();await expect(page.getByText('Nein. Der geplante Ablauf ist eine Gastbuchung.',{exact:false})).toBeVisible();
 await page.locator('.workshop img').scrollIntoViewIfNeeded();await expect.poll(()=>page.locator('.workshop img').evaluate((el)=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 await page.screenshot({path:`test-results/home-${test.info().project.name}.png`,fullPage:true});
});
