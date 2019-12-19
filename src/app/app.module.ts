import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
// import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { AlertComponent } from './core/alert/alert.component';
import { ContainerComponent } from './core/container.component';
import { HeaderComponent } from './core/header/header.component';
import { IconComponent } from './core/icon/icon.component';
import { SelectComponent } from './core/select/select';
import { SidebarComponent } from './core/sidebar/sidebar.component';
import { DatagridSettingsComponent } from './datagrid/datagrid-settings.component';
import { DatagridComponent } from './datagrid/datagrid.component';
import { FilterComponent } from './datagrid/filter.component';
import { DatagridHeader } from './datagrid/header/datagrid-header.component';
import { SortDirective } from './datagrid/sort.directive';
import { DatagridWrapper } from './datagrid/wrapper/datagrid-wrapper';
import { appRoutes } from './routes';
import { ConnectionEffects } from './state/connection-effects';
import { metaReducers, reducers } from './state/reducers';
import { FocusDirective } from './utils/focus.directive';
import { ScrollbarDirective } from './utils/scrollbar.directive';

@NgModule({
    declarations: [
        AlertComponent,
        AppComponent,
        ContainerComponent,
        DatagridComponent,
        DatagridHeader,
        DatagridSettingsComponent,
        DatagridWrapper,
        FilterComponent,
        FocusDirective,
        HeaderComponent,
        IconComponent,
        ScrollbarDirective,
        SelectComponent,
        SidebarComponent,
        SortDirective
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
        // StoreDevtoolsModule.instrument(),
        EffectsModule.forRoot([ConnectionEffects])
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {

}
