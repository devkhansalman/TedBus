import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Navbar } from './Components/navbar/navbar';
import { Footer } from './Components/footer/footer';
import { LandingPage } from './Components/landing-page/landing-page';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Dialog } from './Components/landing-page/dialog/dialog';
import { MatTableModule } from '@angular/material/table';
import { SelectBusPage } from './Components/select-bus-page/select-bus-page';
import { Header } from './Components/select-bus-page/header/header';
import { Right } from './Components/select-bus-page/right/right';
import { Left } from './Components/select-bus-page/left/left';
import { SortingBar } from './Components/select-bus-page/right/sorting-bar/sorting-bar';
import { BusBox } from './Components/select-bus-page/right/bus-box/bus-box';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { BottomTab } from './Components/select-bus-page/right/bus-book/bottom-tab/bottom-tab';
import { ViewSeats } from './Components/select-bus-page/right/view-seats/view-seats';
import { FormDrawer } from './Components/select-bus-page/right/form-drawer/form-drawer';
import { SmallSeats } from './Components/select-bus-page/right/small-seats/small-seats';
import { BusBookingForm } from './Components/select-bus-page/right/bus-booking-form/bus-booking-form';
import { PaymentPage } from './Components/payment-page/payment-page';
import { ProfilePage } from './Components/profile-page/profile-page';
import { MyTrip } from './Components/profile-page/my-trip/my-trip';
import { ReviewModal } from './Components/review-modal/review-modal';
import { WriteReviewModal } from './Components/write-review-modal/write-review-modal';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationPanel } from './Components/notification-panel/notification-panel';

import { HttpClientModule } from '@angular/common/http';
import { provideTranslateService, provideMissingTranslationHandler, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { CustomMissingTranslationHandler } from './service/language.service';

@NgModule({
  declarations: [
    App,
    Navbar,
    Footer,
    LandingPage,
    Dialog,
    SelectBusPage,
    Header,
    Right,
    Left,
    SortingBar,
    BusBox,
    BottomTab,
    ViewSeats,
    FormDrawer,
    SmallSeats,
    BusBookingForm,
    PaymentPage,
    ProfilePage,
    MyTrip,
    ReviewModal,
    WriteReviewModal,
    NotificationPanel,
  ],
  imports: [
    BrowserModule,
    MatIconModule,
    MatTableModule,
    AppRoutingModule,
    MatMenuModule,
    MatDatepickerModule,
    MatInputModule,
    FormsModule,
    MatNativeDateModule,
    MatDialogModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    MatBadgeModule,
    HttpClientModule,
    TranslatePipe,
    TranslateDirective,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideTranslateService({ fallbackLang: 'en', lang: 'en' }),
    provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    provideMissingTranslationHandler(CustomMissingTranslationHandler),
  ],
  bootstrap: [App],
})
export class AppModule {}
