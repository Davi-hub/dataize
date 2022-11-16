import { Component, Input, OnInit } from '@angular/core';
import { BookDataService } from 'src/app/book/services/book-data.service';
import { environment } from 'src/environments/environment';
import { BookData } from '../book-data.model';
import { ExcelService } from '../services/excel.service';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit {
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
