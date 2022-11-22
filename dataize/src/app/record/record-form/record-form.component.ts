import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { environment } from 'src/environments/environment';
import { RecordDataService } from '../services/record-data.service';
import { RecordFormService } from '../services/record-form.service';
import { genresList } from './genres';
import { countryList } from '../../shared/countryList';
import { CreateDialogComponent } from 'src/app/shared/create-dialog/create-dialog.component';
import { FilesDialogComponent } from 'src/app/shared/files-dialog/files-dialog.component';
import { PicturesDialogComponent } from 'src/app/shared/pictures-dialog/pictures-dialog.component';

@Component({
  selector: 'app-record-form',
  templateUrl: './record-form.component.html',
  styleUrls: ['./record-form.component.css']
})
export class RecordFormComponent implements OnInit, AfterViewInit {

  recordForm = new FormGroup({});
  numOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  countryOptions: string[] = [...countryList];
  filteredCountryOptions!: Observable<string[]>;
  showTable = false;
  fileName = "none";
  filePath = "none";
  pictures = [];
  picsFolderContent: string[] = [];
  selectedItem: number = NaN;
  rawText!: string;
  formatHint!: string;
  countryHint!: string;
  speedHint!: string;
  pathCsv = environment.nodeServer + "downloadcsv";
  pathXls = environment.nodeServer + "downloadxls";
  pathTemplate = environment.nodeServer + "downloadtemplate";
  genres = genresList;
  recordData = {numberOfPics: [], no: NaN, title: ""};
  items!: any;

  @ViewChild('genreInput') genreInput!: ElementRef<HTMLInputElement>;

  constructor(
    private recordDataService: RecordDataService,
    private recordFormService: RecordFormService,
    private excelService: ExcelService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.recordForm = new FormGroup(this.recordFormService.setRecordForm());
    let countryControl = this.recordForm.get('country');
    this.filteredCountryOptions = countryControl!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.countryOptions))
    );

    this.excelService.getFileInfo('record');
    this.excelService.recordFileNameSubject.subscribe((data: string | any) => {
      this.fileName = data.fileName;
      this.filePath = data.path.split('dataize-main')[1] + "/";
      this.pictures = data.pictures;
      console.log(this.filePath);
      console.log(this.pictures);
    });
    this.recordDataService.cellDataSubject.subscribe((data: any) => {
      let key = Object.keys(data)[0];
      let value = Object.values(data)[0];
      this.recordForm.get(key)?.setValue(value);
    });
    this.recordDataService.recordDataSubject.subscribe((response: any) => {
      const record = response;
      this.formatHint = record.format_hint;
      this.countryHint = record.country;
      this.recordData = {
        no: record.no,
        numberOfPics: record.numberOfPics,
        title: record.title
      }
      this.selectedItem = record.no;

      this.recordForm.get("speed")?.setValue(record.speed);
      this.recordForm.get("format")?.setValue(record.format);
      this.recordForm.get("country")?.setValue(record.country);
      this.recordForm.get("genre")?.setValue(record.genre);
      this.recordForm.get("year")?.setValue(record.year);
      this.recordForm.get("artist")?.setValue(record.artist);
      this.recordForm.get("label")?.setValue(record.label);
      this.recordForm.get("release_title")?.setValue(record.release_title);
      this.recordForm.get("barcode")?.setValue(record.barcode);
      this.recordForm.get("composer")?.setValue(record.composer);
      this.recordForm.get("conductor")?.setValue(record.conductor);
      this.recordData = {no: record.no, numberOfPics: record.numberOfPics, title: record.title}
    });

    this.excelService.recordFileSubject.subscribe(data => {
      this.items = data;
    })
  }

  ngAfterViewInit(): void {
      this.excelService.getFileNames('pictures').subscribe((folders: any) => this.picsFolderContent = folders)
  }

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  onRecordForm() {
    if (this.recordForm.get("genre")?.value instanceof Array) {
      this.recordForm.get("genre")?.setValue(this.recordForm.get("genre")?.value[0])
    }
    this.excelService.addRecord(this.recordForm, this.recordData, this.fileName);
    this.openFile();
    this.onClear();
    window.scrollTo(0,0);
  }

  onSearchInTitle(value: string) {
    let keywords = "intitle:" + value;
    this.recordDataService.getRecord(keywords);
  }

  onSearchInAuthor(value: string) {
    let keywords = "inauthor:" + value;
    this.recordDataService.getRecord(keywords);
  }

  onClear() {
    this.recordFormService.clearForm(this.recordForm);
  }

  onCreateFileDialog(create: boolean) {
    const dialRef = this.dialog.open(CreateDialogComponent, { data: { create: create , folders: this.picsFolderContent} });
    dialRef.afterClosed().subscribe(data => {
      if (data) {
        if (create) {
          this.excelService.createFile("record", data.fileName, data.picturesPath);
        }
      }
    });
  }

  onOpenFileDialog() {
    this.excelService.getFileNames('record').pipe(
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
    ).subscribe((data: any) => {
      const dialRef = this.dialog.open(FilesDialogComponent, { data: data });
      dialRef.afterClosed().subscribe(
        (data: { file: string, action: string }) => {
          if (data.file && data.action === "open") {
            this.excelService.openFile("record", data.file);
            return;
          } else if (data.file && data.action === 'downloadXlsx') {
            this.download('downloadcsvxlsx', data.file)
          } else if (data.file && data.action === 'downloadCsv') {
            this.download('downloadcsvxlsx', data.file + '.csv')
          }
        });
    });
  }

  clearInput(formControllName: string, input: any) {
    this.recordForm.get(formControllName)?.setValue('');
    input.value = '';
    this.selectedItem = NaN;
  }

  download(url: string, fileName: string) {
    this.excelService.download(url, 'record', fileName);
  }

  openFile() {
    this.excelService.forFileInfo('record').subscribe((data: {fileName: string} | any) => {
      console.log(data);
      this.excelService.openFile('record', data.fileName);
    })
  }

  onNumbOfPictures() {
    const dialRef = this.dialog.open(
      PicturesDialogComponent,
      { data: {no: this.recordData.no, selectPictures: [...this.recordData.numberOfPics], path: this.filePath, pictures: this.pictures, items: this.items}}
    );
    dialRef.afterClosed().subscribe(selectedPictures => this.recordData.numberOfPics = selectedPictures);
  }
}
