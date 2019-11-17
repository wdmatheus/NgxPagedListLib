export class PagedListOptions{
  url?: string;
  sortType?: string;
  sortField?: string;
  pageIndex?: number;
  pageSize?: number;
  onLoadFinished?: Function;
  onLoadStarts?: Function;
  isAlive?:boolean = true;
  isPost?: boolean = false;
}
