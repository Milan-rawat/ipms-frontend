import { describe, it, expect, beforeEach } from 'vitest';
import useTaskStore from '../stores/taskStore';
import useProjectStore from '../stores/projectStore';

describe('Real-Time: Task Store Event Handlers', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [], isLoading: false, error: null });
  });

  it('applyTaskCreated adds task to state', () => {
    const task = { _id: 't1', title: 'New', status: 'todo' };
    useTaskStore.getState().applyTaskCreated(task);
    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().tasks[0]._id).toBe('t1');
  });

  it('applyTaskCreated prevents duplicate by ID', () => {
    const task = { _id: 't1', title: 'New', status: 'todo' };
    useTaskStore.getState().applyTaskCreated(task);
    useTaskStore.getState().applyTaskCreated(task);
    expect(useTaskStore.getState().tasks).toHaveLength(1);
  });

  it('applyTaskUpdated replaces existing task', () => {
    useTaskStore.setState({ tasks: [{ _id: 't1', title: 'Old', status: 'todo' }] });
    useTaskStore.getState().applyTaskUpdated({ _id: 't1', title: 'Updated', status: 'in_progress' });
    expect(useTaskStore.getState().tasks[0].title).toBe('Updated');
    expect(useTaskStore.getState().tasks[0].status).toBe('in_progress');
  });

  it('applyTaskDeleted removes task by ID', () => {
    useTaskStore.setState({ tasks: [{ _id: 't1' }, { _id: 't2' }] });
    useTaskStore.getState().applyTaskDeleted('t1');
    expect(useTaskStore.getState().tasks).toHaveLength(1);
    expect(useTaskStore.getState().tasks[0]._id).toBe('t2');
  });

  it('REST create + socket event does not duplicate', () => {
    // Simulate: REST response adds task, then socket event arrives for same task
    const task = { _id: 't1', title: 'Created', status: 'todo' };
    useTaskStore.setState({ tasks: [task] }); // REST already added it
    useTaskStore.getState().applyTaskCreated(task); // Socket event arrives
    expect(useTaskStore.getState().tasks).toHaveLength(1);
  });
});

describe('Real-Time: Project Store Member Handlers', () => {
  beforeEach(() => {
    useProjectStore.setState({
      projects: [{ _id: 'p1', name: 'Project' }],
      currentProject: {
        _id: 'p1',
        name: 'Project',
        owner: { _id: 'owner1' },
        members: [
          { user: { _id: 'owner1', name: 'Owner' }, role: 'admin' },
          { user: { _id: 'member1', name: 'Member' }, role: 'member' },
        ],
      },
      isLoading: false,
      error: null,
      removedFromProject: null,
    });
  });

  it('applyMemberAdded adds new member to currentProject', () => {
    const newUser = { _id: 'member2', name: 'New Member', email: 'new@test.com' };
    useProjectStore.getState().applyMemberAdded(newUser);
    expect(useProjectStore.getState().currentProject.members).toHaveLength(3);
  });

  it('applyMemberAdded prevents duplicate member', () => {
    const existing = { _id: 'member1', name: 'Member', email: 'member@test.com' };
    useProjectStore.getState().applyMemberAdded(existing);
    expect(useProjectStore.getState().currentProject.members).toHaveLength(2);
  });

  it('applyMemberRemoved removes member from currentProject', () => {
    useProjectStore.getState().applyMemberRemoved('member1');
    expect(useProjectStore.getState().currentProject.members).toHaveLength(1);
    expect(useProjectStore.getState().currentProject.members[0].user._id).toBe('owner1');
  });

  it('handleRemovedFromProject clears project and sets flag', () => {
    useProjectStore.getState().handleRemovedFromProject('p1');
    expect(useProjectStore.getState().currentProject).toBeNull();
    expect(useProjectStore.getState().projects).toHaveLength(0);
    expect(useProjectStore.getState().removedFromProject).toBe('p1');
  });

  it('clearRemovedFlag resets the flag', () => {
    useProjectStore.setState({ removedFromProject: 'p1' });
    useProjectStore.getState().clearRemovedFlag();
    expect(useProjectStore.getState().removedFromProject).toBeNull();
  });

  it('handleRemovedFromProject does not affect other projects', () => {
    useProjectStore.setState({
      projects: [{ _id: 'p1' }, { _id: 'p2' }],
      currentProject: { _id: 'p2', name: 'Other', owner: { _id: 'x' }, members: [] },
    });
    useProjectStore.getState().handleRemovedFromProject('p1');
    expect(useProjectStore.getState().projects).toHaveLength(1);
    expect(useProjectStore.getState().projects[0]._id).toBe('p2');
    expect(useProjectStore.getState().currentProject._id).toBe('p2');
  });
});
