import { Component, Input, OnInit } from '@angular/core';
import { RecordData } from 'src/app/shared/record-data.model';
import { ExcelService } from 'src/app/shared/services/excel.service';
import { environment } from 'src/environments/environment';
import { RecordDataService } from '../services/record-data.service';

@Component({
  selector: 'app-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css']
})
export class RecordListComponent implements OnInit {

  @Input() target!: HTMLElement;
  table!: RecordData[];
  dir = environment.picsSrc;
  path = "";

  constructor(
    private bookDataService: RecordDataService,
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {
    this.openFile();
    this.excelService.forFileInfo('record').subscribe((data: any) => this.path = data.path.split('dataize-main')[1]);
    this.excelService.recordFileSubject.subscribe((data: any) => this.table = data);
  }

  onClick(i: number) {
    this.bookDataService.recordDataSubject.next(this.table[i]);
    this.target.scrollIntoView();
  }

  openFile() {
    this.excelService.forFileInfo('record').subscribe((data: { fileName: string } | any) => {
      this.excelService.openFile('record', data.fileName);
    })
  }
}
