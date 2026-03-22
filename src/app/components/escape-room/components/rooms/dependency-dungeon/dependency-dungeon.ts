import {
  Component, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { EscapeRoomService } from '../../../service/escape-room';

interface CompSlot { service: string; filled: string | null; state: 'idle' | 'correct' | 'wrong'; }
interface DunComp  { id: string; name: string; slots: CompSlot[]; }
interface Service  { name: string; cssKey: string; }

const SERVICES: Service[] = [
  { name: 'DataService', cssKey: 'data' },
  { name: 'AuthService', cssKey: 'auth' },
  { name: 'LogService',  cssKey: 'log'  },
  { name: 'HttpClient',  cssKey: 'http' },
];

const INITIAL_COMPS: DunComp[] = [
  { id: 'dc0', name: 'UserDashboard', slots: [
    { service: 'DataService', filled: null, state: 'idle' },
    { service: 'AuthService', filled: null, state: 'idle' },
  ]},
  { id: 'dc1', name: 'LoginForm', slots: [
    { service: 'AuthService', filled: null, state: 'idle' },
    { service: 'HttpClient',  filled: null, state: 'idle' },
  ]},
  { id: 'dc2', name: 'ActivityLog', slots: [
    { service: 'LogService',  filled: null, state: 'idle' },
  ]},
];

@Component({
  selector: 'app-room-dependency-dungeon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dependency-dungeon.html',
  styleUrl:    './dependency-dungeon.scss',
})
export class DependencyDungeon {
  protected er = inject(EscapeRoomService);

  services = SERVICES;
  comps    = signal<DunComp[]>(INITIAL_COMPS.map(c => ({
    ...c, slots: c.slots.map(s => ({ ...s })),
  })));
  selected = signal<string | null>(null);

  selectService(name: string): void {
    this.selected.set(name);
    // this.er.log(`> Selected: inject(${name})`, 'info');
  }

  injectIntoSlot(compId: string, slotIdx: number): void {
    const svc = this.selected();
    if (!svc) { 
      // this.er.log('> Select a service first!', 'warn'); 
      return; }

    this.comps.update(comps => comps.map(c => {
      if (c.id !== compId) return c;
      const newSlots = c.slots.map((s, i) => {
        if (i !== slotIdx || s.state === 'correct') return s;
        const correct = s.service === svc;
        if (correct) {
          // this.er.log(`> inject(${svc}) → ${c.name} ✓`, 'sys');
          return { ...s, filled: svc, state: 'correct' as const };
        } else {
          // this.er.log('> Wrong service for this component', 'err');
          setTimeout(() => {
            this.comps.update(cs => cs.map(cc =>
              cc.id !== compId ? cc : {
                ...cc,
                slots: cc.slots.map((ss, ii) =>
                  ii !== slotIdx ? ss : { ...ss, filled: null, state: 'idle' as const }
                ),
              }
            ));
          }, 700);
          return { ...s, filled: svc, state: 'wrong' as const };
        }
      });
      return { ...c, slots: newSlots };
    }));

    this.selected.set(null);

    const allDone = this.comps().every(c => c.slots.every(s => s.state === 'correct'));
    if (allDone) {
      setTimeout(() => {
        // this.er.log('> DEPENDENCY DUNGEON: CLEARED ✓', 'sys');
        // this.er.log('> All services injected', 'info');
        // this.er.completeRoom(3);
      }, 500);
    }
  }

  /** Builds the CSS class string for an injection slot */
  buildSlotClass(slot: CompSlot): string {
    const base = 'inj-slot';
    if (slot.state === 'idle') return `${base} empty-slot`;
    const key = SERVICES.find(s => s.name === slot.filled)?.cssKey ?? 'data';
    const stateClass = slot.state === 'correct' ? 'correct-slot' : 'wrong-slot';
    return `${base} inj-${key} ${stateClass}`;
  }
}