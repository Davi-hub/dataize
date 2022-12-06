import { Component, Input, OnInit } from '@angular/core';
import { BookDataService } from 'src/app/book/services/book-data.service';
import { RecordDataService } from '../../record/services/record-data.service';
import { BookData } from '../book-data.model';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.css']
})
export class ResultTableComponent implements OnInit {
  @Input() item!: string;
  @Input() displayedColumns: string[] = [];
  dataSource: BookData[] = [];
  dataCombed: BookData = new BookData('','','','','','','','','','','','',[],'','Very Good','','United States','Paperback','','','','','',"=>");

  constructor(private bookDataService: BookDataService, private recordDataService: RecordDataService) { }

  ngOnInit(): void {
    this.bookDataService.tableDataSubject.subscribe((data: BookData | any) => {
      if(data === 'cleanUp') {
        this.dataSource = [];
      } else {

        this.dataSource.push(data);
        if(this.dataSource.length > 1 && this.dataSource[0].engine !== 'GKeywords') {
          if(this.dataSource[0].engine === 'OL') {
            let elem: any = this.dataSource.shift();
            this.dataSource.push(elem);
          }
          this.combResults(this.dataSource);
        }
      }
      this.dataSource = [...this.dataSource];
    });

    this.recordDataService.tableDataSubject.subscribe((data: any) => {
      if (data === 'cleanUp') {
        this.dataSource = [];
      } else {
        this.dataSource.push(data);
      }
      this.dataSource = [...this.dataSource];
    });

  }

  combResults(dataSource: BookData[]) {
    let dataOne: BookData = dataSource[0];
    let dataTwo: BookData = dataSource[1];
    let keys = Object.keys(dataOne);
    console.log(keys);


    for (let i = 0; i < keys.length; i++) {
      if ((dataOne as any)[keys[i]] === (dataTwo as any)[keys[i]]) {
        (this.dataCombed as any)[keys[i]] = (dataOne as any)[keys[i]];
      } else if ((dataOne as any)[keys[i]] !== '' && (dataTwo as any)[keys[i]] === '') {
        (this.dataCombed as any)[keys[i]] = (dataOne as any)[keys[i]];
      } else if ((dataTwo as any)[keys[i]] !== '' && (dataOne as any)[keys[i]] === '') {
        (this.dataCombed as any)[keys[i]] = (dataTwo as any)[keys[i]];
      } else {
        (this.dataCombed as any)[keys[i]] = (dataOne as any)[keys[i]];
      }
    }
    console.log(this.dataCombed);

    this.bookDataService.bookDataSubject.next(this.dataCombed);
  }

  pushContToForm(element: any, str: string) {
    if (this.item === 'book') {
      this.bookPushContToForm(element, str);
      return;
    }
    if (this.item === 'record') {
      this.recordPushContToForm(element, str);
      return;
    }
  }

  bookPushContToForm(element: any, str: string) {
    let el = {[str]: element[str]};
    if (str === 'form') {
      this.bookDataService.bookDataSubject.next(element);
    } else if (str === 'isbn_13') {
      this.bookDataService.cellDataSubject.next({isbn_10: el.isbn_13});
    } else {
      this.bookDataService.cellDataSubject.next(el);
    }
  }

  recordPushContToForm(element: any, str: string) {
    let el = { [str]: element[str] };
    if (str === 'form') {
      let newElement = { ...element };
      console.log(newElement);

      newElement.label = newElement.label.split(';')[0];
      if (newElement.barcode.length > 1) {
        newElement.barcode = newElement.barcode.split(';')[0] + ";" + newElement.barcode.split(';')[1];
      }
      newElement.title = newElement.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      newElement.label = newElement.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      newElement.artist = newElement.artist.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      newElement.release_title = newElement.release_title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      this.recordDataService.recordDataSubject.next(newElement);
    } else {
      if (typeof el[str] === 'string') {
        el[str] = el[str].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }
      this.recordDataService.cellDataSubject.next(el);
    }
  }
}
