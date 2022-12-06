import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  bookFileSubject = new Subject();
  recordFileSubject = new Subject();
  bookFileNameSubject = new Subject();
  bookFileNamesSubject = new Subject();
  recordFileNameSubject = new Subject();
  recordFileNamesSubject = new Subject();
  headers = new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' });

  constructor(
    private http: HttpClient,
    private matSnackBar: MatSnackBar

  ) { }

  async createFile(item: string, fileName: string | null, path: string) {
    this.postToServer('createfile', item, { fileName: fileName, path: path });
  }

  async openFile(itemType: string, fileName: string) {
    this.postToServer2('openfile', itemType, { fileName: fileName })
      .pipe(
        map(
          async (res: any) => {
            let newRes = await res;
            if (newRes.data) {
              newRes.data = JSON.parse(newRes.data)

              for (let i = 0; i < newRes.data.length; i++) {
                newRes.data[i] = { no: i + 1, ...newRes.data[i] };
              }
            }

            return newRes;
          }
        ))
      .subscribe(
        async (res: any) => {
          let newRes = await res;
          console.log(newRes);
          if (itemType == 'book') {
            this.bookFileSubject.next(newRes.data);
          }
          if (itemType == 'record') {
            this.recordFileSubject.next(newRes.data);
          }
          this.getFileInfo(itemType);
        }
      );
  }

  async writeItem(itemType: string, line: any, fileName: string) {
    this.postToServer('writeline', itemType, { line: line, fileName: fileName })
  }

  async updatePicsPath(item: string, path: string) {
    this.postToServer('updatePicsPath', item, { path: path });
  }

  async deleteItem(itemType: string, fileName: string, index: number) {
    this.postToServer2('deleteitem', itemType, { fileName: fileName, index: index })
    .pipe(
      map(
        async (res: any) => {
          let newRes = await res;
          if (newRes.data) {
            newRes.data = JSON.parse(newRes.data)

            for (let i = 0; i < newRes.data.length; i++) {
              newRes.data[i] = { no: i + 1, ...newRes.data[i] };
            }
          }

          return newRes;
        }
      ))
    .subscribe(
      async (res: any) => {
        let newRes = await res;
        console.log(newRes);
        if (itemType == 'book') {
          this.bookFileSubject.next(newRes.data);
        }
        if (itemType == 'record') {
          this.recordFileSubject.next(newRes.data);
        }
        this.getFileInfo(itemType);
      }
    );
  }

  async deleteFile(itemType: string, fileName: string) {
    this.postToServer('deletefile', itemType, { fileName: fileName });
  }

  async postToServer(url: string, item: string, data: Object) {
    this.http.post(environment.nodeServer + url, { ...data, item: item }, { headers: this.headers })
      .subscribe(
        async (res: string | any) => {
          let newRes = await res;
          this.getFileInfo(item);
          if (item == 'book') {
            console.log(data);
            this.bookFileNameSubject.next(data);
          }
          if (item == 'record') {
            this.recordFileNameSubject.next(data);
          }
          this.getMatSnackBar(newRes.message);
        },
        err => {
          if (err.status != 200) {
            this.getMatSnackBar('Error');
          }
        }
      );
  }

  postToServer2(url: string, item: string, data: Object) {
    return this.http.post(environment.nodeServer + url, { ...data, item: item }, { headers: this.headers });
  }

  async getFileInfo(item: string) {
    this.forFileInfo(item).subscribe((data: any) => {
      if (item == 'book') {
        console.log(data);
        this.bookFileNameSubject.next(data);
      }
      if (item == 'record') {
        this.recordFileNameSubject.next(data);
      }
    },
      (err) => {
        if (err.errno = -2) this.getMatSnackBar("Folder not found!");
      }
    )
  }

  forFileInfo(item: string) {
    let params = new HttpParams().set('item', item)
    return this.http.get(environment.nodeServer + 'getfileinfo', { params: params });
  }

  getFileNames(path: string) {
    let params = new HttpParams().set('path', path);
    return this.http.get(environment.nodeServer + 'getfilenames', { params: params });
  }

  getMatSnackBar(message: string) {
    this.matSnackBar.open(message, 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  download(url: string, item: string, fileName: string) {
    this.http.post(environment.nodeServer + url, { fileName: fileName, item: item }, { headers: this.headers, responseType: "blob" })
      .subscribe(data => {
        let downLoadUrl = window.URL.createObjectURL(data);
        let a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
        a.href = downLoadUrl;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      });
  }
}
