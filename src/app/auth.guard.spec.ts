import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MemoizedSelector, Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { LS_TOKEN_KEY } from './state/auth/auth.effects';
import { AuthGuard } from './auth.guard';
import { AuthState } from './state/auth/auth.reducer';
import { isLoggedIn, loggedInUser } from './state/auth/auth.selectors';
import { DriplaneService } from './driplane.service';
import { User } from './driplane.types';
import { Observable } from 'rxjs';

describe('AuthGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let driplaneServiceSpy: jasmine.SpyObj<DriplaneService>;
  let mockStore: MockStore<AuthState>;
  let mockIsLoggedInSelector: MemoizedSelector<AuthState, boolean>;

  const next = jasmine.createSpyObj('ActivatedRouteSnapshot', ['']);
  const state = jasmine.createSpyObj('RouterStateSnapshot', ['']);

  beforeEach(() => {
    // Create a spy for the Router
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    driplaneServiceSpy = jasmine.createSpyObj('DriplaneService', ['me']);

    // Configure the testing module to provide the spy
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: DriplaneService, useValue: driplaneServiceSpy },
        provideMockStore()
      ]
    });

    mockStore = TestBed.inject(MockStore);
  });

  it('should allow the authenticated user', (done) => {
    // given
    mockIsLoggedInSelector = mockStore.overrideSelector(isLoggedIn, true);

    // when
    const result = TestBed.runInInjectionContext(() => AuthGuard(next, state));

    // then
    (result as Observable<boolean>).subscribe((value) => {
      expect(value).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should redirect an unauthenticated user to the login page', (done) => {
    // given
    mockIsLoggedInSelector = mockStore.overrideSelector(isLoggedIn, false);

    // when
    const result = TestBed.runInInjectionContext(() => AuthGuard(next, state));

    // then
    (result as Observable<boolean>).subscribe((value) => {
      expect(value).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});
