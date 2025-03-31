import { inject, Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "./auth.service";

@Injectable({
    providedIn: 'root',
})
export class ImagesService {
    private apiUrl = `${environment.apiUrl}/image`;
    private httpClient = inject(HttpClient);
    private authService = inject(AuthService);

    public changeImage(email: string, image: string) {
        return new Promise<string>((resolve, reject) => {
            this.httpClient.put<{ message: string; token: string }>(
                `${this.apiUrl}/change-image`,
                { 
                    email: email, 
                    image: image 
                }
            ).subscribe({
                next: (res: { message: string; token: string }) => {

                    localStorage.setItem(
                      'token', 
                      res.token
                    );

                    this.authService.refreshToken(res.token); 
                    
                    resolve(res.message);
                },
                error: (error) => {
                    reject(
                      error.error?.message || 'An error occurred while processing your request.'
                    );
                }
            });
        });
    }
}