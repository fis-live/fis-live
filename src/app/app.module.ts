import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
//import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { AlertComponent } from './components/ui/alert.component';
import { DropdownComponent } from './components/dropdown.component';
import { ContainerComponent } from './components/container.component';
import { MenuComponent } from './components/menu.component';
import { reducer } from './state/reducers/index';
import { ConnectionEffects } from './state/connection-effects';
import { FisConnectionService } from './services/fis-connection';
import { appRoutes } from './routes';
import { TabComponent } from './components/tab.component';
import { ResultComponent } from './components/result/result.component';
import { WindowSize } from './services/window-size';
import { FilterComponent } from './components/result/filter.component';
import { FocusDirective } from './components/result/focus.directive';
import { IconComponent } from './components/ui/icon.component';
import { SidebarComponent } from './components/sidebar.component';
import { ResultService } from './services/result.service';
import { ScrollbarDirective } from './components/scrollbar.directive';
import { SortDirective } from './components/result/sort.directive';

@NgModule({
    declarations: [
        AppComponent,
        DropdownComponent,
        AlertComponent,
        MenuComponent,
        ContainerComponent,
        TabComponent,
        ResultComponent,
        FilterComponent,
        FocusDirective,
        IconComponent,
        SidebarComponent,
        ScrollbarDirective,
        SortDirective
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        RouterModule.forRoot(appRoutes, { useHash: true }),
        StoreModule.provideStore(reducer),
        EffectsModule.run(ConnectionEffects),
        //StoreDevtoolsModule.instrumentOnlyWithExtension()
    ],
    providers: [ FisConnectionService, WindowSize, ResultService ],
    bootstrap: [ AppComponent ]
})
export class AppModule {

}
