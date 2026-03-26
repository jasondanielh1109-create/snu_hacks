@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --color-bg-primary: #0A0E1A;
  --color-bg-secondary: #0F1629;
  --color-bg-card: #141B2D;
  --color-accent-primary: #00D4FF;
  --color-accent-secondary: #7B61FF;
  --color-accent-success: #00E5A0;
  --color-accent-warning: #FFB547;
  --color-accent-danger: #FF4D6D;
  --color-text-primary: #F0F4FF;
  --color-text-secondary: #8892AA;
  --color-text-muted: #4A5568;
  --color-border-subtle: rgba(255,255,255,0.06);
  --color-border-accent: rgba(0,212,255,0.3);
}

@layer base {
  body {
    @apply bg-bg-primary text-text-primary font-sans antialiased;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-display;
  }
}

@layer components {
  .glass {
    @apply bg-white/5 backdrop-blur-xl border border-white/10;
  }
  
  .btn-primary {
    @apply px-6 py-3 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,212,255,0.3)];
  }
  
  .btn-ghost {
    @apply px-6 py-3 rounded-full border border-accent-primary/50 text-accent-primary font-semibold transition-all hover:bg-accent-primary/10 active:scale-95;
  }

  .input-field {
    @apply w-full bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all;
  }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(90deg, var(--bg-card) 25%, #1e293b 50%, var(--bg-card) 75%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}

.mesh-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: radial-gradient(circle at 20% 30%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(123, 97, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(0, 229, 160, 0.05) 0%, transparent 50%);
  filter: blur(80px);
}

.grid-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
