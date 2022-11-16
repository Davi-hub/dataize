import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookFormComponent } from '../book-form.component';

@Component({
  selector: 'app-create-dialog',
  templateUrl: './create-dialog.component.html',
  styleUrls: ['./create-dialog.component.css']
})
export class CreateDialogComponent implements OnInit {
  create = false;
  f!: FormGroup

  constructor(
     public dialogRef: MatDialogRef<BookFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.f = new FormGroup({
      'picturesPath': new FormControl('', Validators.required)
    });

    if (this.data.create) {
      this.create = true;
      this.f.addControl('fileName', new FormControl('', Validators.required));
    }
  }

}
