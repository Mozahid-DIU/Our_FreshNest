import { Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, message = 'No data found' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Icon className="w-12 h-12 mb-3" />
      <p className="text-lg">{message}</p>
    </div>
  );
}