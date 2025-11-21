import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  today: number = Date.now();
}
