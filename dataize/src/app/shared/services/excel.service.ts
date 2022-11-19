import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BookDataService } from 'src/app/book/services/book-data.service';
import { RecordDataService } from 'src/app/record/services/record-data.service';
import { environment } from 'src/environments/environment';
import { BookData } from '../book-data.model';
import { PieceOfBookData } from '../pieceOfBookData.interface';
import { RecordData } from '../record-data.model';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {
  bookFileNameSubject = new Subject();
  bookFileNamesSubject = new Subject();
  recordFileNameSubject = new Subject();
  recordFileNamesSubject = new Subject();
  bookFileSubject = new Subject();
  recordFileSubject = new Subject();
  headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });
  public error: boolean = false;
  private blob!: string | undefined;

  constructor(
    private http: HttpClient,
    private bookDataService: BookDataService,
    private recordDataService: RecordDataService,
    private matSnackBar: MatSnackBar
  ) { }

  async addBook(bookForm: FormGroup, fileName: string, bookData: PieceOfBookData) {
    let no;
    let isbn_13
    let isbn;
    let price;
    let customSku;
    let edition;
    let inscribed;
    let signed;
    let vintage = "";
    let numberOfPics = [""];

    if (bookData) no = bookData.no;
    if (bookData) isbn_13 = bookData.isbn_13;
    if (bookData) isbn = bookData.isbn;
    if (bookData) price = bookData.price;
    if (bookData) customSku = bookData.customSku;
    if (Array.isArray(bookForm.value.isbn_10)) isbn = bookForm.value.isbn_10[0]; else isbn = bookForm.value.isbn_10;
    if (bookForm.value.edition) edition = "First Edition"; else edition = "";
    if (bookForm.value.inscribed) inscribed = "Yes"; else inscribed = "No";
    if (bookForm.value.signed) signed = "Yes"; else signed = "No";
    if (bookForm.value.publish_date) {
      if (+bookForm.value.publish_date < 2000) vintage = "Yes"; else vintage = "No";
    }
    if (bookData) numberOfPics = bookData.numberOfPics;
    console.log(numberOfPics);


    let line = new BookData(
      bookForm.value.publish_date,
      bookForm.value.title,
      bookForm.value.subtitle,
      bookForm.value.authors,
      bookForm.value.publishers,
      bookForm.value.language,
      no,
      isbn,
      isbn_13,
      isbn,
      undefined,
      this.getDate(),
      numberOfPics,
      price,
      bookForm.value.condition,
      customSku,
      bookForm.value.country,
      bookForm.value.format,
      bookForm.value.features,
      edition,
      inscribed,
      signed,
      vintage,
      "=>"
    )

    // let line = [
    //   this.getDate(),
    //   "",
    //   +bookForm.value.numberOfPics,
    //   261186, "",
    //   bookForm.value.condition,
    //   "F1", "13", "7", "3", "2", "0", "True", "3.0", "No",
    //   bookForm.value.publish_date,
    //   bookForm.value.country,
    //   bookForm.value.title,
    //   bookForm.value.subtitle,
    //   bookForm.value.authors,
    //   bookForm.value.publishers,
    //   bookForm.value.language,
    //   isbn,
    //   bookForm.value.format,
    //   bookForm.value.features,
    //   edition,
    //   inscribed,
    //   signed,
    //   vintage,
    //   "No", "No", "No"
    // ];
    for (let prop in line) {
      if (typeof prop === 'string') {
        prop = prop.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
    }
    this.bookDataService.tableDataSubject.next('cleanUp');
    await this.writeLine('book', line, fileName);
  }

  async addRecord(recordForm: FormGroup, data: {numberOfPics: string[], title: string, no: number}, fileName: string) {
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
    let numberOfPics = data.numberOfPics;
    let title = data.title;
    let barcode;
    let no = data.no;
    if (Array.isArray(recordForm.value.barcode)) barcode = recordForm.value.barcode[0]; else barcode = recordForm.value.barcode;
    if (recordForm.value.barcode === '') barcode = 'Does not apply';

    let line = new RecordData(
      this.getDate(),
      numberOfPics,
      title,
      barcode,
      recordForm.value.composer,
      recordForm.value.artist,
      recordForm.value.conductor,
      recordForm.value.release_title,
      recordForm.value.format,
      recordForm.value.genre,
      recordForm.value.label,
      recordForm.value.speed,
      recordForm.value.year,
      recordForm.value.country,
      '=>',
      no
    );

    for (let prop in line) {
      if (typeof prop === 'string') {
        prop = prop.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
    }

    this.recordDataService.tableDataSubject.next('cleanUp');
    await this.writeLine('record', line, fileName);
  }

  async createFile(item: string, fileName: string, path: string) {
    this.postToServer('createfile', item, { fileName: fileName, path: path });
  }

  async openFile(item: string, fileName: string) {
    this.postToServer2('openfile', item, { fileName: fileName })
      .pipe(
        map(
          async (res: any) => {
            let newRes = await res;
            if (newRes.data) {
              newRes.data = JSON.parse(newRes.data)

              for (let i = 0; i < newRes.data.length; i++) {
                newRes.data[i] = { no: i + 1, ...newRes.data[i] };
              }
            }

            return newRes;
          }
        ))
      .subscribe(
        async (res: any) => {
          let newRes = await res;
          console.log(newRes);
          if (item == 'book') {
            this.bookFileSubject.next(newRes.data);
            return;
          }
          if (item == 'record') {
            this.recordFileSubject.next(newRes.data);
          }
        }
      );
  }

  async writeLine(item: string, line: any, fileName: string) {
    this.postToServer('writeline', item, { line: line, fileName: fileName })
  }

  forFileInfo(item: string) {
    let params = new HttpParams().set('item', item)
    return this.http.get(environment.nodeServer + 'getfileinfo', { params: params });
  }

  async updatePicsPath(item: string, path: string) {
    this.postToServer2('updatePicsPath', item, { path: path }).subscribe(
      (res: any) => {
        this.getMatSnackBar(res.message);
      },
      (err: any) => this.getMatSnackBar('Error: ' + err)
    );
  }

  async getFileInfo(item: string) {
    this.forFileInfo(item).subscribe((data: any) => {
      if (item == 'book') {
        console.log(data);
        this.bookFileNameSubject.next(data);
      }
      if (item == 'record') {
        this.recordFileNameSubject.next(data);
      }
    },
    (err) => {
      if(err.errno = -2) this.getMatSnackBar("Folder not found!");
    }
    )
  }

  getFileNames(item: string) {
    let params = new HttpParams().set('item', item);
    return this.http.get(environment.nodeServer + 'getfilenames', { params: params });
  }

  async postToServer(url: string, item: string, data: Object) {
    this.http.post(environment.nodeServer + url, { ...data, item: item }, { headers: this.headers })
      .subscribe(
        async (res: string | any) => {
          let newRes = await res;
          this.getFileInfo(item);
          this.getMatSnackBar(newRes.message);

        },
        err => {
          this.getMatSnackBar('Error!');
        }
      );
  }

  postToServer2(url: string, item: string, data: Object) {
    return this.http.post(environment.nodeServer + url, { ...data, item: item }, { headers: this.headers });
  }

  download(url: string, item: string, fileName: string) {
    this.http.post(environment.nodeServer + url, { fileName: fileName, item: item }, { headers: this.headers, responseType: "blob" })
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
    return date;
  }
}

