import { NgModule, Injector } from '@angular/core';



@NgModule({
  imports: [
  ],
})
export class NgxPagedListModule {
  constructor(private _injector: Injector) {
    NgxPagedListModule.injector = _injector;
  }
  static injector: Injector = null;
}
