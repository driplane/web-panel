import { createAction, props } from '@ngrx/store';
import { Project, ProjectConfig, ProjectKey, ProjectKeyConfig } from '../../driplane.types';
import { Dashboard, Filter } from './project.reducer';

const _ = log => `[Project] ${log}`;

export const switchProject = createAction(_('Switch Project'),  props<{ activeProject: string}>());
export const switchProjectSuccess = createAction(_('Switch Project success'),  props<{ activeProject: string}>());
export const addProject = createAction(_('Add Project'),  props<{ project: ProjectConfig}>());
export const addProjectSuccess = createAction(_('Add Project success'),  props<{ project: Project}>());

export const loadProjects = createAction(_('Load Projects'));
export const loadProjectSuccess = createAction(_('Projects loaded'), props<{ projects: Project[] }>());
export const loadProjectFailed = createAction(_('Project list loading failed'));

export const deleteProject = createAction(_('Delete Project'),  props<{ projectId: string }>());
export const deleteProjectSuccess = createAction(_('Delete Project success'));
export const deleteProjectFailed = createAction(_('Delete Project failed'));

export const addProjectKey = createAction(_('Add project key'), props<{ project: Project, projectKey: ProjectKeyConfig }>());
export const loadProjectKeys = createAction(_('Load project keys'),props<{ project: Project }>());
export const loadProjectKeysSuccess = createAction(_('Project keys loaded'),props<{ project: Project; projectKeys: ProjectKey[] }>());

export const deleteProjectKey = createAction(_('Delete project key'), props<{ project: Project, projectKey: ProjectKey }>());
export const deleteProjectKeySuccess = createAction(_('Delete project key success'), props<{ project: Project }>());
export const deleteProjectKeyFailed = createAction(_('Delete project key failed'));

export const addFilter = createAction(_('Add filter'), props<{ filter: Filter }>());
export const clearFilter = createAction(_('Clear filter'), props<{ filterKey: string }>());

export const loadDashboards = createAction(_('Load dashboards'), props<{ project: Project }>());
export const loadDashboardsSuccess = createAction(_('Dashboard loaded'), props<{ project: Project, dashboards: Dashboard[] }>());
export const loadDashboardsFailed = createAction(_('Dashboard loading failed'));

export const switchDashboard = createAction(_('Switch dashboard'), props<{ project: Project, dashboard: Dashboard }>());
export const switchDashboardSuccess = createAction(_('Switch dashboard success'), props<{ project: Project, dashboard: Dashboard }>());
