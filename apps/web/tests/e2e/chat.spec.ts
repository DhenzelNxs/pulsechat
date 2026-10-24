import { test, expect, type Page } from '@playwright/test';

function uniqueUsername(prefix: string): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

async function registerAndLogin(
  page: Page,
  username: string,
  firstName: string,
  lastName: string,
): Promise<void> {
  const email = `${username}@example.com`;
  const password = 'Password123!';

  await page.goto('/register');
  await page.getByLabel('First name').fill(firstName);
  await page.getByLabel('Last name').fill(lastName);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.waitForURL('**/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  await page.waitForURL('http://localhost:5173/');
}

test('register two users, DM, and see a sent message appear for the recipient', async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  await contextA.addInitScript(() => window.localStorage.setItem('pulsechat-language', 'en'));
  await contextB.addInitScript(() => window.localStorage.setItem('pulsechat-language', 'en'));
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  const alice = uniqueUsername('alice');
  const bob = uniqueUsername('bob');

  await registerAndLogin(pageA, alice, 'Alice', 'Anderson');
  await registerAndLogin(pageB, bob, 'Bob', 'Baker');

  await pageA.getByRole('button', { name: 'New chat' }).click();
  await pageA.getByPlaceholder('Search by username').fill(bob);
  await pageA.getByRole('button', { name: bob }).click();
  await pageA.getByRole('button', { name: 'Start chat' }).click();
  await pageA.waitForURL('**/rooms/**');

  const messageText = `hello from alice ${Date.now()}`;
  await pageA.getByPlaceholder('Write a message…').fill(messageText);
  await pageA.getByRole('button', { name: 'Send' }).click();
  await expect(pageA.getByText(messageText)).toBeVisible();

  await pageB.goto('/');
  await pageB.getByRole('link', { name: 'Alice Anderson' }).click();
  await pageB.waitForURL('**/rooms/**');
  await expect(pageB.getByText(messageText)).toBeVisible();

  await contextA.close();
  await contextB.close();
});
