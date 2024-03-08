import { expect, test } from "@playwright/test";

test("LangflowShortcuts", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.waitForTimeout(1000);

  await page.locator('//*[@id="new-project-btn"]').click();
  await page.waitForTimeout(1000);

  await page.getByTestId("blank-flow").click();
  await page.waitForTimeout(1000);

  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill("llamacpp");

  await page.waitForTimeout(1000);

  await page
    .locator('//*[@id="model_specsLlamaCpp"]')
    .dragTo(page.locator('//*[@id="react-flow-id"]'));
  await page.mouse.up();
  await page.mouse.down();

  await page.getByTestId("title-LlamaCpp").click();
  await page.keyboard.press("Control+e");
  await page.locator('//*[@id="saveChangesBtn"]').click();

  await page.getByTestId("title-LlamaCpp").click();
  await page.keyboard.press("Control+d");

  let numberOfNodes = await page.getByTestId("title-LlamaCpp").count();
  if (numberOfNodes != 2) {
    expect(false).toBeTruthy();
  }

  await page
    .locator(
      '//*[@id="react-flow-id"]/div[1]/div[1]/div[1]/div/div[2]/div[2]/div/div[1]/div/div[1]/div/div/div[1]'
    )
    .click();
  await page.keyboard.press("Backspace");

  numberOfNodes = await page.getByTestId("title-LlamaCpp").count();
  if (numberOfNodes != 1) {
    expect(false).toBeTruthy();
  }

  await page.getByTestId("title-LlamaCpp").click();
  await page.keyboard.press("Control+c");

  await page.getByTestId("title-LlamaCpp").click();
  await page.keyboard.press("Control+v");

  numberOfNodes = await page.getByTestId("title-LlamaCpp").count();
  if (numberOfNodes != 2) {
    expect(false).toBeTruthy();
  }

  await page
    .locator(
      '//*[@id="react-flow-id"]/div[1]/div[1]/div[1]/div/div[2]/div[2]/div/div[1]/div/div[1]/div/div/div[1]'
    )
    .click();
  await page.keyboard.press("Backspace");

  await page.getByTestId("title-LlamaCpp").click();
  await page.keyboard.press("Control+x");

  numberOfNodes = await page.getByTestId("title-LlamaCpp").count();
  if (numberOfNodes != 0) {
    expect(false).toBeTruthy();
  }
  await page.keyboard.press("Control+v");
  numberOfNodes = await page.getByTestId("title-LlamaCpp").count();
  if (numberOfNodes != 1) {
    expect(false).toBeTruthy();
  }
});
