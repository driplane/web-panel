import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { tokenInvalid } from './auth.actions';
import {
  AuthResponse, CountItem,
  HistogramItem, HistogramResponseItem, Project, ProjectKey, QueryResponse, RequestOptions, Response,
  TopListItem
} from './driplane.types';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DriplaneService {
  private baseUrl = environment.apiBaseUrl;
  private token = '';

  constructor(private http: HttpClient, private store: Store) {
  }

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

  getProjects(): Observable<Project[]> {
    return this.tokenReq<Response<Project[]>>('get', 'projects').pipe(
      map((res) => res.response),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getProject(projectId: string): Observable<Project> {
    return this.getProjects().pipe(
      map((projects) => projects.find((p) => p.id === projectId))
    );
  }

  getProjectsKeys(project: Project): Observable<ProjectKey[]> {
    return this.projectAuthRequest<Response<ProjectKey[]>>(
      project,
      'get',
      `projects/${project.id}/keys`
    ).pipe(map((res) => res.response));
  }

  getToplist(project: Project, event, params): Observable<TopListItem[]> {
    return this.projectEventRequest<TopListItem[]>(
      project,
      event,
      'toplist',
      params
    ).pipe(map((res) => res.result));
  }

  getTotalCounts(project: Project, event, params): Observable<CountItem> {
    return this.projectEventRequest<CountItem>(
      project,
      event,
      'count',
      params
    ).pipe(map((res) => res.result));
  }

  getHistogram(project: Project, event, params): Observable<HistogramItem[]> {
    return this.projectEventRequest<HistogramResponseItem[]>(
      project,
      event,
      'histogram',
      params
    ).pipe(
      map((res) => Array.isArray(res.result) ? res.result : [] ),
      map((result) => result.map((item => ({
        ...item,
        count: parseInt(item.count, 10)
      }))))
    );
  }


  getUniqueTagCounts(project: Project, event: string, tag: string, params): Observable<HistogramItem[]> {
    return this.projectEventRequest<HistogramResponseItem[]>(
      project,
      event,
      'unique',
      {
        ...params,
        tag
      }
    ).pipe(
      map((res) => Array.isArray(res.result) ? res.result : [] ),
      map((result) => result.map((item => ({
        ...item,
        count: parseInt(item.count, 10)
      }))))
    );
  }

  getTotals(project: Project, event, tag, params): Observable<TopListItem[]> {
    return this.projectEventRequest<TopListItem[]>(project, event, 'total', {
      ...params,
      tag,
    }).pipe(map((res) => res.result));
  }

  private tokenReq<T>(
    method: string,
    endpoint: string,
    options?: RequestOptions
  ): Observable<T> {
    return this.http.request<T>(method, `${this.baseUrl}/${endpoint}`, {
      headers: {
        authorization: `Bearer ${this.token}`,
      },
      observe: 'body',
      responseType: 'json',
      ...options,
    }).pipe(
      catchError((response: any) => {
        if (response instanceof HttpErrorResponse && response.status === 401) {
          this.store.dispatch(tokenInvalid());
        }
        return throwError(response);
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
