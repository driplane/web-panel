import { createAction, props } from '@ngrx/store';
import { Project } from './driplane.types';

export const switchProject = createAction('[Project] Switch Project',  props<{ activeProject: Project}>());
export const addProject = createAction('[Project] Add Project',  props<{ project: Project}>());
export const loadProjects = createAction('[Project] Load Projects');
export const loadProjectSuccess = createAction('[Project] Projects loaded', props<{ projects: Project[] }>());
