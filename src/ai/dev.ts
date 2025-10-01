import { config } from 'dotenv';
config();

import '@/ai/flows/generate-location-report.ts';
import '@/ai/flows/generate-end-of-trip-report.ts';
import '@/ai/flows/geocode-address.ts';
import '@/ai/flows/predict-travel-time.ts';
import '@/ai/flows/predict-real-time-travel-time.ts';
