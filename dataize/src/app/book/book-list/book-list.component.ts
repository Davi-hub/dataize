import { Component, Input, OnInit } from '@angular/core';
import { BookData } from 'src/app/shared/book-data.model';
import { CrudService } from 'src/app/shared/services/crud.service';
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
  fileName!: string;

  constructor(
    private bookDataService: BookDataService,
    private crudService: CrudService,
  ) { }

  ngOnInit(): void {
    this.openFile();
    this.crudService.forFileInfo('book').subscribe((data: any) => {
      console.log(data);
      this.path = data.path.split('dataize')[1];
      this.fileName = data.fileName;
    });
    this.crudService.bookFileSubject.subscribe((data: any) => this.table = data);
  }

  onClick(i: number) {
    this.bookDataService.bookDataSubject.next(this.table[i]);
    this.target.scrollIntoView();
  }

  openFile() {
    this.crudService.forFileInfo('book').subscribe((data: { fileName: string } | any) => {
      this.crudService.openFile('book', data.fileName);
    })
  }

  onDelete(i: number) {
    this.crudService.deleteItem('book', this.fileName, i);
  }
}
