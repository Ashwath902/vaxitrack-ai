import React from 'react';
import { ColdChainProvider, useColdChain } from './context/ColdChainContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastNotification from './components/Common/ToastNotification';
import ExcursionBanner from './components/Overview/ExcursionBanner';
import MetricCards from './components/Overview/MetricCards';
import TemperatureChart from './components/Overview/TemperatureChart';
import ActiveShipmentsSummary from './components/Overview/ActiveShipmentsSummary';
import ShipmentsList from './components/Shipments/ShipmentsList';
import AlertsTable from './components/Alerts/AlertsTable';
import BatchInventory from './components/Batches/BatchInventory';
import CustodyLogs from './components/Custody/CustodyLogs';
import AIAssistantPanel from './components/Assistant/AIAssistantPanel';

function MainWorkspaceContent() {
  const { activeTab } = useColdChain();

  return (
    <div className="workspace-content">
      {/* Excursion Banner always renders at the top of the workspace if an active excursion exists */}
      <ExcursionBanner />

      {activeTab === 'overview' && (
        <>
          <MetricCards />
          <TemperatureChart />
          <ActiveShipmentsSummary />
        </>
      )}

      {activeTab === 'shipments' && <ShipmentsList />}

      {activeTab === 'alerts' && <AlertsTable />}

      {activeTab === 'batches' && <BatchInventory />}

      {activeTab === 'custody' && <CustodyLogs />}

      {activeTab === 'assistant' && <AIAssistantPanel />}
    </div>
  );
}

export default function App() {
  return (
    <ColdChainProvider>
      <div className="app-container">
        <Sidebar />
        <main className="main-workspace">
          <Topbar />
          <MainWorkspaceContent />
        </main>
        <ToastNotification />
      </div>
    </ColdChainProvider>
  );
}
