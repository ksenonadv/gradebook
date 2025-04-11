import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environment/environment';
import { User } from '../interfaces/user.interface';

/**
 * Service responsible for authentication and user session management in the frontend.
 * Handles user login, registration, token management, and profile operations.
 */
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

  /**
   * Creates an instance of AuthService.
   * Sets up token handling and retrieves user data if a token exists in local storage.
   */
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
        }, () => {
          this.logout();
        })
      }
    });

    const stored_token =  localStorage.getItem('token') ?? undefined;

    if (stored_token) {
      this.token.next(
        stored_token
      );
    }
  }

  /**
   * Registers a new user in the system.
   * 
   * @param email - Email address of the user
   * @param firstName - First name of the user
   * @param lastName - Last name of the user
   * @param password - Password for the account
   * @returns An Observable from the HTTP request
   */
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

  /**
   * Authenticates a user and stores the received token.
   * 
   * @param email - Email address of the user
   * @param password - Password for authentication
   * @returns A Promise resolving on successful login or rejecting with error
   */
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

  /**
   * Logs out the current user by removing the token.
   * This clears the authentication state and user data.
   */
  public logout() {
    localStorage.removeItem(
      'token'
    );

    this.token.next(
      undefined
    );
  }

  /**
   * Provides an observable stream of the current user data.
   * Used for components to react to changes in user authentication state.
   * 
   * @returns An Observable of the current user data
   */
  public get userData$() {
    return this.userData.asObservable();
  }

  /**
   * Gets the current user data as a snapshot.
   * 
   * @returns The current user data or undefined if not logged in
   */
  public getUserData() {
    return this.userData.getValue();
  }

  /**
   * Checks if a user is currently logged in.
   * 
   * @returns True if the user is logged in, false otherwise
   */
  public get isLoggedIn() {
    return this.token.value !== undefined;
  }

  /**
   * Initiates the forgot password process.
   * 
   * @param email - Email address of the user requesting password reset
   * @returns A Promise resolving with a success message or rejecting with error
   */
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

  /**
   * Resets a user's password using a token.
   * 
   * @param token - Reset token received via email
   * @param password - New password to set
   * @returns A Promise resolving with a success message or rejecting with error
   */
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

  /**
   * Changes a user's email address and updates the authentication token.
   * 
   * @param email - Current email address of the user
   * @param newEmail - New email address to change to
   * @returns A Promise resolving with a success message or rejecting with error
   */
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

  /**
   * Updates the authentication token.
   * Used when receiving a new token from the server after certain operations.
   * 
   * @param newToken - The new JWT token to set
   */
  public refreshToken(newToken: string) {
    this.token.next(newToken);
  }
}
