'use client'

import React, { useState } from 'react';
import { Moon, Sun, Clock, Calendar, Plus, TrendingUp, Settings, CheckCircle, X, Trash2, Edit } from 'lucide-react';

export default function SnoozeRN() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [chronotype, setChronotype] = useState('common');
  const [calendarLink, setCalendarLink] = useState('');
  const [scheduleUploaded, setScheduleUploaded] = useState(false);
  const [weekSchedule, setWeekSchedule] = useState<any[]>([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualShifts, setManualShifts] = useState<Record<string, string>>({});
  const [sleepLogs, setSleepLogs] = useState<any[]>([]);
  const [showLogForm, setShowLogForm] = useState(false);
  const [customAdjuncts, setCustomAdjuncts] = useState<any[]>([]);
  const [showAddAdjunct, setShowAddAdjunct] = useState(false);
  const [newAdjunctName, setNewAdjunctName] = useState('');
  
  // Sleep log form state
  const [logDate, setLogDate] = useState('');
  const [sleepTime, setSleepTime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [quality, setQuality] = useState(5);
  const [comments, setComments] = useState('');
  const [adjuncts, setAdjuncts] = useState({
    sleepMask: false,
    blackoutCurtains: false,
    whiteNoise: false,
    melatonin: false,
    melatoninTime: '',
    caffeineTime: '',
    redLightGlasses: false,
    lightBox: false,
    custom: {} as Record<string, boolean>
  });

  const handleScheduleUpload = async () => {
    if (calendarLink) {
      // Check if it's a Google Calendar URL
      if (calendarLink.includes('calendar.google.com')) {
        try {
          // Extract calendar ID from the URL if it's in the format
          // This is a simulation - actual implementation would need backend/API
          alert('Google Calendar integration requires backend API access. For now, using demo schedule.\n\nTo enable real calendar import:\n1. Set up Google Calendar API credentials\n2. Use a backend server to fetch calendar events\n3. Parse iCal format or use Google Calendar API\n\nShowing demo schedule based on typical shift patterns.');
        } catch (error) {
          console.error('Calendar import error:', error);
        }
      }
      
      // Generate mock schedule for demonstration
      const schedule = generateMockSchedule();
      setWeekSchedule(schedule);
      setScheduleUploaded(true);
    }
  };

  const handleManualScheduleSubmit = () => {
    const schedule = generateManualSchedule();
    setWeekSchedule(schedule);
    setScheduleUploaded(true);
    setShowManualEntry(false);
  };

  const getNextSevenDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        dateKey: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
      });
    }
    return days;
  };

  const handleShiftChange = (dateKey: string, shiftType: string) => {
    setManualShifts(prev => ({
      ...prev,
      [dateKey]: shiftType
    }));
  };

  const generateManualSchedule = () => {
    const days = getNextSevenDays();
    const schedule = [];
    
    days.forEach((day, i) => {
      const shiftType = manualShifts[day.dateKey] || 'Off';
      const previousShift = i > 0 ? (manualShifts[days[i-1].dateKey] || 'Off') : null;
      const sleepBlocks = getSleepRecommendations(shiftType, previousShift, chronotype);
      
      schedule.push({
        date: day.display,
        shift: shiftType,
        sleepBlocks: sleepBlocks
      });
    });
    
    return schedule;
  };

  const handleAdjunctChange = (key: string, value: any) => {
    setAdjuncts(prev => ({ ...prev, [key]: value }));
  };

  const handleCustomAdjunctChange = (adjunctId: string, value: boolean) => {
    setAdjuncts(prev => ({
      ...prev,
      custom: { ...prev.custom, [adjunctId]: value }
    }));
  };

  const handleAddCustomAdjunct = () => {
    if (newAdjunctName.trim()) {
      const newAdjunct = {
        id: Date.now().toString(),
        name: newAdjunctName.trim()
      };
      setCustomAdjuncts([...customAdjuncts, newAdjunct]);
      setNewAdjunctName('');
      setShowAddAdjunct(false);
    }
  };

  const handleDeleteCustomAdjunct = (adjunctId: string) => {
    setCustomAdjuncts(customAdjuncts.filter(a => a.id !== adjunctId));
    // Remove from all sleep logs
    setSleepLogs(sleepLogs.map(log => {
      const newCustom = { ...log.adjuncts.custom };
      delete newCustom[adjunctId];
      return {
        ...log,
        adjuncts: { ...log.adjuncts, custom: newCustom }
      };
    }));
  };

  const calculateSleepHours = (sleep: string, wake: string) => {
    if (!sleep || !wake) return 0;
    const sleepDate = new Date(`2000-01-01 ${sleep}`);
    let wakeDate = new Date(`2000-01-01 ${wake}`);
    if (wakeDate < sleepDate) {
      wakeDate = new Date(`2000-01-02 ${wake}`);
    }
    const diff = (wakeDate.getTime() - sleepDate.getTime()) / (1000 * 60 * 60);
    return diff.toFixed(1);
  };

  const handleSaveSleepLog = () => {
    const hours = calculateSleepHours(sleepTime, wakeTime);
    const newLog = {
      id: Date.now(),
      date: logDate,
      sleepTime,
      wakeTime,
      hours,
      quality,
      comments,
      adjuncts: { ...adjuncts }
    };
    setSleepLogs([newLog, ...sleepLogs]);
    
    // Reset form
    setShowLogForm(false);
    setLogDate('');
    setSleepTime('');
    setWakeTime('');
    setQuality(5);
    setComments('');
    setAdjuncts({
      sleepMask: false,
      blackoutCurtains: false,
      whiteNoise: false,
      melatonin: false,
      melatoninTime: '',
      caffeineTime: '',
      redLightGlasses: false,
      lightBox: false,
      custom: {}
    });
  };

  const calculateAdjunctStats = (adjunctKey: string, isCustom = false) => {
    const logsWithAdjunct = sleepLogs.filter(log => {
      if (adjunctKey === 'caffeineTime') {
        return log.adjuncts.caffeineTime !== '';
      }
      if (isCustom) {
        return log.adjuncts.custom && log.adjuncts.custom[adjunctKey] === true;
      }
      return log.adjuncts[adjunctKey] === true;
    });

    if (logsWithAdjunct.length === 0) return null;

    const avgQuality = logsWithAdjunct.reduce((sum: number, log: any) => sum + log.quality, 0) / logsWithAdjunct.length;
    const avgHours = logsWithAdjunct.reduce((sum: number, log: any) => sum + parseFloat(log.hours), 0) / logsWithAdjunct.length;

    return {
      avgQuality: avgQuality.toFixed(1),
      avgHours: avgHours.toFixed(1),
      count: logsWithAdjunct.length
    };
  };

  const generateMockSchedule = () => {
    const today = new Date();
    const shifts = ['Day (7am-7pm)', 'Evening (3pm-11pm)', 'Night (7pm-7am)', 'Off'];
    const schedule = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Create a varied shift pattern
      let shiftType;
      if (i === 0 || i === 1) shiftType = 'Day (7am-7pm)';
      else if (i === 2) shiftType = 'Off';
      else if (i === 3 || i === 4) shiftType = 'Night (7pm-7am)';
      else shiftType = 'Off';
      
      const sleepBlocks = getSleepRecommendations(shiftType, schedule[i-1]?.shift, chronotype);
      
      schedule.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        shift: shiftType,
        sleepBlocks: sleepBlocks
      });
    }
    
    return schedule;
  };

  const getSleepRecommendations = (currentShift: string, previousShift: string | null, chrono: string) => {
    const blocks = [];
    
    // No previous shift (first day)
    if (!previousShift) {
      if (currentShift === 'Day (7am-7pm)') {
        blocks.push({ time: '11pm - 6am', duration: '7h', type: 'main', notes: 'Regular sleep before day shift' });
      } else if (currentShift === 'Evening (3pm-11pm)') {
        blocks.push({ time: '12am - 8am', duration: '8h', type: 'main', notes: 'Sleep after evening shift' });
      } else if (currentShift === 'Night (7pm-7am)') {
        blocks.push({ time: '9am - 5pm', duration: '8h', type: 'main', notes: 'Prepare for night shift' });
      }
      return blocks;
    }
    
    // Day to Evening transitions
    if (previousShift === 'Day (7am-7pm)' && currentShift === 'Evening (3pm-11pm)') {
      blocks.push({ time: '8pm - 11am', duration: '3h', type: 'transition', notes: 'Short rest after day shift' });
      blocks.push({ time: '12am - 8am', duration: '8h', type: 'main', notes: 'Main sleep after evening shift' });
    }
    
    // Evening to Day transitions
    if (previousShift === 'Evening (3pm-11pm)' && currentShift === 'Day (7am-7pm)') {
      blocks.push({ time: '12am - 6am', duration: '6h', type: 'main', notes: 'Shift to earlier schedule' });
    }
    
    // Evening to Night transitions
    if (previousShift === 'Evening (3pm-11pm)' && currentShift === 'Night (7pm-7am)') {
      blocks.push({ time: '12am - 8am', duration: '8h', type: 'transition', notes: 'Regular sleep' });
      blocks.push({ time: '10am - 5pm', duration: '7h', type: 'main', notes: 'Prepare for night shift' });
    }
    
    // Night to Evening transitions
    if (previousShift === 'Night (7pm-7am)' && currentShift === 'Evening (3pm-11pm)') {
      blocks.push({ time: '8am - 2pm', duration: '6h', type: 'recovery', notes: 'Recovery after night shift' });
    }
    
    // Consecutive evening shifts
    if (previousShift === 'Evening (3pm-11pm)' && currentShift === 'Evening (3pm-11pm)') {
      blocks.push({ time: '12am - 8am', duration: '8h', type: 'main', notes: 'Standard evening shift sleep' });
    }
    
    // Day to Evening to Night patterns
    if (previousShift === 'Day (7am-7pm)' && currentShift === 'Night (7pm-7am)') {
      if (chrono === 'night') {
        blocks.push({ time: '9pm - 1pm', duration: '4h', type: 'transition', notes: 'Short rest after day shift' });
        blocks.push({ time: '1pm - 6pm', duration: '5h', type: 'main', notes: 'Main sleep before night shift' });
      } else if (chrono === 'early') {
        blocks.push({ time: '8pm - 12pm', duration: '4h', type: 'main', notes: 'Early sleep before night' });
        blocks.push({ time: '2pm - 5pm', duration: '3h', type: 'nap', notes: 'Strategic nap before shift' });
      } else {
        blocks.push({ time: '10pm - 2pm', duration: '4h', type: 'transition', notes: 'Rest after day shift' });
        blocks.push({ time: '2pm - 6pm', duration: '4h', type: 'main', notes: 'Main sleep before night' });
      }
    }
    
    // Night shift to Day shift
    else if (previousShift === 'Night (7pm-7am)' && currentShift === 'Day (7am-7pm)') {
      if (chrono === 'early') {
        blocks.push({ time: '8am - 1pm', duration: '5h', type: 'recovery', notes: 'Recovery sleep after night' });
        blocks.push({ time: '8pm - 6am', duration: '10h', type: 'main', notes: 'Long recovery sleep' });
      } else if (chrono === 'night') {
        blocks.push({ time: '9am - 4pm', duration: '7h', type: 'recovery', notes: 'Recovery sleep after night' });
        blocks.push({ time: '10pm - 6am', duration: '8h', type: 'main', notes: 'Transition to day schedule' });
      } else {
        blocks.push({ time: '8am - 2pm', duration: '6h', type: 'recovery', notes: 'Recovery after night shift' });
        blocks.push({ time: '9pm - 6am', duration: '9h', type: 'main', notes: 'Restore normal schedule' });
      }
    }
    
    // Consecutive night shifts
    else if (previousShift === 'Night (7pm-7am)' && currentShift === 'Night (7pm-7am)') {
      if (chrono === 'night') {
        blocks.push({ time: '8am - 4pm', duration: '8h', type: 'main', notes: 'Optimal for night owls' });
      } else if (chrono === 'early') {
        blocks.push({ time: '6am - 2pm', duration: '8h', type: 'main', notes: 'Early recovery window' });
      } else {
        blocks.push({ time: '7am - 3pm', duration: '8h', type: 'main', notes: 'Standard night shift sleep' });
      }
    }
    
    // Consecutive day shifts
    else if (previousShift === 'Day (7am-7pm)' && currentShift === 'Day (7am-7pm)') {
      blocks.push({ time: '10pm - 6am', duration: '8h', type: 'main', notes: 'Regular sleep schedule' });
    }
    
    // Off day after night
    else if (previousShift === 'Night (7pm-7am)' && currentShift === 'Off') {
      blocks.push({ time: '8am - 3pm', duration: '7h', type: 'recovery', notes: 'Recovery sleep' });
      blocks.push({ time: '11pm - 7am', duration: '8h', type: 'normalizing', notes: 'Return to normal schedule' });
    }
    
    // Off day after evening
    else if (previousShift === 'Evening (3pm-11pm)' && currentShift === 'Off') {
      blocks.push({ time: '12am - 8am', duration: '8h', type: 'main', notes: 'Maintain schedule' });
    }
    
    // Off day after day
    else if (previousShift === 'Day (7am-7pm)' && currentShift === 'Off') {
      blocks.push({ time: '11pm - 7am', duration: '8h', type: 'main', notes: 'Maintain regular schedule' });
    }
    
    // Off to Evening
    else if (previousShift === 'Off' && currentShift === 'Evening (3pm-11pm)') {
      blocks.push({ time: '11pm - 7am', duration: '8h', type: 'transition', notes: 'Standard sleep before evening' });
    }
    
    // Off to Night
    else if (previousShift === 'Off' && currentShift === 'Night (7pm-7am)') {
      blocks.push({ time: '12am - 8am', duration: '8h', type: 'transition', notes: 'Start shifting schedule' });
      blocks.push({ time: '12pm - 5pm', duration: '5h', type: 'main', notes: 'Pre-night shift sleep' });
    }
    
    // Off to Day
    else if (previousShift === 'Off' && currentShift === 'Day (7am-7pm)') {
      blocks.push({ time: '10pm - 6am', duration: '8h', type: 'main', notes: 'Standard pre-shift sleep' });
    }
    
    // Off to Off
    else if (currentShift === 'Off') {
      blocks.push({ time: '11pm - 7am', duration: '8h', type: 'main', notes: 'Maintain healthy schedule' });
    }
    
    return blocks.length > 0 ? blocks : [{ time: 'Flexible', duration: '7-9h', type: 'main', notes: 'Adjust as needed' }];
  };

  const getRecommendations = () => {
    const recs: Record<string, any> = {
      night: {
        name: "Night Owl",
        color: "from-indigo-500 to-purple-600",
        tips: [
          "After night shifts: Sleep 8am-4pm with blackout curtains",
          "Use melatonin 30-60 min before target sleep time",
          "Wear red light glasses 2 hours before sleep",
          "Avoid caffeine after 4am on night shifts"
        ]
      },
      common: {
        name: "Common Sparrow",
        color: "from-blue-500 to-cyan-600",
        tips: [
          "After night shifts: Sleep 7am-3pm in dark room",
          "Transition days: Gradually shift sleep by 1-2 hours",
          "Use light box for 20-30 min when waking before day shifts",
          "Limit caffeine to first half of shift"
        ]
      },
      early: {
        name: "Early Bird",
        color: "from-amber-500 to-orange-600",
        tips: [
          "After night shifts: Sleep 6am-2pm maximum darkness",
          "Night shifts most challenging - extra sleep adjuncts needed",
          "Strategic napping: 20-30 min before night shifts",
          "Avoid caffeine after 2am on nights"
        ]
      }
    };
    return recs[chronotype];
  };

  const getShiftColor = (shift: string) => {
    if (shift.includes('Day')) return 'from-amber-500 to-orange-500';
    if (shift.includes('Evening')) return 'from-rose-500 to-pink-500';
    if (shift.includes('Night')) return 'from-indigo-600 to-purple-600';
    return 'from-emerald-500 to-teal-500';
  };

  const getSleepBlockColor = (type: string) => {
    if (type === 'main') return 'bg-blue-600/80';
    if (type === 'recovery') return 'bg-purple-600/80';
    if (type === 'transition') return 'bg-cyan-600/80';
    if (type === 'nap') return 'bg-pink-600/80';
    if (type === 'normalizing') return 'bg-emerald-600/80';
    return 'bg-slate-600/80';
  };

  const rec = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">SnoozeRN</h1>
                <p className="text-sm text-slate-300">Sleep Tracker for Healthcare Workers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'schedule'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Schedule & Recommendations
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'tracking'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Sleep Tracking
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            {/* Chronotype Selection */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-400" />
                Select Your Chronotype
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['early', 'common', 'night'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChronotype(type)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      chronotype === type
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-center">
                      {type === 'early' && <Sun className="w-8 h-8 text-amber-400 mx-auto mb-2" />}
                      {type === 'common' && <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />}
                      {type === 'night' && <Moon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />}
                      <h3 className="font-semibold text-white">
                        {type === 'early' ? 'Early Bird' : type === 'common' ? 'Common Sparrow' : 'Night Owl'}
                      </h3>
                      <p className="text-sm text-slate-300 mt-1">
                        {type === 'early' ? 'Natural early riser' : type === 'common' ? 'Flexible schedule' : 'Late night energy'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar Upload */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                Upload Work Schedule
              </h2>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-200 mb-2">
                  <strong>How to get your Google Calendar link:</strong>
                </p>
                <ol className="text-sm text-blue-200 space-y-1 ml-4 list-decimal">
                  <li>Open Google Calendar on desktop</li>
                  <li>Find your work schedule calendar in the left sidebar</li>
                  <li>Click the three dots next to it → Settings and sharing</li>
                  <li>Scroll to "Integrate calendar" section</li>
                  <li>Copy the "Secret address in iCal format" link</li>
                  <li>Paste it below</li>
                </ol>
                <p className="text-xs text-blue-300 mt-3 italic">
                  Note: Full calendar import requires backend integration. Currently showing demo schedule with intelligent recommendations.
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Paste your Google Calendar link here..."
                  value={calendarLink}
                  onChange={(e) => setCalendarLink(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleScheduleUpload}
                    disabled={!calendarLink}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
                  >
                    Analyze Schedule
                  </button>
                  <button
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Edit className="w-5 h-5" />
                    Manual Entry
                  </button>
                </div>
                {scheduleUploaded && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="w-5 h-5" />
                    Schedule uploaded successfully!
                  </div>
                )}
              </div>
            </div>

            {/* Manual Schedule Entry */}
            {showManualEntry && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Edit className="w-6 h-6 text-purple-400" />
                  Enter Your Schedule Manually
                </h2>
                <p className="text-slate-300 text-sm mb-4">
                  Select your shift type for each day of the next week:
                </p>
                <div className="space-y-3">
                  {getNextSevenDays().map((day) => (
                    <div key={day.dateKey} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{day.dayName}</h3>
                          <p className="text-sm text-slate-400">{day.display}</p>
                        </div>
                        <div className="grid grid-cols-4 gap-2 md:w-full">
                          <button
                            onClick={() => handleShiftChange(day.dateKey, 'Day (7am-7pm)')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              manualShifts[day.dateKey] === 'Day (7am-7pm)'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                            }`}
                          >
                            Day
                          </button>
                          <button
                            onClick={() => handleShiftChange(day.dateKey, 'Evening (3pm-11pm)')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              manualShifts[day.dateKey] === 'Evening (3pm-11pm)'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                            }`}
                          >
                            Evening
                          </button>
                          <button
                            onClick={() => handleShiftChange(day.dateKey, 'Night (7pm-7am)')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              manualShifts[day.dateKey] === 'Night (7pm-7am)'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                            }`}
                          >
                            Night
                          </button>
                          <button
                            onClick={() => handleShiftChange(day.dateKey, 'Off')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              manualShifts[day.dateKey] === 'Off' || !manualShifts[day.dateKey]
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                            }`}
                          >
                            Off
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleManualScheduleSubmit}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                  >
                    Generate Sleep Plan
                  </button>
                  <button
                    onClick={() => setShowManualEntry(false)}
                    className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {scheduleUploaded && weekSchedule.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  Your Week Schedule & Sleep Plan
                </h2>
                <div className="space-y-4">
                  {weekSchedule.map((day, idx) => (
                    <div key={idx} className="bg-slate-700/30 rounded-xl overflow-hidden">
                      <div className={`bg-gradient-to-r ${getShiftColor(day.shift)} p-4`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-white text-lg">{day.date}</h3>
                            <p className="text-white/90 text-sm">{day.shift}</p>
                          </div>
                          {day.shift !== 'Off' && (
                            <Clock className="w-8 h-8 text-white/80" />
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <p className="text-sm font-medium text-slate-300 mb-2">Recommended Sleep:</p>
                        {day.sleepBlocks.map((block: any, blockIdx: number) => (
                          <div key={blockIdx} className={`${getSleepBlockColor(block.type)} rounded-lg p-3 backdrop-blur-sm`}>
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                <Moon className="w-4 h-4 text-white" />
                                <span className="font-semibold text-white">{block.time}</span>
                              </div>
                              <span className="text-xs bg-white/20 px-2 py-1 rounded text-white font-medium">
                                {block.duration}
                              </span>
                            </div>
                            <p className="text-sm text-white/90 mt-1">{block.notes}</p>
                            <span className="text-xs text-white/70 capitalize mt-1 inline-block">
                              {block.type} sleep
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={`bg-gradient-to-br ${rec.color} rounded-2xl p-6 text-white`}>
              <h2 className="text-2xl font-bold mb-2">{rec.name} Sleep Strategy</h2>
              <p className="text-white/90 mb-4">Optimized recommendations for your chronotype</p>
              <div className="space-y-3">
                {rec.tips.map((tip: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-white/95">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="space-y-6">
            {/* Add Sleep Log Button */}
            {!showLogForm && (
              <button
                onClick={() => setShowLogForm(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Plus className="w-6 h-6" />
                Log Sleep Session
              </button>
            )}

            {/* Sleep Log Form - Part 1 */}
            {showLogForm && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-6">New Sleep Log</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                      <input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Sleep Time</label>
                      <input
                        type="time"
                        value={sleepTime}
                        onChange={(e) => setSleepTime(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Wake Time</label>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {sleepTime && wakeTime && (
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                      <span className="text-blue-300 font-medium">Total Sleep: {calculateSleepHours(sleepTime, wakeTime)} hours</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Sleep Quality (1-10)</label>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                        <button
                          key={val}
                          onClick={() => setQuality(val)}
                          className={`py-2 rounded-lg font-medium transition-all ${
                            quality === val
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">Sleep Adjuncts Used</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'sleepMask', label: 'Sleep Mask' },
                        { key: 'blackoutCurtains', label: 'Blackout Curtains' },
                        { key: 'whiteNoise', label: 'White Noise' },
                        { key: 'redLightGlasses', label: 'Red Light Glasses' },
                        { key: 'lightBox', label: 'Light Box' },
                        { key: 'melatonin', label: 'Melatonin' }
                      ].map(({ key, label }) => {
                        const stats = calculateAdjunctStats(key);
                        return (
                          <label key={key} className="flex items-center gap-3 bg-slate-700/30 p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-all">
                            <input
                              type="checkbox"
                              checked={adjuncts[key as keyof typeof adjuncts] as boolean}
                              onChange={(e) => handleAdjunctChange(key, e.target.checked)}
                              className="w-5 h-5 rounded bg-slate-600 border-slate-500"
                            />
                            <div className="flex-1">
                              <span className="text-slate-200">{label}</span>
                              {stats && (
                                <div className="text-xs text-slate-400 mt-1">
                                  Avg: ⭐{stats.avgQuality} | 🕐{stats.avgHours}h ({stats.count} nights)
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {adjuncts.melatonin && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Melatonin Timing</label>
                        <input
                          type="time"
                          value={adjuncts.melatoninTime}
                          onChange={(e) => handleAdjunctChange('melatoninTime', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Last Caffeine Intake (optional)</label>
                      {(() => {
                        const stats = calculateAdjunctStats('caffeineTime');
                        return (
                          <div>
                            <input
                              type="time"
                              value={adjuncts.caffeineTime}
                              onChange={(e) => handleAdjunctChange('caffeineTime', e.target.value)}
                              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {stats && (
                              <div className="text-xs text-slate-400 mt-2">
                                When tracked - Avg: ⭐{stats.avgQuality} | 🕐{stats.avgHours}h ({stats.count} nights)
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Custom Adjuncts */}
                    {customAdjuncts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-600">
                        <p className="text-sm font-medium text-slate-300 mb-3">Custom Adjuncts</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {customAdjuncts.map((adjunct) => {
                            const stats = calculateAdjunctStats(adjunct.id, true);
                            return (
                              <label key={adjunct.id} className="flex items-center gap-3 bg-slate-700/30 p-3 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-all group">
                                <input
                                  type="checkbox"
                                  checked={adjuncts.custom[adjunct.id] || false}
                                  onChange={(e) => handleCustomAdjunctChange(adjunct.id, e.target.checked)}
                                  className="w-5 h-5 rounded bg-slate-600 border-slate-500"
                                />
                                <div className="flex-1">
                                  <span className="text-slate-200">{adjunct.name}</span>
                                  {stats && (
                                    <div className="text-xs text-slate-400 mt-1">
                                      Avg: ⭐{stats.avgQuality} | 🕐{stats.avgHours}h ({stats.count} nights)
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteCustomAdjunct(adjunct.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </button>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add Custom Adjunct Button/Form */}
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      {!showAddAdjunct ? (
                        <button
                          onClick={() => setShowAddAdjunct(true)}
                          className="w-full py-2 px-4 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg flex items-center justify-center gap-2 transition-all border border-slate-600 border-dashed"
                        >
                          <Plus className="w-4 h-4" />
                          Add Custom Adjunct
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newAdjunctName}
                            onChange={(e) => setNewAdjunctName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAdjunct()}
                            placeholder="e.g., Magnesium, Chamomile tea..."
                            className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleAddCustomAdjunct}
                            disabled={!newAdjunctName.trim()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setShowAddAdjunct(false);
                              setNewAdjunctName('');
                            }}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Comments</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="How did you feel? Any issues or observations..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveSleepLog}
                      disabled={!logDate || !sleepTime || !wakeTime}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
                    >
                      Save Log
                    </button>
                    <button
                      onClick={() => setShowLogForm(false)}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sleep Log History */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Sleep History</h2>
              {sleepLogs.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700 text-center">
                  <Moon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No sleep logs yet. Start tracking your sleep to see patterns!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sleepLogs.map((log) => (
                    <div key={log.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{log.date}</h3>
                          <p className="text-slate-400 text-sm">{log.sleepTime} - {log.wakeTime} ({log.hours}h)</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">Quality:</span>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                                <div
                                  key={val}
                                  className={`w-4 h-4 rounded-sm ${
                                    val <= log.quality ? 'bg-blue-500' : 'bg-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-white font-semibold">{log.quality}/10</span>
                          </div>
                        </div>
                      </div>
                      
                      {(Object.values(log.adjuncts).some((v: any) => v === true) || log.adjuncts.melatoninTime || log.adjuncts.caffeineTime || (log.adjuncts.custom && Object.values(log.adjuncts.custom).some((v: any) => v === true))) && (
                        <div className="mb-3">
                          <p className="text-sm text-slate-400 mb-2">Adjuncts used:</p>
                          <div className="flex flex-wrap gap-2">
                            {log.adjuncts.sleepMask && <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">Sleep Mask</span>}
                            {log.adjuncts.blackoutCurtains && <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">Blackout Curtains</span>}
                            {log.adjuncts.whiteNoise && <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">White Noise</span>}
                            {log.adjuncts.melatonin && <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">Melatonin {log.adjuncts.melatoninTime && `@ ${log.adjuncts.melatoninTime}`}</span>}
                            {log.adjuncts.redLightGlasses && <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">Red Light Glasses</span>}
                            {log.adjuncts.lightBox && <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">Light Box</span>}
                            {log.adjuncts.caffeineTime && <span className="px-3 py-1 bg-slate-700 text-slate-200 rounded-full text-sm">Caffeine @ {log.adjuncts.caffeineTime}</span>}
                            {log.adjuncts.custom && Object.entries(log.adjuncts.custom).map(([adjunctId, value]: [string, any]) => {
                              if (value) {
                                const adjunct = customAdjuncts.find(a => a.id === adjunctId);
                                return adjunct ? (
                                  <span key={adjunctId} className="px-3 py-1 bg-purple-700/50 text-purple-200 rounded-full text-sm">
                                    {adjunct.name}
                                  </span>
                                ) : null;
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      )}
                      
                      {log.comments && (
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-slate-300 text-sm">{log.comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}