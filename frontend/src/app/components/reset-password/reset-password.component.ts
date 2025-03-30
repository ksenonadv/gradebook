import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  token: string | null = null;

  constructor(private route: ActivatedRoute){
  }

  ngOnInit(): void{
    this.route.queryParams.subscribe(params =>{
      this.token = params['token'];
    });
  }

  private changePassword(){
    
  }
}
