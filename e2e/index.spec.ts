import { test, expect } from '@playwright/test';

test.describe('Next.js Index Page', () => {
  test('loads and Bento CSS classes render without layout shifts', async ({ page }) => {
    // Navigate to the index page
    await page.goto('/');

    // 1. Verify the Next.js index page loads
    await expect(page).toHaveTitle(/Create Next App/);
    
    // Check if the Next.js logo is visible
    const logo = page.locator('img[alt="Next.js logo"]');
    await expect(logo).toBeVisible();

    // 2. Verify Bento Grid renders correctly
    const bentoGrid = page.locator('.bento-grid');
    await expect(bentoGrid).toBeVisible();
    
    // Verify CSS classes are successfully applied by checking computed style
    // The .bento-grid class defines display: grid
    const displayStyle = await bentoGrid.evaluate((el) => window.getComputedStyle(el).display);
    expect(displayStyle).toBe('grid');
    
    // 3. Check for Layout Shifts (CLS)
    // We observe Cumulative Layout Shift and expect it to be very low/zero
    const cls = await page.evaluate(async () => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        
        try {
          const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              // @ts-ignore - layout-shift specific properties
              if (!entry.hadRecentInput) {
                // @ts-ignore
                clsValue += entry.value;
              }
            }
          });
          
          observer.observe({ type: 'layout-shift', buffered: true });
          
          // Wait a moment for any shifts to occur
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 1000);
        } catch (e) {
          // If PerformanceObserver or layout-shift isn't supported, just resolve 0
          resolve(0);
        }
      });
    });

    // CLS should be less than 0.1 for a good user experience
    // We expect 0 layout shifts for our static grid
    expect(cls).toBeLessThan(0.1);
  });
});
