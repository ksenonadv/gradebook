import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeHistoryComponent } from './grade-history.component';

describe('GradeHistoryComponent', () => {
  let component: GradeHistoryComponent;
  let fixture: ComponentFixture<GradeHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradeHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
