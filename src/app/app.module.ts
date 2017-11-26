import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { AppComponent } from './app.component';
import { ContainerComponent } from './components/container.component';
import { DatagridHeaderComponent } from './components/datagrid/datagrid-header.component';
import { DatagridSettingsComponent } from './components/datagrid/datagrid-settings.component';
import { DatagridComponent } from './components/datagrid/datagrid.component';
import { FilterComponent } from './components/datagrid/filter.component';
import { SortDirective } from './components/datagrid/sort.directive';
import { DropdownItemDirective } from './components/dropdown/dropdown-item.directive';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { MenuComponent } from './components/menu.component';
import { SidebarComponent } from './components/sidebar.component';
import { TabComponent } from './components/tab.component';
import { AlertComponent } from './components/ui/alert.component';
import { IconComponent } from './components/ui/icon.component';
import { FocusDirective } from './components/utils/focus.directive';
import { ScrollbarDirective } from './components/utils/scrollbar.directive';
import { appRoutes } from './routes';
import { FisConnectionService } from './services/fis-connection';
import { ResultService } from './services/result.service';
import { WindowSize } from './services/window-size';
import { ConnectionEffects } from './state/connection-effects';
import { metaReducers, reducers } from './state/reducers';

@NgModule({
    declarations: [
        AppComponent,
        DropdownComponent,
        AlertComponent,
        MenuComponent,
        ContainerComponent,
        TabComponent,
        DatagridComponent,
        FilterComponent,
        FocusDirective,
        IconComponent,
        SidebarComponent,
        ScrollbarDirective,
        SortDirective,
        DatagridHeaderComponent,
        DropdownItemDirective,
        DatagridSettingsComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, { useHash: true }),
        StoreModule.forRoot(reducers, { metaReducers: metaReducers }),
        EffectsModule.forRoot([ConnectionEffects])
    ],
    providers: [ FisConnectionService, WindowSize, ResultService ],
    bootstrap: [ AppComponent ]
})
export class AppModule {

}
