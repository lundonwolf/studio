import type { Stop } from './types';

export const availableStops: Stop[] = [
  {
    id: 'stop-1',
    propertyName: 'Oakwood Apartments',
    address: '123 Oak St, Springfield, IL',
    contact: {
      name: 'John Smith',
      email: 'john.smith@oakwood.com',
      phone: '555-123-4567',
    },
    screenId: 'OAK-LOBBY-01',
    wifiSsid: 'OakwoodGuest',
    techInstructions: 'Screen is located in the main lobby, behind the reception desk. Check for pixelation issues.',
    coordinates: { latitude: 39.7817, longitude: -89.6501 },
  },
  {
    id: 'stop-2',
    propertyName: 'Maple Creek Complex',
    address: '456 Maple Ave, Springfield, IL',
    contact: {
      name: 'Jane Doe',
      email: 'jane.doe@maplecreek.com',
      phone: '555-987-6543',
    },
    screenId: 'MAP-REC-01',
    wifiSsid: 'MapleCreekWiFi',
    wifiPassword: 'password123',
    techInstructions: 'Rec room screen. Requires special remote (ask front desk). Verify remote connectivity.',
    coordinates: { latitude: 39.7900, longitude: -89.6445 },
  },
  {
    id: 'stop-3',
    propertyName: 'Willow Creek Towers',
    address: '789 Willow Ln, Springfield, IL',
    contact: {
      name: 'Peter Jones',
      email: 'p.jones@willowtowers.com',
      phone: '555-222-3333',
    },
    screenId: 'WILLOW-ELEV-01',
    wifiSsid: 'WillowGuest',
    techInstructions: 'Elevator screen, bank A. Needs a firmware update. Follow SOP-FW-03.',
    coordinates: { latitude: 39.7750, longitude: -89.6600 },
  },
  {
    id: 'stop-4',
    propertyName: 'Pine Ridge Estates',
    address: '101 Pine Dr, Springfield, IL',
    contact: {
      name: 'Mary Williams',
      email: 'mary.w@pineridge.com',
      phone: '555-444-5555',
    },
    screenId: 'PINE-GATE-01',
    wifiSsid: 'PineRidgeSecure',
    wifiPassword: 'securepassword',
    techInstructions: 'Main gate entrance screen. Check for weather damage to enclosure.',
    coordinates: { latitude: 39.8011, longitude: -89.6587 },
  },
];
