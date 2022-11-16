import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordDataService {
  recordDataSubject = new Subject();
  tableDataSubject = new Subject();
  cellDataSubject = new Subject();
  value = 'clear me';

  constructor(private http: HttpClient) { }



  getRecord(input: string) {
    this.http.get(
      'https://api.discogs.com/database/search?q=' +
      input +
      '&key=GQXBeMSKWOkLQlvJlxnU&secret=CtzDXWobNyVRyDeLWrbztUdkuzcgSeAN&' +
      'page=1&per_page=10')
      .pipe(map((data: any) => {
        let results = data.results;
        for (let i = 0; i < results.length; i++) {
          for (let j = 0; j < results[i].genre.length; j++) {
            if (results[i].genre[j] ==="Children's") {
              results[i].genre[j] ="Children's Music";
            }
            if (results[i].genre[j] ==="Folk, World, & Country") {
              results[i].genre[j] ="Folk";
              results[i].genre.push("Country", "World Music");
            }
            if (results[i].genre[j] ==="Non-Music") {
              results[i].genre[j] ="Comedy & Spoken Word";
              results[i].genre.push("Sound Effects & Nature");
            }
            if (results[i].genre[j] ==="Funk / Soul") {
              results[i].genre[j] ="Funk";
              results[i].genre.push("Soul");
            }
            if (results[i].genre[j] ==="Brass & Military") {
              results[i].genre[j] ="Military";
            }
            if (results[i].genre[j] ==="Hip-Hop" || results[i].genre[j] ==="Hip Hop") {
              results[i].genre[j] ="Rap & Hip-Hop";
            }
            if (results[i].genre[j] ==="Stage & Screen") {
              results[i].genre[j] ="Soundtracks & Musicals";
            }
          }
        }
        return results;
      }))
      .subscribe((data: any) => {

        if (+data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            let record = this.analyzeData(data[i]);
            this.tableDataSubject.next(record);
          }
        } else {
          this.tableDataSubject.next('No results');
        }
      })
  }

  analyzeData(record: any) {
    let title = "";
    let release_title = "";
    let artist = "";
    let country = "";
    let genre = "";
    let year = "";
    let label = "";
    let barcode = "";
    let format = [];
    let format_hint = "";
    let format_quantity = "";

    if (record.title) {
      title = record.title;
    }

    if (record.year) {
      year = record.year;
    }
    if (record.genre) {
      genre = record.genre[0];
    }
    if (record.format_quantity) {
      format_quantity = record.format_quantity;
    }
    if (record.format) {
      format = record.format;
    }


    if (record.format) {
      if (record.format.length === 1) {
        format_hint = record.format[0];
      }
      if (record.format.length > 1) {
        if (record.format[0]) {
          format_hint = record.format[0];
          for (let i = 1; i < record.format.length; i++) {
            format_hint = format_hint + "; " + record.format[i];
          }
        }
      }
    }

    if (record.label) {
      if (record.label.length === 1) {
        label = record.label[0];
      }
      if (record.label.length > 1) {
        if (record.label[0]) {
          label = record.label[0];
          for (let i = 1; i < record.label.length; i++) {
            label = label + "; " + record.label[i];
          }
        }
      }
    }

    if (record.country) {
      switch (record.country) {
        case 'US':
          country = 'United States';
          break
        case 'UK':
          country = 'United Kingdom';
          break
        default:
          country = record.country;
          break;
      }
    }

    if (record.barcode) {
      if (record.barcode.length === 1) {
        barcode = record.barcode[0];
      }
      if (record.barcode.length > 1) {
        if (record.barcode[0]) {
          barcode = record.barcode[0];
          for (let i = 1; i < record.barcode.length; i++) {
            barcode = barcode + "; " + record.barcode[i];
          }
        }
      }
    }

    artist = title.split(' - ')[0];
    release_title = title.split(' - ')[1];

    const recordData = {
      year: year,
      title: title,
      artist: artist,
      release_title: release_title,
      country: country,
      format: format,
      genre: genre,
      label: label,
      barcode: barcode,
      format_quantity: format_quantity,
      form: '=>'
    }

    return recordData;
  }
}
