import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCourseDialogComponent } from './create-course-dialog.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CreateCourseDialogComponent', () => {
  let component: CreateCourseDialogComponent;
  let fixture: ComponentFixture<CreateCourseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCourseDialogComponent],
      providers: [
        { provide: Router, useValue: {} },
        { provide: HttpClient, useValue: {} },
        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        { provide: MatDialog, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
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
