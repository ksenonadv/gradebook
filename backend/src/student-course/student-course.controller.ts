import { Controller } from '@nestjs/common';
import { StudentCourseService } from './student-course.service';

@Controller('student-course')
export class StudentCourseController {
  constructor(private readonly studentCourseService: StudentCourseService) {}
}
