import { Calendar, CheckCircle, Clock } from 'lucide-react';

export interface ConferenceEvent {
  id: string;
  name: string;
  date: string;       // Next deadline or result date
  eventType: 'Paper Deadline' | 'Notifications';
  status: 'past' | 'upcoming' | 'urgent'; // urgent: within 1 month
  url: string;
}

const RAW_CONFERENCES = [
  { id: '1', name: 'EMNLP 2026', date: '2026-05-25', eventType: 'Paper Deadline', url: 'https://2026.emnlp.org/' },
  { id: '2', name: 'EMNLP 2026', date: '2026-08-20', eventType: 'Notifications', url: 'https://2026.emnlp.org/' },
  { id: '3', name: 'NeurIPS 2026', date: '2026-05-06', eventType: 'Paper Deadline', url: 'https://neurips.cc/' },
  { id: '4', name: 'NeurIPS 2026', date: '2026-09-24', eventType: 'Notifications', url: 'https://neurips.cc/' },
  { id: '5', name: 'AAAI 2027', date: '2026-07-28', eventType: 'Paper Deadline', url: 'https://aaai.org/' },
  { id: '6', name: 'AAAI 2027', date: '2026-11-30', eventType: 'Notifications', url: 'https://aaai.org/' },
  { id: '7', name: 'ICLR 2027', date: '2026-09-25', eventType: 'Paper Deadline', url: 'https://iclr.cc/' },
  { id: '8', name: 'ICLR 2027', date: '2026-12-16', eventType: 'Notifications', url: 'https://iclr.cc/' },
  { id: '9', name: 'CVPR 2027', date: '2026-11-13', eventType: 'Paper Deadline', url: 'https://cvpr.thecvf.com/' },
  { id: '10', name: 'CVPR 2027', date: '2027-02-24', eventType: 'Notifications', url: 'https://cvpr.thecvf.com/' },
  { id: '11', name: 'ACL 2027', date: '2027-01-01', eventType: 'Paper Deadline', url: 'https://2027.aclweb.org/' },
  { id: '12', name: 'ACL 2027', date: '2027-05-15', eventType: 'Notifications', url: 'https://2027.aclweb.org/' },
  { id: '13', name: 'ICML 2027', date: '2027-01-22', eventType: 'Paper Deadline', url: 'https://icml.cc/' },
  { id: '14', name: 'ICML 2027', date: '2027-05-02', eventType: 'Notifications', url: 'https://icml.cc/' },
];

const getStatus = (dateStr: string): 'past' | 'upcoming' | 'urgent' => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
  
  if (diffDays < 0) return 'past';
  if (diffDays <= 45) return 'urgent';
  return 'upcoming';
};

export const CONFERENCES: ConferenceEvent[] = RAW_CONFERENCES
  .map(c => ({ ...c, status: getStatus(c.date) } as ConferenceEvent))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export function ConferenceTimeline() {
  return (
    <div className="h-full flex flex-col p-4 bg-[#111]/80 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute inset-0 bg-[#00A19B] opacity-0 group-hover:opacity-[0.02] transition-opacity duration-1000 pointer-events-none" />
      <div className="flex items-center gap-3 mb-4 text-[#00A19B] shrink-0 z-10 box-border">
        <Calendar className="w-4 h-4" />
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] font-light">Global AI Conference Sync</h2>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar relative z-10 box-border w-full flex items-center">
        <div className="flex items-center h-full min-w-max px-8 relative mx-auto box-border">
          {/* Main Timeline Axis */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#333] to-transparent -translate-y-1/2" />
          
          {CONFERENCES.map((conf) => {
            const isPast = conf.status === 'past';
            const isUrgent = conf.status === 'urgent';
            
            return (
              <div key={conf.id} className="relative flex flex-col items-center justify-center w-36 group/node shrink-0 h-full">
                {/* Connector Line */}
                <div className={`absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 ${isPast ? 'bg-[#333]' : 'bg-[#00A19B]/30'}`} />

                {/* Node Top (Date) */}
                <div className={`absolute bottom-1/2 translate-y-[-16px] mb-2 text-center transition-all ${isPast ? 'opacity-50' : 'group-hover/node:-translate-y-1'}`}>
                  <div className={`text-[10px] font-mono tracking-widest ${isPast ? 'text-[#555]' : isUrgent ? 'text-[#FF2800] animate-pulse' : 'text-[#E6E6E6]'}`}>
                    {conf.date}
                  </div>
                </div>

                {/* Node Point */}
                <a 
                  href={conf.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-3 h-3 rounded-full border-2 z-10 relative bg-[#111] transition-all my-auto cursor-pointer flex items-center justify-center
                  ${isPast ? 'border-[#333] hover:border-[#888]' : isUrgent ? 'border-[#FF2800] shadow-[0_0_10px_rgba(255,40,0,0.5)]' : 'border-[#00A19B] shadow-[0_0_10px_rgba(0,161,155,0.3)]'}
                  ${!isPast && 'group-hover/node:scale-150 group-hover/node:bg-[#00A19B] hover:scale-150 hover:bg-[#00A19B]'}
                `}>
                  {isPast && <CheckCircle className="w-full h-full text-[#333] absolute inset-0 m-auto scale-150 opacity-50 block" />}
                </a>

                {/* Node Bottom (Info) */}
                <div className={`absolute top-1/2 translate-y-[16px] mt-2 text-center w-full px-2 transition-all ${isPast ? 'opacity-30' : 'group-hover/node:translate-y-1'}`}>
                  <a href={conf.url} target="_blank" rel="noopener noreferrer" className={`text-[11px] font-mono uppercase tracking-wider truncate cursor-pointer hover:underline
                    ${isPast ? 'text-[#888]' : isUrgent ? 'text-[#FF2800]' : 'text-[#00A19B] font-bold'}
                  `}>
                    {conf.name}
                  </a>
                  <div className={`text-[9px] font-mono tracking-widest uppercase mt-0.5 truncate flex items-center justify-center
                    ${isPast ? 'text-[#444]' : 'text-[#888]'}
                  `}>
                    {conf.eventType === 'Paper Deadline' ? <><Clock className="w-2.5 h-2.5 mr-1" /> Deadline</> : 'Results'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
