import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RecordDataService } from '../services/record-data.service';

@Component({
  selector: 'app-record-search',
  templateUrl: './record-search.component.html',
  styleUrls: ['./record-search.component.css']
})
export class RecordSearchComponent implements OnInit {
  searchForm!: FormGroup;

  constructor(public recordDataService: RecordDataService) { }

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      search: new FormControl('', {validators: [Validators.minLength(4)]})
    });
  }

  onSearch() {
    const text = this.searchForm.value.search;
    this.recordDataService.getRecord(text);
    this.recordDataService.tableDataSubject.next('cleanUp');
    this.searchForm.reset();
  }
}
