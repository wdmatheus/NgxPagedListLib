import { PagedListOptions } from './paged-list.options';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NgxPagedListModule } from './ngx-paged-list.module';
import { takeWhile, finalize, map } from 'rxjs/operators';

export class PagedListService {

  public url: string;
  public sortType: string;
  public sortField: string;
  public pageIndex: number;
  public pageSize: number;
  public onLoadFinished?: Function;
  public onLoadStarts?: Function;

  public itens: any[] = [];
  public loading: boolean = false;
  public error: boolean = false;
  public totalPages: number = 1;
  public totalRecords: number = 0;

  public isAlive: boolean;

  public isPost: boolean;

  private http: HttpClient;

  private options: PagedListOptions;

  private filterData: any = {};


  constructor(options: PagedListOptions) {
    this.http = NgxPagedListModule.injector.get(HttpClient);
    this.url = options.url || '';
    this.sortField = options.sortField || 'Id';
    this.sortType = options.sortType || 'asc';
    this.pageIndex = options.pageIndex || 1;
    this.pageSize = options.pageSize || 20;
    this.onLoadFinished = options.onLoadFinished;
    this.onLoadStarts = options.onLoadStarts;
    this.isAlive = options.isAlive == null ? true : options.isAlive;
    this.isPost = options.isPost;
    this.options = options;
    if (!this.url) {
      throw (new Error('URL is empty'));
    }
  }

  private searchData(data?: any): any {
    this.filterData = data ? {...data} : this.filterData;
    data = data || {};
    Object.assign(data, this.filterData);
    data.pageSize = this.pageSize;
    data.pageIndex = this.pageIndex;
    data.sortField = this.sortField;
    data.sortType = this.sortType;
    return data;
  }

  private reset() {
    this.filterData = {};
    this.sortField = this.options.sortField || 'Id';
    this.sortType = this.options.sortType || 'asc';
    this.pageIndex = 1;
  }

  private createHttpParams(params: {}): HttpParams {
    let httpParams: HttpParams = new HttpParams();
    Object.keys(params).forEach(param => {
        if (params[param] != null) {
            httpParams = httpParams.set(param, params[param]);
        }
    });

    return httpParams;
}

  load(data?: any, isSearch: boolean = false, clear: boolean = false): any {


    if (isSearch || clear) {
      this.reset();
    }

    if (this.pageIndex >= 1 || this.pageIndex <= (this.totalPages || 1)) {
      this.loading = true;
      this.itens = [];

      let observable = this.isPost
        ? this.http.post<any>(this.url, this.searchData(data))
        : this.http.get<any>(`${this.url}`, {
          params: this.createHttpParams(this.searchData(data))
        });

      if(this.onLoadStarts){
        this.onLoadStarts();
      }

      observable.pipe(
        takeWhile(() => this.isAlive),
        finalize(() => this.loading = false),
        map(response => response.data ? response.data : response)
      ).subscribe(response => {
        this.itens = response.itens;
        this.totalPages = response.totalPages;
        this.totalRecords = response.totalRecords;
        this.error = false;
        this.loading = false;
        if (this.onLoadFinished) {
          this.onLoadFinished();
        }
      }, error => {
        this.error = true;
        this.loading = false;
        if (this.onLoadFinished) {
          this.onLoadFinished();
        }
      });
    }
  }

  sort(field: string) {
    this.sortType = this.sortField != field ? 'asc' : this.sortType == 'asc' ? 'desc' : 'asc';
    this.sortField = field;
    this.pageIndex = 1;
    this.load();
  }

  hasPreviousPage() {
    return this.pageIndex > 1;
  }

  hasNextPage() {
    return this.pageIndex < this.totalPages;
  }

  goToFirstPage() {
    if (this.hasPreviousPage()) {
      this.pageIndex = 1;
      this.load();
    }
  }

  goToPreviousPage() {
    if (this.hasPreviousPage()) {
      this.pageIndex = this.pageIndex - 1;
      this.load();
    }
  }

  goToNextPage() {
    if (this.hasNextPage()) {
      this.pageIndex = this.pageIndex + 1;
      this.load();
    }
  }

  goToLastPage() {
    if (this.hasNextPage()) {
      this.pageIndex = this.totalPages;
      this.load();
    }
  }
}
