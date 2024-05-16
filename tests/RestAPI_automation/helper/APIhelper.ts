import { readFileSync } from 'fs';
import * as path from 'path';

const configFilePath = path.join(__dirname, 'APIconfig.json');

async function getConfigData() {
  try {
    const data = JSON.parse(readFileSync(configFilePath, 'utf-8'));
    return data;
  } catch (error) {
    console.error('Error reading API configuration:', error);
    throw error;
  }
}

async function getAuthToken() {
  const configData = await getConfigData();

  const request = new Request(`${configData.baseUrl}${configData.mid}${configData.siteIdentifier}${configData.tokenEndpoint}`, {
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

  try {
    const response = await fetch(request);

    if (!response.ok) {
      throw new Error(`Error fetching access token: failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw error;
  }
}

async function makeAPIRequest(
  method: string,
  endpoint: string,
  payload?: any,
) {
  const accessToken = await getAuthToken();
  const configData = await getConfigData();

  const url = `${configData.baseUrl}${configData.mid}${configData.siteIdentifier}${endpoint}`;

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'Content-Type': payload ? 'application/json' : undefined,
  };

  const request = new Request(url, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  try {
    const response = await fetch(request);

    return await response.json();
  } catch (error) {
    console.error('Error making API request:', error);
    throw error;
  }
}

export { getAuthToken, makeAPIRequest };
