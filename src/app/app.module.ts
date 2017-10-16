import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { AppComponent } from './app.component';
import { AlertComponent } from './components/ui/alert.component';
import { DropdownComponent } from './components/dropdown.component';
import { ContainerComponent } from './components/container.component';
import { MenuComponent } from './components/menu.component';
import { metaReducers, reducers } from './state/reducers/index';
import { ConnectionEffects } from './state/connection-effects';
import { FisConnectionService } from './services/fis-connection';
import { appRoutes } from './routes';
import { TabComponent } from './components/tab.component';
import { DatagridComponent } from './components/datagrid/datagrid.component';
import { WindowSize } from './services/window-size';
import { FilterComponent } from './components/datagrid/filter.component';
import { FocusDirective } from './components/utils/focus.directive';
import { IconComponent } from './components/ui/icon.component';
import { SidebarComponent } from './components/sidebar.component';
import { ResultService } from './services/result.service';
import { ScrollbarDirective } from './components/utils/scrollbar.directive';
import { SortDirective } from './components/datagrid/sort.directive';

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
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
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
