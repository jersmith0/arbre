import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "arbregenealo-e3fa4", appId: "1:511444079745:web:5b1103f60d17587f136980", storageBucket: "arbregenealo-e3fa4.firebasestorage.app", apiKey: "AIzaSyCHu8wyB0DtlVlUeDG6JiovvGn63dkcofA", authDomain: "arbregenealo-e3fa4.firebaseapp.com", messagingSenderId: "511444079745" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())]
};
