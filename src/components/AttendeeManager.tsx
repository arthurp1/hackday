import React, { useState } from 'react';
import { ArrowLeft, Search, CheckCircle, AlertCircle, Mail, Users, Filter } from 'lucide-react';
import { useHackathon } from '../contexts/HackathonContext';

interface AttendeeManagerProps {
  onNavigate: (screen: string, data?: any) => void;
  uiState: string;
  isInline?: boolean;
  onCancel?: () => void;
}

const AttendeeManager: React.FC<AttendeeManagerProps> = ({ 
  onNavigate, 
  uiState,
  isInline = false,
  onCancel
}) => {
  const { state, updateAttendee, checkInAttendee } = useHackathon();
  const { attendees } = state;
  const isHacker = (a: any) => a && typeof a.id === 'string' && a.id.startsWith('att-') && !((a.team || '').toLowerCase().includes('sponsors') || (a.team || '').toLowerCase() === 'host' || (a.team || '').toLowerCase() === 'hosts');
  const hackerAttendees = attendees.filter(isHacker);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checkedIn' | 'notCheckedIn'>('all');
  const [bulkAction, setBulkAction] = useState<'checkIn' | 'sendEmail' | ''>('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const filteredAttendees = hackerAttendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'checkedIn' && attendee.checkedIn) ||
                         (filterStatus === 'notCheckedIn' && !attendee.checkedIn);
    
    return matchesSearch && matchesFilter;
  });

  const handleCheckIn = async (attendeeId: string) => {
    try {
      const attendee = attendees.find(a => a.id === attendeeId);
      if (attendee) {
        await checkInAttendee(attendee.email);
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedAttendees.length === 0) return;
    
    setProcessing(true);
    try {
      if (bulkAction === 'checkIn') {
        for (const attendeeId of selectedAttendees) {
          await updateAttendee(attendeeId, { checkedIn: true });
        }
      } else if (bulkAction === 'sendEmail') {
        // Mock email sending
        console.log('Sending emails to:', selectedAttendees);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setSelectedAttendees([]);
      setBulkAction('');
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  const toggleAttendeeSelection = (attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId) 
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const selectAll = () => {
    setSelectedAttendees(
      selectedAttendees.length === filteredAttendees.length 
        ? [] 
        : filteredAttendees.map(a => a.id)
    );
  };

  const stats = {
    total: hackerAttendees.length,
    checkedIn: hackerAttendees.filter(a => a.checkedIn).length,
    notCheckedIn: hackerAttendees.filter(a => !a.checkedIn).length
  };

  const handleCancel = () => {
    if (isInline && onCancel) {
      onCancel();
    } else {
      onNavigate('hostDashboard');
    }
  };

  return (
    <div className={isInline ? "space-y-4" : "quiz-panel"}>
      {!isInline && <div className="quiz-header">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Attendee Manager</h2>
          </div>
        </div>
      </div>}

      {isInline && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Attendee Manager</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      )}

      <div className="space-y-4 flex-1 overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
            <div className="text-lg font-bold text-white">{stats.total}</div>
            <div className="text-sm text-blue-400">Total Attendees</div>
          </div>
          <div className="p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
            <div className="text-lg font-bold text-white">{stats.checkedIn}</div>
            <div className="text-sm text-green-400">Checked In</div>
          </div>
          <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
            <div className="text-lg font-bold text-white">{stats.notCheckedIn}</div>
            <div className="text-sm text-yellow-400">Not Checked In</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/30 border border-cyan-500/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none"
              placeholder="Search attendees..."
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-black/30 border border-cyan-500/30 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="checkedIn">Checked In</option>
            <option value="notCheckedIn">Not Checked In</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedAttendees.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <span className="text-purple-400">{selectedAttendees.length} selected</span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value as any)}
              className="px-3 py-1 bg-black/30 border border-purple-500/30 rounded text-white text-sm"
            >
              <option value="">Choose action...</option>
              <option value="checkIn">Check In All</option>
              <option value="sendEmail">Send Email</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction || processing}
              className="px-4 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Apply'}
            </button>
          </div>
        )}

        {/* Attendee List */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 border-b border-white/10">
            <input
              type="checkbox"
              checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
              onChange={selectAll}
              className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-400">Select All ({filteredAttendees.length})</span>
          </div>
          
          {filteredAttendees.map(attendee => (
            <div key={attendee.id} className="p-3 bg-black/20 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedAttendees.includes(attendee.id)}
                  onChange={() => toggleAttendeeSelection(attendee.id)}
                  className="w-4 h-4 text-cyan-600 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-white">{attendee.name}</span>
                    {attendee.checkedIn ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-2">
                    {attendee.email}
                    {attendee.team && (
                      <span className="ml-4 text-purple-400">Team: {attendee.team}</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {attendee.skills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!attendee.checkedIn && (
                    <button
                      onClick={() => handleCheckIn(attendee.id)}
                      className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded text-green-400 hover:bg-green-500/30 transition-colors text-sm"
                    >
                      Check In
                    </button>
                  )}
                  <button
                    onClick={() => window.open(`mailto:${attendee.email}`, '_blank')}
                    className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendeeManager;