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
  dataSource: any[] = [];
  dataCombed: BookData = {publish_date: '', title: '', subtitle: '', authors: '', publishers: '', language: '', isbn_10: '', isbn_13: '', engine: 'combed'};

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
    let dataOne = dataSource[0];
    let dataTwo = dataSource[1];

    for (let i = 0; i < Object.values(dataOne).length; i++) {
      let dataKey = Object.keys(this.dataCombed)[i]
      if (Object.values(dataOne)[i] === Object.values(dataTwo)[i]) {
        this.dataCombed[dataKey as keyof BookData] = Object.values(dataOne)[i];
      } else if (Object.values(dataOne)[i] !== '' && Object.values(dataTwo)[i] === '') {
        this.dataCombed[dataKey as keyof BookData] = Object.values(dataOne)[i];
      } else if (Object.values(dataTwo)[i] !== '' && Object.values(dataOne)[i] === '') {
        this.dataCombed[dataKey as keyof BookData] = Object.values(dataTwo)[i];
      } else {
        this.dataCombed[dataKey as keyof BookData] = Object.values(dataOne)[i];
      }
    }

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
      let newElement = { ...element }
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
