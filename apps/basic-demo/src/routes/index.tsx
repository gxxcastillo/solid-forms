import { Title } from '@solidjs/meta';

// Ship one stylesheet per theme; each only sets `--sf-*` variables under its own
// `[data-sf-theme="…"]` scope, so importing several is safe and switching is
// just a matter of changing the attribute.
import '@gxxc/solid-forms/themes/minimal.css';
import '@gxxc/solid-forms/themes/midnight.css';
import '@gxxc/solid-forms/themes/neobrutalist.css';

import { ThemeShowcase } from '../components/ThemeShowcase';

export default function Home() {
  return (
    <>
      <Title>solid-forms — theming</Title>
      <ThemeShowcase />
    </>
  );
}
