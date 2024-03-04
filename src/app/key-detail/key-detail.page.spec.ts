import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyDetailPage } from './key-detail.page';
import { PROJECT_FEATURE_KEY } from '../state/project/project.reducer';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('KeyDetailPage', () => {
  let component: KeyDetailPage;
  let fixture: ComponentFixture<KeyDetailPage>;
  let store: MockStore;
  const initialState = { [PROJECT_FEATURE_KEY]: { projects: [], activeProject: null, activeProjectKeys: [] } };

  beforeEach(async () => {
    const mockActivatedRoute = { snapshot: { paramMap: { get: () => '' } } };

    await TestBed.configureTestingModule({
      declarations: [ KeyDetailPage ],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        // { provide: Router, useValue: {} },
         provideMockStore({ initialState }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(KeyDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
