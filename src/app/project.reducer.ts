import { createReducer, on } from '@ngrx/store';
import {
  switchProject,
  addProject,
  loadProjectSuccess,
  loadProjectKeysSuccess,
  addFilter,
  clearFilter,
  addProjectSuccess,
} from './project.actions';
import { Project, ProjectKey } from './driplane.types';

export const PROJECT_FEATURE_KEY = 'project';

export interface Filter {
  key: string;
  value: string;
  label?: string;
}
export interface ProjectState {
  projects: Project[];
  activeProject: string;
  activeFilters: Filter[];
  activeProjectKeys: ProjectKey[]
}

export const initialState: ProjectState = {
  projects: [],
  activeProject: localStorage.getItem('lastProjectId'),
  activeFilters: [],
  activeProjectKeys: []
};

export const projectReducer = createReducer(
  initialState,
  on(switchProject, (state, { activeProject }) => ({
    ...state,
    activeProjectKeys: [],
    activeProject,
  })),
  on(addProjectSuccess, (state, { project }) => ({
    ...state,
    projects: [...state.projects, project],
  })),
  on(loadProjectSuccess, (state, { projects }) => ({
    ...state,
    projects: [...projects],
  })),
  on(addFilter, (state, { filter }) => ({
    ...state,
    activeFilters: [...state.activeFilters, filter]
  })),
  on(clearFilter, (state, { filterKey }) => ({
    ...state,
    activeFilters: state.activeFilters.filter(({ key }) => key !== filterKey)
  })),
  on(loadProjectKeysSuccess, (state, { project, projectKeys }) => ({
    ...state,
    activeProjectKeys: projectKeys,
  }))
);
