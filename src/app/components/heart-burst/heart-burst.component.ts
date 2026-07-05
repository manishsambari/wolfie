import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HeartParticle {
  id: number;
  char: string;
  tx: string; // target X translate
  ty: string; // target Y translate
  scale: number;
  delay: string;
}

@Component({
  selector: 'app-heart-burst',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heart-burst.component.html',
  styleUrl: './heart-burst.component.css'
})
export class HeartBurstComponent implements OnInit {
  readonly particles = signal<HeartParticle[]>([]);

  ngOnInit() {
    this.generateParticles();
  }

  private generateParticles() {
    const chars = ['🐺', '🐉', '✨', '💖', '❤️', '✨'];
    const newParticles: HeartParticle[] = [];
    
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = 100 + Math.random() * 250; // burst radius 100px to 350px
      const tx = `${Math.cos(angle) * radius}px`;
      const ty = `${Math.sin(angle) * radius}px`;
      const scale = 0.6 + Math.random() * 1.2;
      const delay = `${Math.random() * 0.15}s`;
      
      newParticles.push({
        id: i,
        char: chars[i % chars.length],
        tx,
        ty,
        scale,
        delay
      });
    }
    this.particles.set(newParticles);
  }
}
