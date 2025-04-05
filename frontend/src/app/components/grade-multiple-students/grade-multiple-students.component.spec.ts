import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeMultipleStudentsComponent } from './grade-multiple-students.component';

describe('GradeMultipleStudentsComponent', () => {
  let component: GradeMultipleStudentsComponent;
  let fixture: ComponentFixture<GradeMultipleStudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeMultipleStudentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradeMultipleStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
