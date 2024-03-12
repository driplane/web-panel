import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import {
  AuthResponse,
  IntervalItem,
  Project,
  ProjectConfig,
  ProjectKey,
  ProjectKeyConfig,
  QueryResponse,
  RequestOptions,
  Response,
  Result,
  User
} from './driplane.types';
import Logger from './logger.service';
import { tokenInvalid } from './state/auth/auth.actions';
import { deleteProject } from './state/project/project.actions';
const log = Logger('service:driplane');

@Injectable({
  providedIn: 'root',
})
export class DriplaneService {
  private baseUrl = environment.apiBaseUrl;
  private token = '';

  constructor(private http: HttpClient, private store: Store) {}

  setToken(token: string) {
    this.token = token;
  }

  register(email, password) {
    return this.http.post(`${this.baseUrl}/users`, {
      email,
      password,
    });
  }

  verifyToken(token) {
    return this.http.get(`${this.baseUrl}/auth/verify`, {
      params: {
        token,
      },
    });
  }

  /**
   * Password reset
   *
   * @param email Email address to send password reset
   */
  passwordReset(email) {
    return this.http.post(`${this.baseUrl}/auth/password_reset`, {
      email,
    });
  }

  updatePassword(token, password) {
    return this.http.put(`${this.baseUrl}/users/me/password`, {
      token,
      password,
    });
  }

  login(email, password): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        map((resp) => resp as AuthResponse),
        tap((resp) => {
          if (resp.token) {
            this.token = resp.token;
          }
        })
      );
  }

  me() {
    return this.tokenReq<User>('get', 'users/me');
  }

  createProject({ name }: ProjectConfig): Observable<Project> {
    return this.tokenReq<Project>('post', 'projects', {
      body: {
        name,
      },
    });
  }

  getProjects(): Observable<Project[]> {
    return this.tokenReq<Response<Project[]>>('get', 'projects').pipe(
      map((res) => res.response),
      shareReplay(1, 3000),
    );
  }

  getProject(projectId: string): Observable<Project> {
    return this.getProjects().pipe(
      map((projects) => projects.find((p) => p.id === projectId)),
      map((project) => {
        if (!project) {
          throw new Error(`Project ${projectId} not found`);
        }
        return project;
      })
    );
  }

  deleteProject(projectId: string) {
    return this.tokenReq<Response<boolean>>('delete', `projects/${projectId}`);
  }

  createProjectKey(project: Project, keyConfig: ProjectKeyConfig) {
    log('createProjectKey', keyConfig);
    return this.projectAuthRequest<Response<ProjectKey>>(
      project,
      'post',
      `projects/${project.id}/keys`,
      {
        body: keyConfig,
      }
    ).pipe(
      tap((res) => log(res)),
      map((res) => res.response)
    );
  }

  getProjectsKeys(project: Project): Observable<ProjectKey[]> {
    return this.projectAuthRequest<Response<ProjectKey[]>>(
      project,
      'get',
      `projects/${project.id}/keys`
    ).pipe(map((res) => res.response));
  }

  deleteProjectKey(project: Project, key: ProjectKey) {
    log('deleting key', `projects/${project.id}/keys/${key.key}`);
    return this.projectAuthRequest<Response<boolean>>(
      project,
      'delete',
      `projects/${project.id}/keys/${key.key}`
    );
  }

  getTotalCounts<T extends Result = IntervalItem[]>(project: Project, event, params) {
    return this.projectEventRequest<T>(
      project,
      event,
      'count',
      params
    );
  }

  getUniqueTagCounts<T extends Result = IntervalItem[]>(
    project: Project,
    event: string,
    tag: string,
    params
  ) {
    log('getUniqueTagCounts', project, event, tag, params)
    return this.projectEventRequest<T>(
      project,
      event,
      'unique',
      {
        ...params,
        tag,
      }
    );
  }

  getAverage<T extends Result = IntervalItem[]>(project: Project, event, tag, params) {
    return this.projectEventRequest<T>(project, event, 'average', {
      ...params,
      tag,
    });
  }

  getTotals<T extends Result = IntervalItem[]>(project: Project, event, tag, params) {
    return this.projectEventRequest<T>(project, event, 'total', {
      ...params,
      tag,
    });
  }

  getEventResult<T extends Result = IntervalItem[]>(project: Project, event, endpoint, params) {
    return this.projectEventRequest<T>(project, event, endpoint, {
      ...params,
    });
  }

  private tokenReq<T>(
    method: string,
    endpoint: string,
    options?: RequestOptions
  ): Observable<T> {
    return this.http
      .request<T>(method, `${this.baseUrl}/${endpoint}`, {
        headers: {
          authorization: `Bearer ${this.token}`,
        },
        observe: 'body',
        responseType: 'json',
        ...options,
      })
      .pipe(
        catchError((response: any) => {
          if (
            response instanceof HttpErrorResponse &&
            response.status === 401
          ) {
            this.store.dispatch(tokenInvalid());
          }
          return throwError(() => response);
        })
      );
  }

  private projectAuthRequest<T>(
    project: Project,
    method: string,
    endpoint: string,
    options?: RequestOptions
  ): Observable<T> {
    const token = btoa(`${project.id}:${project.secret}`);
    return this.http.request<T>(method, `${this.baseUrl}/${endpoint}`, {
      headers: {
        authorization: `Basic ${token}`,
      },
      observe: 'body',
      responseType: 'json',
      ...options,
    });
  }

  private projectEventRequest<T>(
    project: Project,
    event,
    endpoint,
    queryParams?: HttpParams
  ): Observable<QueryResponse<T>> {
    log('projectEventRequest', project, event, endpoint, queryParams);
    for (const key in queryParams) {
      if (queryParams[key] === undefined) {
        delete queryParams[key];
      }
    }

    return this.projectAuthRequest<QueryResponse<T>>(
      project,
      'get',
      `events/${event}/${endpoint}`,
      {
        params: queryParams,
      }
    );
  }
}
