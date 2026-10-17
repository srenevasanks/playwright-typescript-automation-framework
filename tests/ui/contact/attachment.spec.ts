import { test, expect } from '../../../src/fixtures/testFixtures';
import { ContactPage } from '../../../src/pages/ContactPage';
test('CON-01 Select and clear supported contact attachment without submission @upload @regression', async ({
  page,
}) => {
  const contact = new ContactPage(page);
  await contact.goto();
  await expect(contact.attachment).toHaveAttribute('accept', '.txt');
  await expect(
    page.getByText('Only files with the txt extension are allowed, and files must be 0kb.'),
  ).toBeVisible();
  await contact.attachment.setInputFiles({
    name: 'portfolio-evidence.txt',
    mimeType: 'text/plain',
    buffer: Buffer.alloc(0),
  });
  const selected = await contact.attachment.evaluate((input: HTMLInputElement) =>
    Array.from(input.files ?? [], (file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
  );
  expect(selected).toEqual([{ name: 'portfolio-evidence.txt', size: 0, type: 'text/plain' }]);
  await contact.attachment.setInputFiles([]);
  expect(await contact.attachment.evaluate((input: HTMLInputElement) => input.files?.length)).toBe(
    0,
  );
});
