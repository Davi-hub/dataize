import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BookData } from 'src/app/shared/book-data.model';

@Injectable({
  providedIn: 'root'
})
export class BookDataService {
  bookDataSubject = new Subject();
  tableDataSubject = new Subject();
  cellDataSubject = new Subject();
  value = 'clear me';

  constructor(private http: HttpClient) { }

  getOpenLib(id: string, idNumber: string) {
    this.http.get(
      'https://openlibrary.org/api/books?bibkeys='+id+':'+idNumber+'&jscmd=data&format=json'
    )
    .pipe(map((data: { bookKey: Object } | any) => {
      if (Object.keys(data)[0]) {
        const bookKey: string = Object.keys(data)[0];
        const book = data[bookKey];
        return this.analyzeData(book, "OL", id, idNumber);
      } else {
        return "No results";
      }
    }))
    .subscribe((bookData: BookData | string) => {
      this.tableDataSubject.next(bookData);
    });
  }

  getGoogleBooks(id: string, idNumber: string) {
    this.http.get('https://www.googleapis.com/books/v1/volumes?q='+id+':'+idNumber)
    .pipe(map((data: any) => {
      if (+data.totalItems > 0) {
        const volume = data.items[0].volumeInfo;
        return this.analyzeData(volume, 'GB', id, idNumber);
      } else {
        return "No results";
      }
    }))
    .subscribe((data: BookData | string) => {
      this.tableDataSubject.next(data);
    });
  }

  getGBbyKeyWords(keyWords: string) {
    this.http.get('https://www.googleapis.com/books/v1/volumes?q='+keyWords)
    .subscribe((data: any) => {
      if (+data.totalItems > 0) {
        console.log(data.items);
        for (let i = 0; i < data.items.length; i++) {
          const volume = data.items[i].volumeInfo;
          let record = this.analyzeData(volume, 'GKeywords', 'none', 'none');
          this.tableDataSubject.next(record);
        }
      } else {
        this.tableDataSubject.next('No results');
      }
    })
  }

  analyzeData(book: any, engine: string, id: string, idNumber: string) {
    let publish_date = '';
    let title = "";
    let subtitle = "";
    let authors = "";
    let publishers = "";
    let language = "";
    let isbn_10 = "";
    let isbn_13 = "";

    if (book.publish_date) {
      let date = new Date(book.publish_date);
      publish_date = date.getFullYear().toString();
    };
    if (book.publishedDate) {
      let date = new Date(book.publishedDate);
      publish_date = date.getFullYear().toString()
    };
    if (book.title) {
      title = book.title;
    }
    if (book.subtitle) {
      subtitle = book.subtitle;
    }
    if (book.authors) {
      if (book.authors.length === 1) {
        if (book.authors[0].name) {
          authors = book.authors[0].name;
        } else {
          authors = book.authors[0];
        }
      }
      if (book.authors.length > 1) {
        if (book.authors[0].name) {
          authors = book.authors[0].name;
          for (let i = 1; i < book.authors.length; i++) {
            authors = authors + "; " + book.authors[i].name;
          }
        } else {
          authors = book.authors[0];
          for (let i = 1; i < book.authors.length; i++) {
            authors = authors + "; " + book.authors[i];
          }
        }
      }
    }
    if (book.publisher) {
      publishers = book.publisher;
    };
    if (book.publishers) {
      if (book.publishers.length === 1) {
        publishers = book.publishers[0].name;
      }
      if (book.publishers.length > 1) {
        publishers = book.publishers[0].name;
        for (let i = 1; i < book.publishers.length; i++) {
          publishers = publishers + "; " + book.publishers[i].name;
        }
      }
    }
    if (book.language) {
      switch (book.language) {
        case 'en':
          language = 'English';
          break;

        case 'ge':
          language = 'German';
          break;

        default:
          break;
      }
    }
    if (book.identifiers) {
      if (book.identifiers.isbn_10) {
        isbn_10 = book.identifiers.isbn_10;
      }
    } else if (book.industryIdentifiers) {
      for (let i = 0; i < book.industryIdentifiers.length; i++) {
        if(book.industryIdentifiers[i].type === "ISBN_10") {
          isbn_10 = book.industryIdentifiers[i].identifier;
        }
      }
    } else {
      if (id === 'isbn') {
        isbn_10 = idNumber;
      }
    }
    if (book.identifiers) {
      if (book.identifiers.isbn_13) {
        isbn_13 = book.identifiers.isbn_13;
      }
    } else if (book.industryIdentifiers) {
      for (let i = 0; i < book.industryIdentifiers.length; i++) {
        if(book.industryIdentifiers[i].type === "ISBN_13") {
          isbn_13 = book.industryIdentifiers[i].identifier;
        }
      }
    } else {
      if (id === 'isbn') {
        isbn_13 = idNumber;
      }
    }
    let bookData: BookData = {
      publish_date: publish_date,
      title: title,
      subtitle: subtitle,
      authors: authors,
      publishers: publishers,
      language: language,
      isbn_10: isbn_10,
      isbn_13: isbn_13,
      engine: engine,
      form: '=>'
    }
    return bookData;
  }
}
