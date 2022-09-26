import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookComponent } from './book/book.component';
import { RecordComponent } from './record/record.component';

const routes: Routes = [
  {path: "", redirectTo: "/books", pathMatch: "full"},
  {path: "books", component: BookComponent},
  {path: "records", component: RecordComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
