import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuotas } from '@/hooks/useQuotas';
import { Loader2 } from 'lucide-react';

export const QuotaDisplay: React.FC = () => {
  const { dailyUsage, quotas, loading } = useQuotas();

  if (loading || !quotas || !dailyUsage) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const quotaItems = [
    { label: 'MCQs', used: dailyUsage.mcqs_used, total: quotas.mcqs },
    { label: 'Flashcards', used: dailyUsage.flashcards_used, total: quotas.flashcards },
    { label: 'Definitions', used: dailyUsage.definitions_used, total: quotas.definitions },
    { label: 'PDFs', used: dailyUsage.pdfs_generated, total: quotas.pdfs },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily Quota</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {quotaItems.map((item) => {
          const percentage = (item.used / item.total) * 100;
          const isNearLimit = percentage >= 80;
          
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className={isNearLimit ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                  {item.used} / {item.total}
                </span>
              </div>
              <Progress value={percentage} className={isNearLimit ? 'bg-destructive/20' : ''} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
