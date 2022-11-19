import { Component, Input, OnInit } from '@angular/core';
import { BookData } from 'src/app/shared/book-data.model';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { environment } from 'src/environments/environment';
import { BookDataService } from '../services/book-data.service';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.css']
})
export class BookListComponent implements OnInit {

  @Input() target!: HTMLElement;
  table!: BookData[];
  dir = environment.picsSrc;
  path = "";

  constructor(
    private bookDataService: BookDataService,
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {
    this.openFile();
    this.excelService.forFileInfo('book').subscribe((data: any) => this.path = data.path.split('dataize-main')[1]);
    this.excelService.bookFileSubject.subscribe((data: any) => this.table = data);
  }

  onClick(i: number) {
    this.bookDataService.bookDataSubject.next(this.table[i]);
    this.target.scrollIntoView();
  }

  openFile() {
    this.excelService.forFileInfo('book').subscribe((data: { fileName: string } | any) => {
      this.excelService.openFile('book', data.fileName);
    })
  }
}
