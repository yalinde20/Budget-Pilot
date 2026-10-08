import { Component, inject } from '@angular/core';
import { AppUpdateService } from '../../services/app-update.service';
import { Icon } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-update-banner',
  imports: [Icon],
  templateUrl: './update-banner.html',
})
export class UpdateBanner {
  protected readonly appUpdate = inject(AppUpdateService);
}
