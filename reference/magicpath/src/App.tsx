import { Theme } from './settings/types';
import { FallIncidentWriter2026 } from './components/generated/FallIncidentWriter2026';

let theme: Theme = 'light';

function App() {
  function setTheme(theme: Theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  setTheme(theme);

  return (
    <>
      <FallIncidentWriter2026 />
    </>
  ); // %EXPORT_STATEMENT%
}

export default App;

