import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-input.component.html',
  styleUrls: ['./custom-input.component.scss'],
})
export class CustomInputComponent {
  @Input() placeholder: string = '';
  @Input() type: string = 'text'; // Supports 'text' or 'password'
  @Input() value: string = '';
  @Input() borderColor: string = '#ccc';

  @Output() valueChange = new EventEmitter<string>();

  showPassword: boolean = false; // Toggle for password visibility

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Determine input type based on show/hide state
  get inputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }
}
