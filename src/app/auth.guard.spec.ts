import { Router, provideRouter } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { TestBed } from '@angular/core/testing';
import { LS_TOKEN_KEY } from './auth.effects';

describe('AuthGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  const next = jasmine.createSpyObj('ActivatedRouteSnapshot', ['']);
  const state = jasmine.createSpyObj('RouterStateSnapshot', ['']);

  beforeEach(() => {
    // Create a spy for the Router
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Configure the testing module to provide the spy
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
      ]
    });

  });

  it('should allow the authenticated user', async () => {
    // Setup localStorage to simulate an authenticated user
    localStorage.setItem(LS_TOKEN_KEY, 'dummy-token');

    // Execute the guard
    const result = await TestBed.runInInjectionContext(() => AuthGuard(next, state));

    // Assertions
    expect(result).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should redirect an unauthenticated user to the login page', async () => {
    // Ensure localStorage is clear to simulate an unauthenticated user
    localStorage.removeItem(LS_TOKEN_KEY);

    // Execute the guard
    const result = await TestBed.runInInjectionContext(() => AuthGuard(next, state));

    // Assertions
    expect(result).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  afterEach(() => {
    // Cleanup localStorage
    localStorage.clear();
  });

});
