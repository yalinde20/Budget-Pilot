import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { UpdateBanner } from './update-banner';
import { AppUpdateService } from '../../services/app-update.service';

describe('UpdateBanner', () => {
  const updateAvailable = signal(false);
  const applyUpdate = jasmine.createSpy('applyUpdate');

  beforeEach(() => {
    updateAvailable.set(false);
    applyUpdate.calls.reset();
    TestBed.configureTestingModule({
      imports: [UpdateBanner],
      providers: [{ provide: AppUpdateService, useValue: { updateAvailable, applyUpdate } }],
    });
  });

  it("n'affiche rien tant qu'aucune mise à jour n'est prête", () => {
    const fixture = TestBed.createComponent(UpdateBanner);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="status"]')).toBeNull();
  });

  it('propose de mettre à jour quand une nouvelle version est prête', () => {
    const fixture = TestBed.createComponent(UpdateBanner);
    updateAvailable.set(true);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    expect(button?.textContent).toContain('Mettre à jour');
    button?.click();
    expect(applyUpdate).toHaveBeenCalled();
  });
});
