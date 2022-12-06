import { Component, Input, OnInit } from '@angular/core';
import { RecordData } from 'src/app/shared/record-data.model';
import { CrudService } from 'src/app/shared/services/crud.service';
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
  fileName!: string;

  constructor(
    private recordDataService: RecordDataService,
    private crudService: CrudService,
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {
    this.openFile();
    this.crudService.forFileInfo('record').subscribe((data: any) => {
      this.path = data.path.split('dataize')[1];
      this.fileName = data.fileName;
    });
    this.crudService.recordFileSubject.subscribe((data: any) => this.table = data)
  }

  onClick(i: number) {
    this.recordDataService.recordDataSubject.next(this.table[i]);
    this.target.scrollIntoView();
  }

  openFile() {
    this.crudService.forFileInfo('record').subscribe((data: { fileName: string } | any) => {
      this.crudService.openFile('record', data.fileName);
    })
  }

  onDelete(i: number) {
    this.crudService.deleteItem('record', this.fileName, i);
  }
}
