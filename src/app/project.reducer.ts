import { createReducer, on } from '@ngrx/store';
import { switchProject, addProject, loadProjectSuccess } from './project.actions';
import { Project } from './driplane.types';

export const PROJECT_FEATURE_KEY = 'project';

export interface ProjectState {
  projects: Project[];
  activeProject: Project;
}

export const initialState: ProjectState = {
  projects: [],
  activeProject: null
};

export const projectReducer = createReducer(
  initialState,
  on(switchProject, (state, { activeProject }) => ({...state, activeProject })),
  on(addProject, (state, { project }) => ({...state, projects: [...state.projects, project] })),
  on(loadProjectSuccess, (state, { projects }) => ({...state, projects: [...projects] })),
);
