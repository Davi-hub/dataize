import { HtmlTagDefinition } from "@angular/compiler";

export class BookData {
  constructor(
    public publish_date: string,
    public title: string,
    public subtitle: string,
    public authors: string,
    public publishers: string,
    public language: string,
    public isbn_10: string,
    public isbn_13: string,
    public engine: string,
    public form?: string
  ) {

  }
}
