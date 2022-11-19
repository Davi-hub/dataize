export class RecordData {
  constructor(
    public publish_date: string | number,
    public title: string,
    public subtitle: string,
    public authors: string,
    public publishers: string,
    public language: string,
    public no?: number | string,
    public isbn_10?: string,
    public isbn_13?: string,
    public isbn?: string,
    public engine?: string,
    public date?: string,
    public numberOfPics?: string[],
    public price?: string,
    public condition?: string,
    public customSku?: string,
    public country?: string,
    public format?: string,
    public features?: string,
    public edition?: string,
    public inscribed?: string,
    public signed?: string,
    public vintage?: string,
    public form?: string,
  ) { }
}
