import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/Lara';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    MessageService,    
    ConfirmationService  ,
    DialogService,
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset:Lara ,        // Lara, Aura, Material یا Nora
        options: {
          prefix: 'p',     
          darkModeSelector: 'system' // یا 'light' | 'dark'
        }
      }
    }),

    MessageService,
    ConfirmationService,
    DialogService,
  ]
};