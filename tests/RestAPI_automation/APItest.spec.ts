import { readFileSync } from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';
import { makeAPIRequest } from './helper/APIhelper';

const configFilePath = path.join(__dirname, './helper/APIconfig.json');

async function getConfigData() {
  try {
    const data = JSON.parse(readFileSync(configFilePath, 'utf-8'));
    return data;
  } catch (error) {
    console.error('Error reading API configuration:', error);
    throw error;
  }
}

test.describe('Bold BI API Tests', () => {
    
    test('Simple Test', async ({ }) => {
        console.log('Test running!');
    });

  test('Create User', async ({ }) => {
    try {
      const configData = await getConfigData();

      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().replace(/T|:|\./g, ''); // Format: YYYYMMDDHHmmss
      const randomUsername = `autotestuser${formattedDate.replace(/-/g, "")}${Math.random().toString(36).substring(2, 7)}`;
      const randomEmail = `${randomUsername}@qa.com`;
      const userData = {
        Username: randomUsername,
        Email: randomEmail,
        FirstName: 'QA automation',
        Lastname: `Test User`,
        Password: 'Admin@123',
      };

      const createUserEndpoint = `${configData.endpoints.users.create}`;

      const createdUserResponse = await makeAPIRequest('POST', createUserEndpoint, userData);

      expect(createdUserResponse).toBeDefined();
      expect(typeof createdUserResponse).toBe('object');

    if (typeof createdUserResponse === 'object') { 

      expect(createdUserResponse?.message?.toContain('User added successfull'));

    } else {
      console.error('Unexpected response format:', createdUserResponse);
    }

    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  });
});