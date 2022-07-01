import {
  HttpClient,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { AuthResponse, Project, Response, TopListItem, CountItem, HistogramItem, RequestOptions, QueryResponse } from './driplane.types';

@Injectable({
  providedIn: 'root',
})
export class DriplaneService {
  private baseUrl = 'https://driplane.io';
  private token = '';

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('auth');
  }

  register(email, password) {
    return this.http
      .post(`${this.baseUrl}/users`, {
        email,
        password,
      });
  }

  verifyToken(token) {
    return this.http
      .get(`${this.baseUrl}/auth/verify`, {
        params: {
          token
        }
      });
  }

  /**
   * Password reset
   *
   * @param email Email address to send password reset
   */
  passwordReset(email) {
    return this.http
      .post(`${this.baseUrl}/auth/password_reset`, {
        email,
      });
  }

  updatePassword(token, password) {
    return this.http
      .put(`${this.baseUrl}/users/me/password`, {
        token,
        password
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
        tap(resp => {
          if (resp.token) {
            this.token = resp.token;
          }
        })
      );
  }

  getProjects(): Observable<Project[]> {
    return this.tokenReq<Response<Project[]>>('get', 'projects').pipe(
      map((res) => res.response)
    );
  }

  getProject(projectId: string): Observable<Project> {
    return this.tokenReq<Response<Project[]>>('get', `projects`).pipe(
      map((res) => res.response),
      map((projects) => projects.find((p) => p.id === projectId))
    );
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
    return this.projectEventRequest<HistogramItem[]>(
      project,
      event,
      'histogram',
      params
    ).pipe(map((res) => res.result));
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

    const token = btoa(`${project.id}:${project.secret}`);

    return this.http.get<QueryResponse<T>>(
      `${this.baseUrl}/events/${event}/${endpoint}`,
      {
        params: queryParams,
        headers: {
          authorization: `Basic ${token}`,
        },
        observe: 'body',
        responseType: 'json',
      }
    );
  }
}
