import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { devModules } from '../environments/environment';

import { AppComponent } from './app.component';
import { AlertComponent } from './core/alert/alert.component';
import { ContainerComponent } from './core/container.component';
import { HeaderComponent } from './core/header/header.component';
import { IconComponent } from './core/icon/icon.component';
import { SelectComponent } from './core/select/select';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { Datagrid } from './datagrid/datagrid';
import { DatagridSettings } from './datagrid/datagrid-settings';
import { DatagridFilter } from './datagrid/filter/datagrid-filter';
import { DatagridHeader } from './datagrid/header/datagrid-header';
import { DatagridSort } from './datagrid/sort/datagrid-sort';
import { DatagridTicker } from './datagrid/ticker/datagrid-ticker';
import { DatagridWrapper } from './datagrid/wrapper/datagrid-wrapper';
import { FormatNamePipe } from './fis/format-name.pipe';
import { appRoutes } from './routes';
import { ConnectionEffects } from './state/connection-effects';
import { metaReducers, reducers } from './state/reducers';
import { FocusDirective } from './utils/focus.directive';

@NgModule({
    declarations: [
        AlertComponent,
        AppComponent,
        ContainerComponent,
        Datagrid,
        DatagridFilter,
        DatagridHeader,
        DatagridSettings,
        DatagridSort,
        DatagridTicker,
        DatagridWrapper,
        FocusDirective,
        HeaderComponent,
        IconComponent,
        SelectComponent,
        SidebarComponent,
        FormatNamePipe
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        CdkTableModule,
        DragDropModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes, { useHash: true }),
        StoreModule.forRoot(reducers, {
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
                strictStateSerializability: true,
                strictActionSerializability: true
            },
            metaReducers: metaReducers
        }),
        EffectsModule.forRoot([ConnectionEffects]),
        NgScrollbarModule.withConfig({
            track: 'all',
            visibility: 'hover'
        }),
        ReactiveComponentModule,
        devModules
    ],
    providers: [
        Title
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {

}
