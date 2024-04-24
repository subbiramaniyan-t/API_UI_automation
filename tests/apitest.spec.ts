import { test, expect } from '@playwright/test';
import { getAuthToken, getDashboards, getDashboardWidget } from './helper/APIhelper';
import * as fs from 'fs';

const responsesDirectory = 'responses';

test('get dashboards and validate total count', async ({ context, page }) => {
  const token = await getAuthToken();
  const results = await getDashboards(token);

  for (const dashboard of results) {
    console.log(dashboard);
  }

  try {
    if (!fs.existsSync(responsesDirectory)) {
      fs.mkdirSync(responsesDirectory);
    }

    const allDashboards = results.map(dashboard => ({
      Name: dashboard.Name,
      EmbedUrl: removeEmbedParameter(dashboard.EmbedUrl),
      Id: dashboard.Id
    }));

    fs.writeFileSync(`${responsesDirectory}/all_dashboards.json`, JSON.stringify(allDashboards));

    const dashboardNames = results.map(dashboard => ({
      Id: dashboard.Id,
      Name: dashboard.Name,
    }));

    fs.writeFileSync(`${responsesDirectory}/dashboard_names.json`, JSON.stringify(dashboardNames));

    const dashboardUrls = results.map(dashboard => removeEmbedParameter(dashboard.EmbedUrl));
    fs.writeFileSync(`${responsesDirectory}/dashboard_urls.json`, JSON.stringify(dashboardUrls));

    console.log('Files successfully saved.');
  } catch (error) {
    console.error('Error while saving files:', error);
  }

  expect(results.length).toBeGreaterThanOrEqual(10);
});

test('open and validate rendering of all dashboards', async ({ context, page }) => {
  const dashboardUrls = JSON.parse(fs.readFileSync(`${responsesDirectory}/dashboard_urls.json`, 'utf-8'));

  for (const url of dashboardUrls) {
    await page.goto(url);

    await loginIfNeeded(page);

    await page.waitForTimeout(3000);
    const title = await page.locator('#dashboard_title');
    await page.waitForTimeout(3000);
    await expect(title).toBeVisible();

    console.log(`Successfully opened and validated rendering of ${url}`);
  }
});

test('get widgets for each dashboard', async ({ context, page }) => {
  const dashboardNames = JSON.parse(fs.readFileSync(`${responsesDirectory}/dashboard_names.json`, 'utf-8'));
  const token = await getAuthToken();

  for (const dashboard of dashboardNames) {
    const widgets = await getDashboardWidget(token, dashboard.Id);
    fs.writeFileSync(`${responsesDirectory}/${dashboard.Name}_widgets.json`, JSON.stringify(widgets));
    console.log(`Widgets for ${dashboard.Name} successfully saved.`);
  }
});

function removeEmbedParameter(url: string): string {
  return url.split('?')[0];
}

async function loginIfNeeded(page) {
  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector('.login-form') === null;
  });

  if (!isLoggedIn) {
    await page.getByLabel('Username / Email Address').click();
    await page.getByLabel('Username / Email Address').fill("devteam");
    await page.getByLabel('Username / Email Address').press('Enter');
    await page.getByLabel('Password').fill("BoldBi@2023");
    await page.getByLabel('Password').press('Enter');
  }
}
