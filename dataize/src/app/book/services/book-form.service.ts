import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookFormService {
  numberOfPics = new FormControl(6);
  publish_date = new FormControl('');
  country = new FormControl('United States');
  condition = new FormControl('Very Good');
  title = new FormControl('');
  subtitle = new FormControl('');
  authors = new FormControl('');
  publishers = new FormControl('');
  language = new FormControl('English');
  isbn_10 = new FormControl('');
  format = new FormControl('Paperback');
  features = new FormControl('');
  edition = new FormControl('');
  inscribed = new FormControl('');
  signed = new FormControl('');

  constructor() {}

  setBookForm() {
    let bookForm = {
      numberOfPics: this.numberOfPics,
      publish_date: this.publish_date,
      country: this.country,
      condition: this.condition,
      title: this.title,
      subtitle: this.subtitle,
      authors: this.authors,
      publishers: this.publishers,
      language: this.language,
      isbn_10: this.isbn_10,
      format: this.format,
      features: this.features,
      edition: this.edition,
      inscribed: this.inscribed,
      signed: this.signed
    };
    return bookForm
  }

  clearForm(form: FormGroup) {
    form.get('numberOfPics')?.setValue(6);
    form.get('publish_date')?.setValue('');
    form.get('country')?.setValue('United States');
    form.get('condition')?.setValue('Very Good');
    form.get('title')?.setValue('');
    form.get('subtitle')?.setValue('');
    form.get('authors')?.setValue('');
    form.get('publishers')?.setValue('');
    form.get('language')?.setValue('English');
    form.get('isbn_10')?.setValue('');
    form.get('format')?.setValue('Paperback');
    form.get('features')?.setValue('');
    form.get('edition')?.setValue('');
    form.get('inscribed')?.setValue('');
    form.get('signed')?.setValue('');
  }
}
