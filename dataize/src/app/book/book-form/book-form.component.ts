import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { BookData } from 'src/app/shared/book-data.model';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { environment } from 'src/environments/environment';
import { BookDataService } from '../services/book-data.service';
import { BookFormService } from '../services/book-form.service';
import { countryList } from '../../shared/countryList';
import { publishers } from "./publishers";
import { CreateDialogComponent } from '../../shared/create-dialog/create-dialog.component';
import { PicturesDialogComponent } from 'src/app/shared/pictures-dialog/pictures-dialog.component';
import { FilesDialogComponent } from 'src/app/shared/files-dialog/files-dialog.component';
import { CrudService } from 'src/app/shared/services/crud.service';


@Component({
  selector: 'app-book-form',
  templateUrl: './book-form.component.html',
  styleUrls: ['./book-form.component.css']
})
export class BookFormComponent implements OnInit, AfterViewInit {
  bookForm = new FormGroup({ language: new FormControl('') });
  condOptions = ["Brand New", "Like New", "Very Good", "Good", "Acceptable"]
  langOptions: string[] = ['English', 'German', 'Spanish'];
  countryOptions: string[] = countryList;
  publishersOptions: string[] = publishers;
  filteredLangOptions!: Observable<string[]>;
  filteredCountryOptions!: Observable<string[]>;
  filteredPublishersOptions!: Observable<string[]>;
  showTable = false;
  fileName = "none";
  filePath = "none";
  pictures = [];
  picsFolderContent: string[] = [];
  selectedItem: number = NaN;
  items!: any;
  tempPictures!: string[];
  bookData = {no: NaN, isbn_13: "", isbn: "", date: "", price: "", customSku: "", numberOfPics: []}
  pathXls = environment.nodeServer + "downloadxls";
  pathTemplate = environment.nodeServer + "downloadtemplate";
  picsDir: string[] = [];

  constructor(
    private bookDataService: BookDataService,
    private bookFormService: BookFormService,
    private crudService: CrudService,
    private excelService: ExcelService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.bookForm = new FormGroup(this.bookFormService.setBookForm());
    this.crudService.getFileInfo('book');

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

    this.crudService.bookFileNameSubject.subscribe((data: string | any) => {
      this.fileName = data.fileName;
      this.filePath = data.path.split('..')[1];
      this.pictures = data.pictures;
    });

    this.bookDataService.cellDataSubject.subscribe((data: any) => {
      let key = Object.keys(data)[0];
      let value = Object.values(data)[0];
      this.bookForm.get(key)?.setValue(value);
    });

    this.bookDataService.bookDataSubject.subscribe((response: BookData | any) => {
      const book = response;
      this.selectedItem = book.no;
      this.bookForm.get("publish_date")?.setValue(book.publish_date);
      this.bookForm.get('country')?.setValue(book.country);
      this.bookForm.get('condition')?.setValue(book.condition);
      this.bookForm.get('title')?.setValue(book.title);
      this.bookForm.get('subtitle')?.setValue(book.subtitle);
      this.bookForm.get('authors')?.setValue(book.authors);
      this.bookForm.get('publishers')?.setValue(book.publishers);
      this.bookForm.get('language')?.setValue(book.language);
      this.bookForm.get('isbn_10')?.setValue(book.isbn_10);
      this.bookForm.get('format')?.setValue(book.format);
      this.bookForm.get('features')?.setValue(book.features);
      this.bookForm.get('edition')?.setValue(book.edition);
      this.bookForm.get('inscribed')?.setValue(book.inscribed);
      this.bookForm.get('signed')?.setValue(book.signed);

      this.bookData = {
        no: book.no,
        isbn_13: book.isbn_13,
        isbn: book.isbn,
        date: book.date,
        price: book.price,
        customSku: book.customSku,
        numberOfPics: book.numberOfPics
      }
    });

    this.crudService.bookFileSubject.subscribe(data => {
      this.items = data;
    })
  }

  ngAfterViewInit(): void {
    this.crudService.getFileNames('pictures').subscribe((folders: any) => this.picsFolderContent = folders)
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();

    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  onBookForm() {
    this.excelService.addBook(this.bookForm, this.fileName, this.bookData);
    this.openFile();
    this.onClear();
    window.scrollTo(0,0);
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
    this.bookData = {
      no: NaN,
      isbn_13: "",
      isbn: "",
      date: "",
      price: "",
      customSku: "",
      numberOfPics: []
    };
    this.selectedItem = NaN;
  }

  onCreateFileDialog(create: boolean) {
    const dialRef = this.dialog.open(CreateDialogComponent, {data: {create: create, folders: this.picsFolderContent}});
    dialRef.afterClosed().subscribe(data => {
      if (data) {
        if (create) {
          this.crudService.createFile("book", data.fileName, data.picturesPath[0]);
        } else {
          this.crudService.createFile("book", "", data.picturesPath[0]);
        }
      }
    });
  }

  onOpenFileDialog() {
    this.crudService.getFileNames('book').pipe(
      map(
        (data: string[] | any) => {
          if (data) {
            for (let i = 0; i < data.length; i++) {
              data[i] = data[i].split('.json')[0];
            }
          }
          return data;
        }
      )
    )
    .subscribe((data: any) => {
      const dialRef = this.dialog.open(FilesDialogComponent, { data: data });
      dialRef.afterClosed().subscribe(
        (data: {file: string, action: string}) => {
        if (data.file && data.action === "open") {
          this.crudService.openFile("book", data.file);
          console.log(data.file);
          return;
        } else if (data.file && data.action === "delete") {
          this.crudService.deleteFile("book", data.file);
          console.log(data.file);
          return;
        } else if (data.file && data.action === 'downloadXlsx') {
          this.download('downloadcsvxlsx', data.file)
        }
      });
    });
  }

  onNumbOfPictures() {
    const dialRef = this.dialog.open(
      PicturesDialogComponent,
      { data: {no: this.bookData.no, selectPictures: [...this.bookData.numberOfPics], path: this.filePath, pictures: this.pictures, items: this.items}}
    );
    dialRef.afterClosed().subscribe(selectedPictures => this.bookData.numberOfPics = selectedPictures);
  }

  download(url: string, fileName: string) {
    this.crudService.download(url, 'book', fileName);
  }

  openFile() {
    this.crudService.forFileInfo('book').subscribe((data: {fileName: string} | any) => {
      this.crudService.openFile('book', data.fileName);
    })
  }

  clearInput(formControllName: string, input: any) {
    this.bookForm.get(formControllName)?.setValue('');
    input.value = '';
  }
}
