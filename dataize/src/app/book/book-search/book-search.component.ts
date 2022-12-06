import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BookDataService } from '../services/book-data.service';

@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.css']
})
export class BookSearchComponent implements OnInit {
  isbnForm!: FormGroup;
  lccnForm!: FormGroup;
  googleBooksForm!: FormGroup;
  isbnValue = '';
  lccnValue = '';
  googleBooksValue = '';

  constructor(public bookDataService: BookDataService) { }

  ngOnInit(): void {
    this.isbnForm = new FormGroup({
      isbn: new FormControl('', {validators: [Validators.minLength(10)]})
    });
    this.lccnForm = new FormGroup({
      lccn: new FormControl('')
    });
    this.googleBooksForm = new FormGroup({
      googleBooks: new FormControl('', {validators: [Validators.minLength(7)]})
    });
  }

  onIsbn() {
    const isbn = this.isbnForm.value.isbn;
    this.bookDataService.getOpenLib('isbn', isbn);
    this.bookDataService.getGoogleBooks('isbn', isbn);
    this.bookDataService.tableDataSubject.next('cleanUp');
  }

  onLccn() {
    const lccn = this.lccnForm.value.lccn;
    this.bookDataService.getOpenLib('lccn', lccn);
    this.bookDataService.getGoogleBooks('lccn', lccn);
    this.bookDataService.tableDataSubject.next('cleanUp');
  }

  onGoogleBooks() {
    const text = this.googleBooksForm.value.googleBooks;
    this.bookDataService.getGBbyKeyWords(text);
    this.bookDataService.tableDataSubject.next('cleanUp');
  }
}
