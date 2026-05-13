import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../../shared/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';

  currentUser = signal<User | null>(null);
  isLoggedIn = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUser();
  }

  private loadUser(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUser.set(user);
      this.isLoggedIn.set(true);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.currentUser.set(response.user);
        this.isLoggedIn.set(true);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  register(data: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, data);
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
        localStorage.removeItem('user');
        this.router.navigate(['/auth/login']);
      })
    );
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  clearSession(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    localStorage.removeItem('user');
  }
}
