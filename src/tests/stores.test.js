import { describe, it, expect, beforeEach } from 'vitest';
import useTaskStore from '../stores/taskStore';

describe('Task Store - Real-time event handlers', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [], isLoading: false, error: null });
  });

  it('applyTaskCreated adds a new task', () => {
    const task = { _id: 'task1', title: 'New Task', status: 'todo' };
    useTaskStore.getState().applyTaskCreated(task);

    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().tasks[0]._id).toBe('task1');
  });

  it('applyTaskCreated prevents duplicates', () => {
    const task = { _id: 'task1', title: 'New Task', status: 'todo' };
    useTaskStore.getState().applyTaskCreated(task);
    useTaskStore.getState().applyTaskCreated(task);

    expect(useTaskStore.getState().tasks).toHaveLength(1);
  });

  it('applyTaskUpdated replaces existing task', () => {
    const task = { _id: 'task1', title: 'Original', status: 'todo' };
    useTaskStore.setState({ tasks: [task] });

    const updated = { _id: 'task1', title: 'Updated', status: 'in_progress' };
    useTaskStore.getState().applyTaskUpdated(updated);

    expect(useTaskStore.getState().tasks[0].title).toBe('Updated');
    expect(useTaskStore.getState().tasks[0].status).toBe('in_progress');
  });

  it('applyTaskDeleted removes task by ID', () => {
    const tasks = [
      { _id: 'task1', title: 'Keep' },
      { _id: 'task2', title: 'Remove' },
    ];
    useTaskStore.setState({ tasks });

    useTaskStore.getState().applyTaskDeleted('task2');

    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().tasks[0]._id).toBe('task1');
  });

  it('reset clears all tasks', () => {
    useTaskStore.setState({ tasks: [{ _id: '1' }], error: 'oops' });
    useTaskStore.getState().reset();

    expect(useTaskStore.getState().tasks).toEqual([]);
    expect(useTaskStore.getState().error).toBeNull();
  });
});
