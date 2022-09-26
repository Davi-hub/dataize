import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { BookData } from 'src/app/shared/book-data.model';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { environment } from 'src/environments/environment';
import { BookDataService } from '../services/book-data.service';
import { BookFormService } from '../services/book-form.service';
import { BookFormDialogComponent } from './book-form-dialog.component';
import { countryList } from '../../shared/countryList';
import { publishers } from "./publishers";


@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit {
  bookForm = new FormGroup({ language: new FormControl('') });
  condOptions = ["Brand New", "Like New", "Very Good", "Good", "Acceptable"]
  langOptions: string[] = ['English', 'German', 'Spanish'];
  countryOptions: string[] = countryList;
  publishersOptions: string[] = publishers;
  numOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  filteredLangOptions!: Observable<string[]>;
  filteredCountryOptions!: Observable<string[]>;
  filteredPublishersOptions!: Observable<string[]>;
  showTable = false;
  fileName = "none";
  pathCsv = environment.nodeServer + "downloadcsv";
  pathXls = environment.nodeServer + "downloadxls";
  pathTemplate = environment.nodeServer + "downloadtemplate";

  constructor(
    private bookDataService: BookDataService,
    private bookFormService: BookFormService,
    private excelService: ExcelService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.bookForm = new FormGroup(this.bookFormService.setBookForm());
    this.excelService.getFileName('book');

    let languageControl = this.bookForm.get('language');
    this.filteredLangOptions = languageControl!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.langOptions))
    );
    let countryControl = this.bookForm.get('country');
    this.filteredCountryOptions = countryControl!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.countryOptions))
    );

    let publishersControl = this.bookForm.get('publishers');
    this.filteredPublishersOptions = publishersControl!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.publishersOptions))
    );

    this.excelService.bookFileNameSubject.subscribe((data: string | any) => {
      this.fileName = data.fileName
    });

    this.bookDataService.cellDataSubject.subscribe((data: any) => {
      let key = Object.keys(data)[0];
      let value = Object.values(data)[0];
      this.bookForm.get(key)?.setValue(value);
    });

    this.bookDataService.bookDataSubject.subscribe((response: BookData | any) => {
      const book = response;
      this.bookForm.get("publish_date")?.setValue(book.publish_date);
      this.bookForm.get("title")?.setValue(book.title);
      this.bookForm.get("subtitle")?.setValue(book.subtitle);
      this.bookForm.get("authors")?.setValue(book.authors);
      this.bookForm.get("publishers")?.setValue(book.publishers);
      this.bookForm.get("isbn_10")?.setValue(book.isbn_10);
    });
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();

    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  onBookForm() {
    this.excelService.addBook(this.bookForm, this.fileName);
    this.onClear();
  }

  onSearchInTitle(value: string) {
    let keywords = "intitle:" + value;
    this.bookDataService.getGBbyKeyWords(keywords);
  }

  onSearchInAuthor(value: string) {
    let keywords = "inauthor:" + value;
    this.bookDataService.getGBbyKeyWords(keywords);
  }

  onClear() {
    this.bookFormService.clearForm(this.bookForm);
  }

  onCreateFileDialog() {
    const dialRef = this.dialog.open(BookFormDialogComponent);
    dialRef.afterClosed().subscribe(data => {
      if (data) {
        this.excelService.createFile("book", data.fileName);
      }
    });
  }

  onOpenFileDialog() {
    const dialRef = this.dialog.open(BookFormDialogComponent);
    dialRef.afterClosed().subscribe(data => {
      if (data) {
        this.excelService.openFile("book", data.fileName);
      }
    });
  }

  download(url: string, fileName: string){
    this.excelService.download(url, 'book', fileName);
  }

  clearInput(formControllName: string, input: any) {
    this.bookForm.get(formControllName)?.setValue('');
    input.value = '';
  }
}
