import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BookDataService } from 'src/app/book/services/book-data.service';
import { RecordDataService } from 'src/app/record/services/record-data.service';
import { BookData } from '../book-data.model';
import { PieceOfBookData } from '../pieceOfBookData.interface';
import { RecordData } from '../record-data.model';
import { CrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  public error: boolean = false;

  constructor(
    private bookDataService: BookDataService,
    private recordDataService: RecordDataService,
    private crudService: CrudService
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
    let numberOfPics: string[] = [];

    if (bookData) no = bookData.no;
    if (bookData) isbn_13 = bookData.isbn_13;
    if (bookData) isbn = bookData.isbn;
    if (bookData) price = bookData.price;
    if (bookData) customSku = bookData.customSku;
    if (Array.isArray(bookForm.value.isbn_10)) isbn = bookForm.value.isbn_10[0]; else isbn = bookForm.value.isbn_10;
    if (bookForm.value.edition) edition = "First Edition"; else edition = "";
    if (bookForm.value.inscribed) inscribed = "Yes"; else inscribed = "No";
    if (bookForm.value.signed) signed = "Yes"; else signed = "No";
    if (bookData) {
      if (bookData.numberOfPics) {
        numberOfPics = bookData.numberOfPics;
      }
    }
    if (bookForm.value.publish_date) {
      if (+bookForm.value.publish_date < 2000) vintage = "Yes"; else vintage = "No";
    }

    let item = new BookData(
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

    this.normalizeLine(item);
    this.bookDataService.tableDataSubject.next('cleanUp');
    await this.crudService.writeItem('book', item, fileName);
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
    let numberOfPics: string[] = [];
    let title = data.title;
    let barcode;
    let no = data.no;
    if (Array.isArray(recordForm.value.barcode)) barcode = recordForm.value.barcode[0]; else barcode = recordForm.value.barcode;
    if (recordForm.value.barcode === '') barcode = 'Does not apply';
    if (data) {
      if (data.numberOfPics) {
        numberOfPics = data.numberOfPics;
      }
    }

    let item = new RecordData(
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

    this.normalizeLine(item);
    this.recordDataService.tableDataSubject.next('cleanUp');
    await this.crudService.writeItem('record', item, fileName);
  }

  getDate() {
    let date = new Date().toLocaleDateString();
    date = date.replace(/\s/g, '');
    date = date.slice(0, -1)
    return date;
  }

  normalizeLine(item: BookData | RecordData) {
    for (let prop in item) {
      if (typeof prop === 'string') {
        prop = prop.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
    }
  }
}
