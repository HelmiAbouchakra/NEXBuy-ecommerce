import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-toast-test',
  standalone: true,
  template: `
    <div style="padding: 20px; display: flex; flex-direction: column; gap: 10px;">
      <h2>Toast Preview</h2>
      <button (click)="showSuccess()">Show Success Toast</button>
      <button (click)="showError()">Show Error Toast</button>
      <button (click)="showInfo()">Show Info Toast</button>
      <button (click)="showWarning()">Show Warning Toast</button>
    </div>
  `,
})
export class ToastTestComponent {
  private toastr = inject(ToastrService);

  showSuccess() {
    this.toastr.success('This is a success message This is a success message This is a success message This is a success message This is a success message This is a success message This is a success message This is a success message This is a success message', 'Success!');
  }

  showError() {
    this.toastr.error('This is an error message');
  }

  showInfo() {
    this.toastr.info('This is an information message', 'Info');
  }

  showWarning() {
    this.toastr.warning('This is a warning message', 'Warning');
  }
}