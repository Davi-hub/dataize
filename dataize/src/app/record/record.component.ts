import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.css']
})
export class RecordComponent implements OnInit {
  recordDisplayedColumns: string[] = ['year', 'title', 'artist', 'release_title', 'label', 'genre', 'format', 'country', 'barcode', 'form'];
  demo!: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
