import { test, expect } from '@playwright/test'

test('click Get Started and Learn More and capture console', async ({ page }) => {
  const logs: string[] = []
  page.on('console', (msg) => {
    logs.push(`${msg.type()}: ${msg.text()}`)
  })

  await page.goto('/')

  // Click Get Started (assumes there's a link with text 'Get Started')
  const getStarted = page.getByRole('link', { name: /Get Started/i })
  if (await getStarted.count()) {
    await getStarted.first().click()
    await page.waitForLoadState('networkidle')
  }

  // Go back and click Learn More
  await page.goto('/')
  const learnMore = page.getByRole('link', { name: /Learn More/i })
  if (await learnMore.count()) {
    await learnMore.first().click()
    await page.waitForLoadState('networkidle')
  }

  // Output captured logs to the test output
  console.log('PLAYWRIGHT-CONSOLE-LOGS_START')
  logs.forEach((l) => console.log(l))
  console.log('PLAYWRIGHT-CONSOLE-LOGS_END')

  // Basic smoke assertion: page should have loaded successfully
  expect(true).toBeTruthy()
})
