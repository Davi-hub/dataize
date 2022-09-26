import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExpiredService {

  constructor() { }

  isExpired() {
    const currentDate = new Date().getTime();
    const expireDate = new Date("2025-10-20").getTime();
    return currentDate <= expireDate;
  }
}
