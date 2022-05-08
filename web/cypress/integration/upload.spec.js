const openSettingsModal = () => {
    cy.visit('/upload');
    cy.findByRole('link', { name: /settings/i }).click();
}

const closeSettingsModal = () => {
    cy.findByRole('button', {
      name: /close/i
    }).click()
}

describe('Upload', () => {
  it('user can open settings', () => {
    openSettingsModal();
    cy.findByRole('heading', {
      name: /card options/i,
    });
  });
  it('user can close settings', () => {
    openSettingsModal();
    closeSettingsModal();
    cy.findByRole('heading', {
      name: /card options/i,
    }).should('not.exist');
  });
});
