import { createAction, props } from '@ngrx/store';
import { Project, ProjectKey } from './driplane.types';

const _ = log => `[Project] ${log}`;

export const switchProject = createAction(_('Switch Project'),  props<{ activeProject: string}>());
export const addProject = createAction(_('Add Project'),  props<{ project: Project}>());

export const loadProjects = createAction(_('Load Projects'));
export const loadProjectSuccess = createAction(_('Projects loaded'), props<{ projects: Project[] }>());

export const loadProjectKeys = createAction(_('Load project keys'),props<{ project: Project }>());
export const loadProjectKeysSuccess = createAction(_('Project keys loaded'),props<{ project: Project; projectKeys: ProjectKey[] }>());
