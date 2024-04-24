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

export { getAuthToken, getDashboards }; // Export functions for use in other files
