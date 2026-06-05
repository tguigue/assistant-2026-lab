import { Button } from '@doctrinelegal/design-system/button';
import { Icon } from '@doctrinelegal/design-system/icon';
import { Chip } from '@doctrinelegal/design-system/data-display';
import { InputTextarea } from '@doctrinelegal/design-system/inputs';

/**
 * Temporary spike — renders a few Doctrine design-system atoms to confirm the
 * private package installs, runs in Vite (no Next breakage), and its CSS loads.
 * Visit `/?sandbox` to see it. Removed once Phase-3 migration begins.
 */
export function Sandbox() {
  const box: React.CSSProperties = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' };
  return (
    <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 760, margin: '0 auto' }}>
      <h1>Doctrine Design System — spike</h1>

      <section>
        <h3>Button</h3>
        <div style={box}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="text">Text</Button>
          <Button variant="primary" color="gen-ai">Gen-AI</Button>
          <Button variant="primary" loading>Loading</Button>
        </div>
      </section>

      <section>
        <h3>Icon</h3>
        <div style={{ ...box, fontSize: 24 }}>
          <Icon name="search" />
          <Icon name="mic" />
          <Icon name="description" />
          <Icon name="add" />
          <Icon name="account_balance" />
        </div>
      </section>

      <section>
        <h3>Chip</h3>
        <div style={box}>
          <Chip variant="primary">Primary</Chip>
          <Chip variant="secondary">Secondary</Chip>
          <Chip variant="success">Success</Chip>
          <Chip variant="warning">Warning</Chip>
          <Chip variant="future">Future</Chip>
        </div>
      </section>

      <section>
        <h3>InputTextarea</h3>
        <InputTextarea id="spike-textarea" placeholder="Demander à Doctrine…" />
      </section>
    </div>
  );
}
