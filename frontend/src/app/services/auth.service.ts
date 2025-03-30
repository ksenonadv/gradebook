import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environment/environment';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  
  private apiUrl = `${environment.apiUrl}/auth`;

  private token = new BehaviorSubject<string | undefined>(
    undefined
  );

  private userData = new BehaviorSubject<User | undefined>(
    undefined
  );

  private httpClient = inject(
    HttpClient
  );

  constructor() {
    
    this.token.subscribe(token => {

      if (!token) {
        this.userData.next(
          undefined
        );
      } else {
        this.httpClient.get<User>(`${this.apiUrl}/me`).subscribe((user: User) => {
          this.userData.next(
            user
          );
        });
      }
    });

    const stored_token =  localStorage.getItem('token') ?? undefined;

    if (stored_token) {
      this.token.next(
        stored_token
      );
    }
  }

  public register(email: string, firstName: string, lastName: string, password: string) {
    return this.httpClient.post(
      `${this.apiUrl}/register`, 
      { 
        email, 
        firstName, 
        lastName, 
        password 
      }
    );
  }

  public login(email: string, password: string) {
    return new Promise<void>((resolve, reject) => {
      this.httpClient.post<{ token: string }>(
        `${this.apiUrl}/login`, 
        { 
          email, 
          password 
        }
      ).subscribe({
        next: (res: { token: string }) => {
  
          localStorage.setItem(
            'token',
            res.token
          );

          this.token.next(
            res.token
          );

          resolve();
        },
        error: (error) => {
          reject(
            error
          );
        }
      })
    });
  }

  public logout() {
    localStorage.removeItem(
      'token'
    );

    this.token.next(
      undefined
    );
  }

  public get userData$() {
    return this.userData.asObservable();
  }

  public getUserData() {
    return this.userData.getValue();
  }

  public get isLoggedIn() {
    return this.token.value !== undefined;
  }

  public forgotPassword(email: string){
    return new Promise<string>((resolve, reject) => {
      this.httpClient.post<{ message: string }>(
        `${this.apiUrl}/forgot-password`, 
        { 
          email
        }
      ).subscribe({
        next: (response: { message: string }) => {
          resolve(response.message);
        },
        error: (error) => {
          reject(
            error.error?.message || 'An error occurred while processing your request.'
          );
        }
      })
    });
  }

  public resetPassword(token: string, password: string){
    return new Promise<string>((resolve, reject) => {
      this.httpClient.post<{ message: string }>(
        `${this.apiUrl}/reset-password`, 
        { 
          token,
          password
        }
      ).subscribe({
        next: (response: { message: string }) => {
          resolve(response.message);
        },
        error: (error) => {
          reject(
            error.error?.message || 'An error occurred while processing your request.'
          );
        }
      })
    });
  }

  public changeEmail(email: string, newEmail: string){
    return new Promise<string>((resolve, reject) => {
      this.httpClient.put<{message: string; token: string}>(
        `${this.apiUrl}/change-email`, 
        {
          email,
          newEmail
        }
      ).subscribe({
        next: (res: { message: string; token: string }) => {
  
          localStorage.setItem(
            'token',
            res.token
          );

          this.token.next(
            res.token
          );

          resolve(res.message);
        },
        error: (error) => {
          reject(
            error.error?.message || 'An error occurred while processing your request.'
          );
        }
      })
    });
  }
}
