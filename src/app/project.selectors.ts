import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectState, PROJECT_FEATURE_KEY } from './project.reducer';

export const selectProjectState = createFeatureSelector<ProjectState>(
  PROJECT_FEATURE_KEY,
);

export const activeProject = createSelector(
  selectProjectState,
  (state: ProjectState) => state.activeProject,
);


export const projects = createSelector(
  selectProjectState,
  (state: ProjectState) => state.projects,
);

