import React from 'react';
import PlaceholderPage from './components/PlaceholderPage';
import DataPage from './DataManagement/DataPage';
import MonitoringPage from './SystemMonitoring/MonitoringPage';
import ReportsPage from './Reports/ReportsPage';
import SecurityPage from './Security/SecurityPage';
import TrackingPage from './Tracking/TrackingPage';
import ScannerPage from './Equipment/ScannerPage';

export const ConfigPage = () => <PlaceholderPage title="System Configuration" description="Manage settings, policies, and system preferences." />;
export const EquipmentPage = () => <PlaceholderPage title="Equipment Inventory" description="Manage assets, check-in/out, and catalog." />;
export const DataPageStub = DataPage;
export const MonitoringPageStub = MonitoringPage;
export const ReportsPageStub = ReportsPage;

export { DataPage, MonitoringPage, ReportsPage, SecurityPage, TrackingPage, ScannerPage };
