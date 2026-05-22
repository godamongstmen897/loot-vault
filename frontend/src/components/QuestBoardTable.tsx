import React, { useState } from 'react';
import { Job, JobStatus } from '../types';
import { useQuestBoard } from '../hooks/useQuestBoard';

interface QuestBoardTableProps {
  jobs: Job[];
}

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case 'Open': return 'text-cyan-400 border-cyan-500 bg-cyan-900/30';
    case 'In Progress': return 'text-yellow-400 border-yellow-500 bg-yellow-900/30';
    case 'Completed': return 'text-lime-400 border-lime-500 bg-lime-900/30';
    case 'Disputed': return 'text-magenta-400 border-magenta-500 bg-magenta-900/30';
    default: return 'text-gray-400 border-gray-500 bg-gray-800';
  }
};

export default function QuestBoardTable({ jobs }: QuestBoardTableProps) {
  const { data, filter, setFilter, sortField, sortOrder, handleSort } = useQuestBoard(jobs);
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  const currentData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const SortIndicator = ({ field }: { field: keyof Job }) => {
    if (sortField !== field) return <span className="text-gray-600 ml-1">↕</span>;
    return <span className="text-cyan-400 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <h2 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(34,211,238,0.5)' }}>Mercenary Board</h2>
        
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-gray-400 uppercase tracking-widest">Filter:</label>
          <select 
            id="status-filter"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as any);
              setPage(1);
            }}
            className="bg-black border border-cyan-500 text-cyan-400 p-2 outline-none focus:ring-1 focus:ring-cyan-400"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Disputed">Disputed</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border border-cyan-800 bg-black/80">
        <table className="w-full text-left border-collapse" role="grid" aria-label="Quest board jobs list">
          <thead>
            <tr className="border-b border-cyan-500 bg-cyan-950/20 text-xs uppercase tracking-widest text-cyan-300">
              <th className="p-4 cursor-pointer hover:text-cyan-100 transition-colors focus:outline-cyan-500" tabIndex={0} onClick={() => handleSort('title')} onKeyDown={(e) => e.key === 'Enter' && handleSort('title')}>
                Quest <SortIndicator field="title" />
              </th>
              <th className="p-4 cursor-pointer hover:text-cyan-100 transition-colors focus:outline-cyan-500" tabIndex={0} onClick={() => handleSort('client')} onKeyDown={(e) => e.key === 'Enter' && handleSort('client')}>
                Client <SortIndicator field="client" />
              </th>
              <th className="p-4 cursor-pointer hover:text-cyan-100 transition-colors focus:outline-cyan-500" tabIndex={0} onClick={() => handleSort('bounty')} onKeyDown={(e) => e.key === 'Enter' && handleSort('bounty')}>
                Bounty (XLM) <SortIndicator field="bounty" />
              </th>
              <th className="p-4 cursor-pointer hover:text-cyan-100 transition-colors focus:outline-cyan-500" tabIndex={0} onClick={() => handleSort('status')} onKeyDown={(e) => e.key === 'Enter' && handleSort('status')}>
                Status <SortIndicator field="status" />
              </th>
              <th className="p-4 cursor-pointer hover:text-cyan-100 transition-colors focus:outline-cyan-500" tabIndex={0} onClick={() => handleSort('deadline')} onKeyDown={(e) => e.key === 'Enter' && handleSort('deadline')}>
                Deadline <SortIndicator field="deadline" />
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-gray-500">No quests found matching criteria.</td></tr>
            ) : currentData.map(job => (
              <tr 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedJob(job)}
                tabIndex={0}
                className="border-b border-gray-800 hover:bg-gray-900/50 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-[inset_0_0_15px_rgba(34,211,238,0.2)] focus:outline-cyan-500"
              >
                <td className="p-4 font-mono">{job.title}</td>
                <td className="p-4 text-gray-400">{job.client}</td>
                <td className="p-4 font-bold text-yellow-400">{job.bounty.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs uppercase tracking-widest border ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{job.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {currentData.length === 0 ? (
           <div className="p-8 text-center border border-gray-800 text-gray-500">No quests found matching criteria.</div>
        ) : currentData.map(job => (
          <div 
            key={job.id}
            onClick={() => setSelectedJob(job)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedJob(job)}
            tabIndex={0}
            className="border border-cyan-900 bg-black/80 p-4 cursor-pointer hover:border-cyan-500 transition-colors focus:outline-cyan-500"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-mono font-bold text-lg">{job.title}</h3>
              <span className={`px-2 py-1 text-xs uppercase tracking-widest border ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
            <div className="text-gray-400 text-sm mb-2">{job.client}</div>
            <div className="flex justify-between items-center mt-4">
              <div className="font-bold text-yellow-400">{job.bounty.toLocaleString()} XLM</div>
              <div className="text-gray-500 text-xs">Due: {job.deadline}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-4">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-cyan-600 text-cyan-400 disabled:border-gray-800 disabled:text-gray-600 hover:bg-cyan-900/30 transition-colors"
          >
            &lt; PREV
          </button>
          <span className="text-gray-400 text-sm tracking-widest">
            PAGE {page} OF {totalPages}
          </span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-cyan-600 text-cyan-400 disabled:border-gray-800 disabled:text-gray-600 hover:bg-cyan-900/30 transition-colors"
          >
            NEXT &gt;
          </button>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setSelectedJob(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-black border border-cyan-400 w-full max-w-lg p-6 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6 border-b border-gray-800 pb-4">
              <h2 className="text-2xl font-mono text-cyan-50">{selectedJob.title}</h2>
              <button 
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-cyan-400 w-8 h-8 flex items-center justify-center border border-transparent hover:border-cyan-400 transition-colors"
                aria-label="Close modal"
              >
                X
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <div className="text-xs text-cyan-600 uppercase tracking-widest mb-1">Client</div>
                <div className="text-gray-300">{selectedJob.client}</div>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <div className="text-xs text-cyan-600 uppercase tracking-widest mb-1">Bounty Reward</div>
                  <div className="text-xl font-bold text-yellow-400">{selectedJob.bounty.toLocaleString()} XLM</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-cyan-600 uppercase tracking-widest mb-1">Deadline</div>
                  <div className="text-gray-300">{selectedJob.deadline}</div>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-cyan-600 uppercase tracking-widest mb-2">Current Status</div>
                <span className={`px-3 py-1.5 text-sm uppercase tracking-widest border ${getStatusColor(selectedJob.status)}`}>
                  {selectedJob.status}
                </span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-gray-800">
                <div className="text-xs text-cyan-600 uppercase tracking-widest mb-2">Description</div>
                <div className="text-gray-400 text-sm leading-relaxed">
                  Escrow contract locked and ready. Awaiting mercenary fulfillment according to protocol parameters.
                  Failure to deliver by deadline will result in funds returning to the client.
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                className="flex-1 bg-cyan-900 border border-cyan-400 text-cyan-50 py-3 uppercase tracking-widest font-bold hover:bg-cyan-800 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all"
                onClick={() => alert('Contract interaction not implemented yet')}
              >
                Accept Quest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
