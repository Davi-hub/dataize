import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { BookDataService } from 'src/app/book/services/book-data.service';
import { RecordDataService } from 'src/app/record/services/record-data.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  bookFileNameSubject = new Subject();
  recordFileNameSubject = new Subject();
  headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
  userId = 'p1ntye';
  public error: boolean = false;
  private blob!: string | undefined;

  constructor(
    private http: HttpClient,
    private bookDataService: BookDataService,
    private recordDataService: RecordDataService,
    private matSnackBar: MatSnackBar
  ) { }

  async addBook(bookForm: FormGroup, fileName: string) {
    let edition;
    let inscribed;
    let signed;
    if (bookForm.value.edition) edition = "First Edition"; else edition = "";
    if (bookForm.value.inscribed) inscribed = "Yes"; else inscribed = "No";
    if (bookForm.value.signed) signed = "Yes"; else signed = "No";
    let line = [
      this.getDate(), "",
      bookForm.value.numberOfPics, 261186, "", "F1", "13", "7", "3", "2", "0", "True", "3.0",
      bookForm.value.publish_date,
      bookForm.value.country,
      bookForm.value.condition,
      bookForm.value.title,
      bookForm.value.subtitle,
      bookForm.value.authors,
      bookForm.value.publishers,
      bookForm.value.language,
      bookForm.value.isbn_10 as string,
      bookForm.value.format,
      bookForm.value.features,
      edition,
      inscribed,
      signed,"","No","No","No"
    ];
    for (let i = 0; i < line.length; i++) {
      if (typeof line[i] === 'string') {
        line[i] = line[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
    }
    this.bookDataService.tableDataSubject.next('cleanUp');
    await this.writeLine('book', line, fileName);
  }

  async addRecord(bookForm: FormGroup, fileName: string) {
    // let genre;
    // if (bookForm.value.genre.length === 1) {
    //   genre = bookForm.value.genre[0];
    // }
    // if (bookForm.value.genre.length > 2) {
    //   if (bookForm.value.genre[0]) {
    //     genre = bookForm.value.genre[0];
    //     for (let i = 1; i < bookForm.value.genre.length; i++) {
    //       genre = genre + "; " + bookForm.value.genre[i];
    //     }
    //   }
    // }
    if (bookForm.value.barcode === '') {
      bookForm.value.barcode = 'Does not apply';
    }
    let line = [
      this.getDate(), "",
      +bookForm.value.numberOfPics, 176985, "", "TBD", "Used", 13, 13, 1, 2, 0, "True", 3.0,
      bookForm.value.barcode as string,
      bookForm.value.composer,
      bookForm.value.artist,
      bookForm.value.conductor,
      bookForm.value.release_title, "Record", "Vinyl",
      bookForm.value.format,
      bookForm.value.genre,
      bookForm.value.label, "12\"",
      bookForm.value.speed,
      +bookForm.value.year, "Black",
      bookForm.value.country, "No"
    ];
    for (let i = 0; i < line.length; i++) {
      if (typeof line[i] === 'string') {
        line[i] = line[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
    }
    console.log(line);

    this.recordDataService.tableDataSubject.next('cleanUp');
    await this.writeLine('record', line, fileName);
  }

  async createFile(item: string, fileName: string) {
    this.postToServer('createfile', item, { fileName: fileName })
  }

  async openFile(item: string, fileName: string) {
    this.postToServer('openfile', item, { fileName: fileName })
  }

  async writeLine(item: string, line: any[], fileName: string) {
    this.postToServer('writeline', item, { line: line, fileName: fileName })
  }

  async getFileName(item: string) {
    let params = new HttpParams().set('item', item)
    this.http.get(environment.nodeServer + 'getfilename/' + this.userId, {params: params}).subscribe(data => {
      if (item === 'book') {
        this.bookFileNameSubject.next(data);
        return;
      }
      if (item === 'record') {
        this.recordFileNameSubject.next(data);
        return;
      }
    })
  }

  postToServer(url: string, item: string, data: Object) {
    this.http.post(environment.nodeServer + url + '/' + this.userId, { ...data, item: item }, { headers: this.headers })
      .subscribe((res: { message: string } | any) => {
        this.getMatSnackBar(res.message);
        this.getFileName(item);
      });
  }

  download(url: string, item: string, fileName: string) {
    this.http.post(environment.nodeServer + url + '/' + this.userId, { fileName: fileName, item: item }, { headers: this.headers, responseType: "blob" })
    .subscribe(data => {
      let downLoadUrl = window.URL.createObjectURL(data);
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = downLoadUrl;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
  }

  getMatSnackBar(message: string) {
    console.log(message);

    this.matSnackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  getDate() {
    let date = new Date().toLocaleDateString();
    date = date.replace(/\s/g, '');
    date = date.slice(0, -1)
    console.log(date);
    return date;
  }
}

