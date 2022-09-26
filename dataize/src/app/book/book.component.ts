import { Component, OnInit } from '@angular/core';
import { ExpiredService } from '../shared/services/expired.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  bookDisplayedColumns: string[] = ['publish_date', 'title', 'subtitle', 'authors', 'publishers', 'language', 'isbn_10', 'isbn_13', 'form'];
  demo!: boolean;

  constructor(private expiredService: ExpiredService) { }

  ngOnInit(): void {
    this.demo = this.expiredService.isExpired();
  }

}
