import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookFormComponent } from 'src/app/book/book-form/book-form.component';

@Component({
  selector: 'app-record-form-dialog',
  templateUrl: '../../shared/book-and-record-form-dialog/book-and-record-form-dialog.html',
  styleUrls: ['../../shared/book-and-record-form-dialog/book-and-record-form-dialog.css']
})
export class RecordFormDialogComponent implements OnInit {
  f!: FormGroup

  constructor(
     public dialogRef: MatDialogRef<BookFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.f = new FormGroup({
      'fileName': new FormControl('', Validators.required)
    })
  }
}
