import { NgModule } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';

export const COMPONENTS = [InputTextModule];

@NgModule({
  imports: COMPONENTS,
  exports: COMPONENTS
})
export class PrimengModule {}
