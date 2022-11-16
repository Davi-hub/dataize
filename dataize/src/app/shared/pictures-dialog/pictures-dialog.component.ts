import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pictures-dialog',
  templateUrl: './pictures-dialog.component.html',
  styleUrls: ['./pictures-dialog.component.css']
})
export class PicturesDialogComponent implements OnInit {
  dir = environment.picsSrc;
  no!: number;
  path!: string;
  selectedPictures: string[] = [];
  selectPictures: string[] = [];
  pictures: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PicturesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.no = this.data.no;
    console.log(this.no);

    this.path = this.data.path;
    for (let i = 0; i < this.data.items.length; i++) {
      if (this.no) {
        if (this.data.items[i].no == this.no) {
          this.selectPictures.push(...this.data.items[i].numberOfPics);
        } else {
          this.selectedPictures.push(...this.data.items[i].numberOfPics);
        }
      } else {
        this.selectedPictures.push(...this.data.items[i].numberOfPics);
      }
    }
    this.setPictures();
    console.log(this.selectPictures);
    console.log(this.selectedPictures);
    console.log(this.pictures);
  }

  onPicture(picture: any) {
    switch (picture.class) {
      case "selected":
        return;
        break;

      case "no-selected":
        picture.class = "select";
        return;
        break;

      case "select":
        picture.class = "no-selected";
        return;
        break;

      default:
        break;
    }
  }

  setPictures() {
    for (let i = 0; i < this.data.pictures.length; i++) {
      let picture;
      if (this.selectPictures.includes(this.data.pictures[i])) {
        picture = { class: "select", src: this.dir + this.path + this.data.pictures[i] };
      } else if (this.selectedPictures.includes(this.data.pictures[i])) {
        picture = { class: "selected", src: this.dir + this.path + this.data.pictures[i]};
      } else {
        // picture = { class: "no-selected", src: this.dir + this.path + this.data.pictures[i] };
        picture = { class: "no-selected", src: this.dir + this.path + this.data.pictures[i]};
      }
      this.pictures.push(picture);
    }
  }

  onOk() {
    let toSend = []
    for (let i = 0; i < this.pictures.length; i++) {
      if(this.pictures[i].class == 'select') {
        toSend.push(this.pictures[i].src.split(this.path)[1]);
      };
    }
    console.log(toSend);
    this.dialogRef.close(toSend);
  }
}
