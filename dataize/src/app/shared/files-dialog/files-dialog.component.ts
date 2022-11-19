import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookFormComponent } from 'src/app/book/book-form/book-form.component';

@Component({
  selector: 'app-files-dialog',
  templateUrl: './files-dialog.component.html',
  styleUrls: ['./files-dialog.component.css']
})
export class FilesDialogComponent implements OnInit {

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
