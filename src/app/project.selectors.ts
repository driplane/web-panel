import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Project } from './driplane.types';
import { ProjectState, PROJECT_FEATURE_KEY } from './project.reducer';

export const selectProjectState = createFeatureSelector<ProjectState>(
  PROJECT_FEATURE_KEY,
);


export const projects = createSelector(
  selectProjectState,
  (state: ProjectState) => state?.projects || [],
);


export const activeProject = createSelector(
  selectProjectState,
  projects,
  (state: ProjectState, projectList: Project[]) => projectList.find(p => p.id === state.activeProject)
);
