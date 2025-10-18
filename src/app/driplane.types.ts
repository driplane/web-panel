import {
  HttpContext,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Dashboard } from './state/project/project.reducer';


export interface AuthResponse {
  token: string;
}

export interface ProjectClientConfig {
  dashboards?: Dashboard[];
}

export interface ClientConfig {
  [projectId: string]: ProjectClientConfig;
}
export interface User {
  id: string;
  email: string;
  client_config?: ClientConfig;
}

export interface Query {
  since?: string;
  until?: string;
}

export interface Response<T> {
  response: T;
}

export interface QueryResponse<T> {
  query?: Query;
  result: T;
}

export interface ProjectConfig {
  name: string;
}

export interface Project extends ProjectConfig {
  created_at: string;
  id: string;
  secret: string;
}

export interface ProjectKeyConfig {
  name: string;
  read: boolean;
  write: boolean;
  auto_fill: object;
  auto_filter: object;
  auto_fill_template: {
    [key:string]: 'geoip.city' | 'geoip.country_code'
  }
}

export interface ProjectKey extends ProjectKeyConfig {
  key: string;
  created_at: string;
}

export interface EventSchema {
  [key: string]: {
    type: 'string' | 'number';
  };
}

export interface Event {
  name: string;
  schema: EventSchema;
}

export interface EventListResponse {
  events: Event[];
}

export interface TaggedListItem {
  result: string;
  [tag: string]: string;
}

export interface HistogramItem {
  time: string;
  count: number;
}

export interface IntervalItem {
  time: string;
  result: string;
}

export interface TaggedIntervalItem extends IntervalItem {
  [tag: string]: string;
}

export type Result = string | IntervalItem[] | TaggedListItem[] | TaggedIntervalItem[];
export interface IntervalResponse extends QueryResponse<IntervalItem[]> {}
export interface SingleResponse extends QueryResponse<string> {}
export interface TaggedResponse extends QueryResponse<TaggedListItem[]> {}
export interface TaggedIntervalResponse extends QueryResponse<TaggedIntervalItem[]> {}

export type GenericResponse = IntervalResponse | SingleResponse | TaggedResponse | TaggedIntervalResponse;
export interface RequestOptions {
  body?: any;
  headers?: HttpHeaders |
  {
    [header: string]: string | string[];
  };
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams |
  {
    [param: string]: string |
    number |
    boolean |
    ReadonlyArray<string | number | boolean>;
  };
  responseType?: 'json';
  reportProgress?: boolean;
  withCredentials?: boolean;
}
