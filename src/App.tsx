/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import AspenInterface from './components/AspenInterface';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <div className="dark min-h-screen bg-[#030a0f] text-[#e0f2fe]">
      <AspenInterface />
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
