import { describe, it, expect, beforeEach } from 'vitest';
import { cy } from 'cypress';

describe('ToDo-sovellus', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
    cy.reload();
  });

  it('näyttää tyhjän tilan, kun tehtäviä ei ole', () => {
    cy.get('#empty-state').should('be.visible');
    cy.get('#task-list .task').should('have.length', 0);
  });

  it('lisää uuden tehtävän', () => {
    cy.get('#topic').type('Testaa sovellus');
    cy.get('#priority').select('high');
    cy.get('#status').select('todo');
    cy.get('#description').type('Tämä on testitehtävä');

    cy.get('#save-btn').click();

    cy.get('#task-list .task').should('have.length', 1);
    cy.get('#task-list').should('contain', 'Testaa sovellus');
    cy.get('#task-list').should('contain', 'Tämä on testitehtävä');
  });

  it('ei lisää tehtävää ilman otsikkoa', () => {
    cy.get('#save-btn').click();

    cy.get('#task-list .task').should('have.length', 0);
    cy.get('#empty-state').should('be.visible');
  });

  it('muokkaa olemassa olevaa tehtävää', () => {
    cy.get('#topic').type('Vanha tehtävä');
    cy.get('#save-btn').click();

    cy.get('#task-list .task').first().find('[data-action="edit"]').click();

    cy.get('#topic').clear().type('Muokattu tehtävä');
    cy.get('#save-btn').click();

    cy.get('#task-list').should('contain', 'Muokattu tehtävä');
    cy.get('#task-list').should('not.contain', 'Vanha tehtävä');
  });

  it('merkitsee tehtävän valmiiksi ja palauttaa sen keskeneräiseksi', () => {
    cy.get('#topic').type('Valmistuva tehtävä');
    cy.get('#save-btn').click();

    cy.get('#task-list .task').first().find('[data-action="complete"]').click();

    cy.get('#task-list .task').first().should('have.class', 'done');

    cy.get('#task-list .task').first().find('[data-action="complete"]').click();

    cy.get('#task-list .task').first().should('not.have.class', 'done');
  });

  it('poistaa tehtävän, kun käyttäjä vahvistaa poiston', () => {
    cy.get('#topic').type('Poistettava tehtävä');
    cy.get('#save-btn').click();

    cy.on('window:confirm', () => true);

    cy.get('#task-list .task').first().find('[data-action="delete"]').click();

    cy.get('#task-list .task').should('have.length', 0);
    cy.get('#empty-state').should('be.visible');
  });

  it('ei poista tehtävää, jos käyttäjä peruuttaa poiston', () => {
    cy.get('#topic').type('Säilytettävä tehtävä');
    cy.get('#save-btn').click();

    cy.on('window:confirm', () => false);

    cy.get('#task-list .task').first().find('[data-action="delete"]').click();

    cy.get('#task-list .task').should('have.length', 1);
    cy.get('#task-list').should('contain', 'Säilytettävä tehtävä');
  });

  it('palauttaa lomakkeen oletusarvot reset-painikkeella', () => {
    cy.get('#topic').type('Testitehtävä');
    cy.get('#description').type('Testikuvaus');
    cy.get('#priority').select('high');
    cy.get('#status').select('blocked');

    cy.get('#reset-btn').click();

    cy.get('#topic').should('have.value', '');
    cy.get('#description').should('have.value', '');
    cy.get('#priority').should('have.value', 'medium');
    cy.get('#status').should('have.value', 'todo');
    cy.get('#form-title').should('contain', 'Create Task');
    cy.get('#save-btn').should('contain', 'Save Task');
  });

  it('tallentaa tehtävän localStorageen', () => {
    cy.get('#topic').type('Tallennettava tehtävä');
    cy.get('#save-btn').click();

    cy.window().then((win) => {
      const tasks = JSON.parse(win.localStorage.getItem('todo_tasks_v1'));

      expect(tasks).to.have.length(1);
      expect(tasks[0].topic).to.equal('Tallennettava tehtävä');
    });
  });

  it('säilyttää tehtävän sivun uudelleenlatauksen jälkeen', () => {
    cy.get('#topic').type('Säilyvä tehtävä');
    cy.get('#save-btn').click();

    cy.reload();

    cy.get('#task-list').should('contain', 'Säilyvä tehtävä');
  });
});
