import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class RecordFormService {
  numberOfPics = new FormControl(6);
  country = new FormControl("United States");
  format = new FormControl("LP");
  genre = new FormControl("");
  year = new FormControl();
  artist = new FormControl("");
  label = new FormControl("");
  release_title = new FormControl("");
  barcode = new FormControl("");
  speed = new FormControl("33 RPM");
  conductor = new FormControl("");
  composer = new FormControl("");

  constructor() { }

  setRecordForm() {
    let recordForm = {
      numberOfPics: this.numberOfPics,
      country: this.country,
      format: this.format,
      genre: this.genre,
      year: this.year,
      artist: this.artist,
      label: this.label,
      release_title: this.release_title,
      barcode: this.barcode,
      speed: this.speed,
      conductor: this.conductor,
      composer: this.composer
    };
    return recordForm;
  }

  clearForm(form: FormGroup) {
    form.get('artist')?.setValue('');
    form.get('release_title')?.setValue('');
    form.get('label')?.setValue('');
    form.get('genre')?.setValue('');
    form.get('year')?.setValue('');
    form.get('numberOfPics')?.setValue(6);
    form.get('country')?.setValue('United States');
    form.get('format')?.setValue('LP');
    form.get('barcode')?.setValue('');
    form.get('composer')?.setValue('');
    form.get('conductor')?.setValue('');
  }
}
