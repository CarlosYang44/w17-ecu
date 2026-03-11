import { Calendar, CheckCircle, Clock } from 'lucide-react';

export interface ConferenceEvent {
  id: string;
  name: string;
  date: string;       // Next deadline or result date
  eventType: 'Paper Deadline' | 'Notifications';
  status: 'past' | 'upcoming' | 'urgent'; // urgent: within 1 month
  url: string;
}

const CONFERENCES: ConferenceEvent[] = ([
  { id: '1', name: 'ICLR 2025', date: '2024-10-01', eventType: 'Paper Deadline', status: 'past', url: 'https://iclr.cc/' },
  { id: '2', name: 'ICLR 2025', date: '2025-01-22', eventType: 'Notifications', status: 'past', url: 'https://iclr.cc/' },
  { id: '3', name: 'CVPR 2025', date: '2024-11-14', eventType: 'Paper Deadline', status: 'past', url: 'https://cvpr.thecvf.com/' },
  { id: '4', name: 'CVPR 2025', date: '2025-02-27', eventType: 'Notifications', status: 'past', url: 'https://cvpr.thecvf.com/' },
  { id: '5', name: 'ICML 2025', date: '2025-01-30', eventType: 'Paper Deadline', status: 'past', url: 'https://icml.cc/' },
  { id: '6', name: 'ICML 2025', date: '2025-05-02', eventType: 'Notifications', status: 'upcoming', url: 'https://icml.cc/' },
  { id: '7', name: 'ACL 2025', date: '2025-02-15', eventType: 'Paper Deadline', status: 'past', url: 'https://2025.aclweb.org/' },
  { id: '8', name: 'ACL 2025', date: '2025-05-15', eventType: 'Notifications', status: 'upcoming', url: 'https://2025.aclweb.org/' },
  { id: '9', name: 'NeurIPS 2025', date: '2025-05-22', eventType: 'Paper Deadline', status: 'urgent', url: 'https://nips.cc/' },
  { id: '10', name: 'NeurIPS 2025', date: '2025-09-25', eventType: 'Notifications', status: 'upcoming', url: 'https://nips.cc/' },
  { id: '11', name: 'ECCV 2026', date: '2026-03-05', eventType: 'Paper Deadline', status: 'past', url: 'https://eccv.ecva.net/' },
  { id: '12', name: 'ECCV 2026', date: '2026-07-01', eventType: 'Notifications', status: 'upcoming', url: 'https://eccv.ecva.net/' },
] as ConferenceEvent[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
