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
import { ContainerComponent } from './components/container.component';
import { DatagridSettingsComponent } from './components/datagrid/datagrid-settings.component';
import { DatagridWrapper } from './components/datagrid/datagrid-wrapper';
import { DatagridComponent } from './components/datagrid/datagrid.component';
import { FilterComponent } from './components/datagrid/filter.component';
import { DatagridHeader } from './components/datagrid/header/datagrid-header.component';
import { SortDirective } from './components/datagrid/sort.directive';
import { MenuComponent } from './components/menu.component';
import { SelectComponent } from './components/select/select';
import { SidebarComponent } from './components/sidebar.component';
import { AlertComponent } from './components/ui/alert.component';
import { IconComponent } from './components/ui/icon.component';
import { FocusDirective } from './components/utils/focus.directive';
import { ScrollbarDirective } from './components/utils/scrollbar.directive';
import { appRoutes } from './routes';
import { ConnectionEffects } from './state/connection-effects';
import { metaReducers, reducers } from './state/reducers';

@NgModule({
    declarations: [
        AlertComponent,
        AppComponent,
        ContainerComponent,
        DatagridComponent,
        DatagridHeader,
        DatagridSettingsComponent,
        FilterComponent,
        FocusDirective,
        IconComponent,
        MenuComponent,
        ScrollbarDirective,
        SelectComponent,
        SidebarComponent,
        SortDirective,
        DatagridWrapper
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        CdkTableModule,
        FormsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes, { useHash: true }),
        StoreModule.forRoot(reducers, {
            runtimeChecks: {
                strictStateImmutability: true,
                strictActionImmutability: true,
                strictStateSerializability: true,
                strictActionSerializability: true,
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
