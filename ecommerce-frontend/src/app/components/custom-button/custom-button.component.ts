import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-custom-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-button.component.html',
  styleUrls: ['./custom-button.component.scss'],
})
export class CustomButtonComponent {
  @Input() text: string = 'Button';
  @Input() backgroundColor: string = '#9147ff';
  @Input() hoverColor?: string; // Optional hover color
  @Input() textColor: string = '#fff';
  @Input() disabled: boolean = false;

  @Output() buttonClick = new EventEmitter<void>();

  get effectiveHoverColor(): string {
    return this.hoverColor || this.adjustBrightness(this.backgroundColor, 20);
  }

  onClick() {
    if (!this.disabled) {
      this.buttonClick.emit();
    }
  }

  // Utility to lighten or darken the button color
  private adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  }
}
