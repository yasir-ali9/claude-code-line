import React from 'react';
import { useApp } from 'ink';
import type { Config } from '../types.js';
import { loadConfig, saveConfig } from '../config/index.js';
import { Home } from './screens/home.js';

export function App() {
  const { exit } = useApp();
  const [config, setConfig] = React.useState<Config>(loadConfig);

  const handleSave = (next: Config) => {
    setConfig(next);
    saveConfig(next);
  };

  return (
    <Home
      config={config}
      onSave={handleSave}
      onQuit={() => exit()}
    />
  );
}
