describe('Upload', () => {
  it('user can open settings', () => {
    cy.visit('/upload');
    cy.findByRole('link', { name: /settings/i }).click();
    cy.findByRole('heading', {
      name: /card options/i,
    });
  });
});
