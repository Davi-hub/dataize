import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookFormComponent } from './book-form.component';

@Component({
  selector: 'app-book-form-dialog',
  templateUrl: './book-form-dialog.component.html',
  styleUrls: ['./book-form-dialog.component.css']
})
export class BookFormDialogComponent implements OnInit {
  files!: string[];
  selectedFile!: string;

  constructor(
     public dialogRef: MatDialogRef<BookFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[],
  ) { }

  ngOnInit(): void {
    this.files = this.data;
  }

  onClick(file: string) {
    this.selectedFile = file;
  }
}
