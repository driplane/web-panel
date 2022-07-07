import { createReducer, on } from '@ngrx/store';
import {
  switchProject,
  addProject,
  loadProjectSuccess,
  loadProjectKeysSuccess,
} from './project.actions';
import { Project } from './driplane.types';

export const PROJECT_FEATURE_KEY = 'project';

export interface ProjectState {
  projects: Project[];
  activeProject: string;
}

export const initialState: ProjectState = {
  projects: [],
  activeProject: localStorage.getItem('lastProjectId'),
};

export const projectReducer = createReducer(
  initialState,
  on(switchProject, (state, { activeProject }) => ({
    ...state,
    activeProject,
  })),
  on(addProject, (state, { project }) => ({
    ...state,
    projects: [...state.projects, project],
  })),
  on(loadProjectSuccess, (state, { projects }) => ({
    ...state,
    projects: [...projects],
  })),
  on(loadProjectKeysSuccess, (state, { project, projectKeys }) => ({
    ...state,
    projects: [
      ...state.projects.map((p) => ({
        ...p,
        keys: p.id === project.id ? projectKeys : [],
      })),
    ],
  }))
);
