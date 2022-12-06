export class RecordData {
  constructor(
    public date: string,
    public numberOfPics: string[],
    public title: string,
    public barcode: string,
    public composer: string,
    public artist: string,
    public conductor: string,
    public release_title: string,
    public format: string,
    public genre: string,
    public label: string,
    public speed: string,
    public year: string,
    public country: string,
    public form: string,
    public no?: number
  ) { }
}
