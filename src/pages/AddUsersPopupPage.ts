import { Page, expect } from '@playwright/test';

export class AddUsersPopupPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async inviteUsersForm(email: string, roleId: string, workspaceId: string | null) {
    console.log('Filling popup email field with:', email);
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);

    console.log('Selecting role:', roleId, 'workspace:', workspaceId);
    await this.page.getByLabel('Role').selectOption(roleId);

    if (roleId === '1') {
      console.log('Role is superadmin (roleId = 1), workspace field should not be visible.');
      const workspaceField = this.page.getByLabel('Workspace');
      const isVisible = await workspaceField.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        throw new Error('Workspace field is unexpectedly visible for roleId = 1');
      }
    } else if (workspaceId) {
      console.log('Role is admin or user (roleId = 2 or 3), selecting workspace:', workspaceId);
      await this.page.getByLabel('Workspace').selectOption(workspaceId);
    } else {
      throw new Error(`WorkspaceId is required for roleId ${roleId} but was not provided.`);
    }

    console.log('Submitting the popup form...');
    await this.page.getByRole('button', { name: 'Submit' }).click();
    // Wait for the popup to close or a success message
    await this.page.waitForTimeout(1000);
  }
}