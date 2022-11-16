import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookComponent } from './book/book.component';
import { BookFormComponent } from './book/book-form/book-form.component';
import { BookSearchComponent } from './book/book-search/book-search.component';
import { BookFormDialogComponent } from './book/book-form/book-form-dialog.component';

import { RecordComponent } from './record/record.component';
import { RecordFormComponent } from './record/record-form/record-form.component';
import { RecordFormDialogComponent } from './record/record-form/record-form-dialog.component';
import { RecordSearchComponent } from './record/record-search/record-search.component';
// import { DownloadDirective } from './shared/directives/download.directive';
import { ResultTableComponent } from './shared/result-table/result-table.component';
import { DataTableComponent } from './shared/data-table/data-table.component';
import { CreateDialogComponent } from './book/book-form/create-dialog/create-dialog.component';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { PicturesDialogComponent } from './shared/pictures-dialog/pictures-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    // DownloadDirective,
    ResultTableComponent,

    BookComponent,
    BookFormComponent,
    BookSearchComponent,
    BookFormDialogComponent,

    RecordComponent,
    RecordFormComponent,
    RecordSearchComponent,
    RecordFormDialogComponent,
    DataTableComponent,
    CreateDialogComponent,
    PicturesDialogComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatToolbarModule,
    MatTabsModule,
    MatListModule,
    MatExpansionModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [BookFormDialogComponent, RecordFormDialogComponent]
})
export class AppModule { }
