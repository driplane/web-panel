import { createReducer, on } from '@ngrx/store';
import { Project, ProjectKey } from './driplane.types';
import {
  addFilter,
  addProjectSuccess,
  clearFilter,
  loadProjectKeysSuccess,
  loadProjectSuccess,
  switchProjectSuccess
} from './project.actions';

export const PROJECT_FEATURE_KEY = 'project';

export interface Filter {
  key: string;
  value: string;
  label?: string;
}
export interface ProjectState {
  projects: Project[];
  projectListFetched: boolean;
  activeProject: string;
  activeFilters: Filter[];
  activeProjectKeys: ProjectKey[]
}

export const initialState: ProjectState = {
  projects: null,
  projectListFetched: false,
  activeProject: localStorage.getItem('lastProjectId'),
  activeFilters: [],
  activeProjectKeys: []
};

export const projectReducer = createReducer(
  initialState,
  on(switchProjectSuccess, (state, { activeProject }) => ({
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
