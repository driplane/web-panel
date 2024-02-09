/* eslint-disable @typescript-eslint/naming-convention */
import {
  HttpContext,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';


export interface AuthResponse {
  token: string;
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
}

export interface ProjectKey extends ProjectKeyConfig {
  key: string;
  created_at: string;
}

export interface TopListItem {
  tag: string;
  count: number;
}

export interface CountItem {
  name: string;
  count: number;
}

export interface HistogramItem {
  time: string;
  count: number;
}

export interface HistogramResponseItem {
  time: string;
  count: string;
}

export interface TotalItem {
  time: string;
  total: number;
}

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
