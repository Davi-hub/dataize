import { Component, OnInit } from '@angular/core';
import { ExpiredService } from './shared/services/expired.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'dataize';
  demo!: boolean;

  constructor(private expiredService: ExpiredService) {

  }

  ngOnInit(): void {
    this.demo = this.expiredService.isExpired();
  }
}
