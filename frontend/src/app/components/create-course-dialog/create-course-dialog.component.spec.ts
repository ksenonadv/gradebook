import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCourseDialogComponent } from './create-course-dialog.component';

describe('CreateCourseDialogComponent', () => {
  let component: CreateCourseDialogComponent;
  let fixture: ComponentFixture<CreateCourseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCourseDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCourseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
