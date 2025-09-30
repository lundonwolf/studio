"use client";

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (typeof navigator.onLine !== 'undefined') {
            setIsOffline(!navigator.onLine);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOffline) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-[380px] text-center">
                <CardHeader>
                    <CardTitle className="flex flex-col items-center gap-4">
                        <WifiOff className="h-12 w-12 text-destructive" />
                        You are offline
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        It looks like you've lost your connection. Some features may not be available until you're back online.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}