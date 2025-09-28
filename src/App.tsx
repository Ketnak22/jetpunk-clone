import { useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { Map } from './Map';

function App() {
  const [activeComponent, setActiveComponent] = useState<null | 'load' | 'upload'>(null);
  const loadBtnRef = useRef<HTMLButtonElement>(null);
  const uploadBtnRef = useRef<HTMLButtonElement>(null);

  const handleLoadClick = () => {
    setActiveComponent('load');
  };

  const handleUploadClick = () => {
    setActiveComponent('upload');
  };

  return (
    <>
      {activeComponent == null &&
      <>
        <button ref={loadBtnRef} onClick={handleLoadClick}>Załaduj mapę</button>
        <button ref={uploadBtnRef} onClick={handleUploadClick}>Prześlij mapę</button>
      </>
      }

      {activeComponent === 'load' && <Map url='maps/polska.svg' />}
      {activeComponent === 'upload' && <div>Upload Component Here</div>}
    </>
  );
}

export default App;
