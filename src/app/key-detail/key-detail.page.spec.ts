import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyDetailPage } from './key-detail.page';

describe('KeyDetailPage', () => {
  let component: KeyDetailPage;
  let fixture: ComponentFixture<KeyDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
