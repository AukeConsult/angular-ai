import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient } from '@angular/common/http';
import { ChatComponent } from './app/chat/chat.component';

createApplication({ providers: [provideHttpClient()] }).then(app => {
  const el = createCustomElement(ChatComponent, { injector: app.injector });
  if (!customElements.get('wp-ng-widget')) {
    customElements.define('wp-ng-widget', el);
  }
});
