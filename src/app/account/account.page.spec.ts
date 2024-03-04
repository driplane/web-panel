import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountPage } from './account.page';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('AccountPage', () => {
  let component: AccountPage;
  let fixture: ComponentFixture<AccountPage>;
  let store: MockStore;
  const initialState = { };

  beforeEach(async () => {
    const mockDriplaneService = jasmine.createSpyObj(['login']);

    await TestBed.configureTestingModule({
      declarations: [AccountPage],
      imports: [IonicModule.forRoot(), FormsModule, ReactiveFormsModule],
      providers: [
        provideMockStore({ initialState }),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(AccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
