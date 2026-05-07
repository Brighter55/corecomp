import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "./ui/card";

export default function MaintenanceBanner() {
  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      <Card className="border-amber-500/40 bg-amber-500/10">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-[var(--text-main)]">
              This project is temporarily paused.
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              All features will be unavailable while the backend is offline.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
