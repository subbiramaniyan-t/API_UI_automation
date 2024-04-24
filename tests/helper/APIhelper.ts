import { readFileSync } from 'fs';
import * as path from 'path';

const configFilePath = path.join(__dirname, 'APIconfig.json');
const configData = JSON.parse(readFileSync(configFilePath, 'utf-8'));

const baseUrl = configData.baseUrl;
const tokenEndpoint = configData.tokenEndpoint;
const dashboardEndpoint = configData.dashboardEndpoint;

async function getAuthToken() {
    const request = new Request(`${baseUrl}${tokenEndpoint}`, {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'User-Agent': 'Playwright Test (script)',
        },
        body: new URLSearchParams({
            grant_type: 'password',
            username: configData.username,
            password: configData.password,
        }),
    });

    const response = await fetch(request);
    const data = await response.json();
    return data.access_token;
}

async function getDashboards(token: string) {
    let allDashboards = [];

    let nextPage = `${baseUrl}${dashboardEndpoint}`;
    while (nextPage) {
        const request = new Request(nextPage, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const response = await fetch(request);
        const data = await response.json();

        allDashboards = allDashboards.concat(data.Data);

        const links = data.Links;
        const nextLink = links.find((link: { Rel: string; }) => link.Rel === 'next');
        nextPage = nextLink ? nextLink.Link : null;
    }

    return allDashboards;
}

async function getDashboardWidget(token: string, dashboardId: string) {
  const url = `${baseUrl}${dashboardEndpoint}/${dashboardId}/widgets`;
  const request = new Request(url, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
      }
  });

  try {
      const response = await fetch(request);

      if (!response.ok) {
          throw new Error(`Failed to fetch widgets for dashboard ${dashboardId}. Status: ${response.status} ${response.statusText}`);
      }

      return await response.json();
  } catch (error) {
      console.error('Error fetching dashboard widgets:', error);
      throw error;
  }
}


export { getAuthToken, getDashboards, getDashboardWidget };
