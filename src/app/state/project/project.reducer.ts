import { createReducer, on } from '@ngrx/store';
import { Project, ProjectKey } from '../../driplane.types';
import {
  addFilter,
  addProjectSuccess,
  clearFilter,
  loadProjectKeysSuccess,
  loadProjectSuccess,
  switchDashboardSuccess,
  switchProjectSuccess
} from './project.actions';
import defaultDashboard from './default-dashboard';
export const PROJECT_FEATURE_KEY = 'project';

export interface Filter {
  key: string;
  value: string;
  label?: string;
  formattedValue?: string;
}

export type DashboardCardStyle = 'chart' | 'toplist' | 'webvitals';

export interface CardSizeBreakpoints {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  size?: number;
}

export interface CardData {
  event: string;
  title: string;
  labelFormat: 'none' | 'country';
  valueFormat: 'number' | 'filesize';
  filters?: { [key: string]: string | number };
  dataLabel?: string;
  valueLabel?: string;
  unknownLabel?: string;
  op?: 'unique' | 'total' | 'average' | 'min' | 'max' | 'count';
  tag?: string;
}

export interface CardVisibilityCondition {
  parent: string[];
}

export interface DashboardCardBase {
  style: DashboardCardStyle;
  size?: CardSizeBreakpoints;
  visible?: CardVisibilityCondition;
}

export interface DashboardCard extends DashboardCardBase, CardData {
}

export interface DashboardGroupCard extends DashboardCardBase {
  data: CardData[];
}

export interface Dashboard {
  id: string;
  title: string;
  mainEvent: string;
  cards: DashboardGroupCard[];
}

export interface ProjectState {
  projects: Project[];
  projectListFetched: boolean;
  dashboard: Dashboard[];
  activeProject: string;
  activeFilters: Filter[];
  activeProjectKeys: ProjectKey[];
  activeDashboard: Dashboard;
}

export const initialState: ProjectState = {
  projects: null,
  projectListFetched: false,
  dashboard: [],
  activeProject: localStorage.getItem('lastProjectId'),
  activeFilters: [],
  activeProjectKeys: [],
  activeDashboard: (localStorage.getItem('dashboard') && JSON.parse(localStorage.getItem('dashboard'))) || defaultDashboard,
};

export const projectReducer = createReducer(
  initialState,
  on(switchProjectSuccess, (state, { activeProject }) => ({
    ...state,
    activeFilters: [],
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
  })),
  on(switchDashboardSuccess, (state, { project, dashboard }) => ({
    ...state,
    activeDashboard: dashboard
  })),
);
