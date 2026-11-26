// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest';

import {
  createTask,
  updateTask,
  toggleTaskCompletion,
  sortTasks,
  saveTasks,
  loadTasks,
} from '../public/taskStore.js';

// testikommenttii

describe('Tehtävien hallinta', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // 1. Tehtävän lisääminen
  it('luo uuden tehtävän', () => {
    const task = createTask(
      {
        topic: 'Testitehtävä',
        description: 'Testikuvaus',
        priority: 'medium',
        status: 'todo',
      },
      1000,
    );

    expect(task.topic).toBe('Testitehtävä');
    expect(task.description).toBe('Testikuvaus');
    expect(task.completed).toBe(false);
  });

  // 2. Aiheen minimipituus

  // 3. Aiheen maksimipituus
  it('hyväksyy 120 merkin pituisen aiheen', () => {
    const title = 'A'.repeat(120);

    const task = createTask({
      title,
      description: '',
      priority: 'low',
      status: 'to do',
    });

    expect(task.title).toHaveLength(120);
  });

  // 4. Prioriteetin valinta
  it.each(['low', 'medium', 'high'])('hyväksyy prioriteetin %s', (priority) => {
    const task = createTask({
      title: 'Testi',
      priority,
      status: 'to do',
    });

    expect(task.priority).toBe(priority);
  });

  // 5. Tilatiedon valinta
  it.each(['to do', 'in progress', 'blocked', 'done'])(
    'hyväksyy tilan %s',
    (status) => {
      const task = createTask({
        title: 'Testi',
        priority: 'medium',
        status,
      });

      expect(task.status).toBe(status);
    },
  );

  // 6. Tehtävän muokkaaminen
  it('muokkaa tehtävän tietoja', () => {
    const task = createTask(
      {
        topic: 'Vanha aihe',
        description: '',
        priority: 'low',
        status: 'todo',
      },
      1000,
    );

    const updated = updateTask(
      task,
      {
        topic: 'Uusi aihe',
        description: '',
        priority: 'high',
        status: 'todo',
      },
      2000,
    );

    expect(updated.topic).toBe('Uusi aihe');
    expect(updated.priority).toBe('high');
    expect(updated.updatedAt).toBe(2000);
  });

  // 7. Tehtävän poistaminen
  it('poistaa tehtävän tallennetuista tiedoista', () => {
    const task1 = createTask(
      {
        topic: 'Tehtävä 1',
        priority: 'low',
        status: 'todo',
        description: '',
      },
      1000,
    );

    const task2 = createTask(
      {
        topic: 'Tehtävä 2',
        priority: 'high',
        status: 'todo',
        description: '',
      },
      2000,
    );

    saveTasks([task1, task2]);

    const tasks = loadTasks().filter((task) => task.id !== task1.id);

    saveTasks(tasks);

    expect(loadTasks()).toHaveLength(1);
    expect(loadTasks()[0].id).toBe(task2.id);
  });

  // 8. Tehtävän valmistuminen
  it('merkitsee tehtävän valmiiksi', () => {
    const task = createTask(
      {
        topic: 'Testitehtävä',
        description: '',
        priority: 'medium',
        status: 'todo',
      },
      1000,
    );

    const updated = toggleTaskCompletion(task, 2000);

    expect(updated.completed).toBe(true);
    expect(updated.status).toBe('done');
  });

  it('palauttaa valmiin tehtävän keskeneräiseksi', () => {
    const task = createTask(
      {
        topic: 'Testitehtävä',
        description: '',
        priority: 'medium',
        status: 'done',
      },
      1000,
    );

    const updated = toggleTaskCompletion(task, 2000);

    expect(updated.completed).toBe(false);
    expect(updated.status).toBe('todo');
  });

  // 10. Tehtävien lajittelu
  it('lajittelee tehtävät prioriteetin ja valmistumisen mukaan', () => {
    const tasks = [
      {
        id: '1',
        priority: 'low',
        completed: false,
        createdAt: 1000,
      },
      {
        id: '2',
        priority: 'high',
        completed: false,
        createdAt: 2000,
      },
      {
        id: '3',
        priority: 'medium',
        completed: true,
        createdAt: 3000,
      },
    ];

    const sorted = sortTasks(tasks);

    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
    expect(sorted[2].id).toBe('3');

    // Varmistetaan, ettei alkuperäinen taulukko muuttunut.
    expect(tasks[0].id).toBe('1');
  });

  // 11. Tietojen tallentaminen
  it('tallentaa tehtävät localStorageen', () => {
    const tasks = [
      {
        id: '1',
        title: 'Tallennettava tehtävä',
        priority: 'high',
        status: 'to do',
      },
    ];

    saveTasks(tasks);

    expect(localStorage.length).toBeGreaterThan(0);
  });

  // 12. Tietojen lataaminen
  it('lataa tallennetut tehtävät localStoragesta', () => {
    const tasks = [
      {
        id: '1',
        title: 'Tallennettu tehtävä',
        priority: 'medium',
        status: 'to do',
      },
    ];

    saveTasks(tasks);

    const loaded = loadTasks();

    expect(loaded).toEqual(tasks);
  });
});

// Virheellisen tallennuksen käsittely

describe('Virheellisten tallennustietojen käsittely', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('käsittelee tyhjän localStoragen', () => {
    const tasks = loadTasks();

    expect(tasks).toEqual([]);
  });

  it('ei kaada sovellusta virheellisen JSON-datan vuoksi', () => {
    localStorage.setItem('tasks', '{virheellinen json');

    expect(() => loadTasks()).not.toThrow();
  });
});
