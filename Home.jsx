import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Trash2, Edit2, Zap, User, Clock, Check, X, Shield, Activity, Lock, Users, Menu, Search, Filter, Download } from 'lucide-react';
import { db } from './firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    onSnapshot,
    orderBy
} from 'firebase/firestore';

// --- CONSTANTS ---
const TIME_SLOTS = [
    "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
    "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00",
    "20:00 - 21:00", "21:00 - 22:00"
];


// --- SHARED COMPONENTS ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
    const baseStyle = "px-6 py-4 font-sans font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl active:scale-95 touch-manipulation";
    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 hover:shadow-2xl",
        secondary: "bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-800",
        danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
        ghost: "bg-transparent text-slate-500 hover:text-slate-900",
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </button>
    );
};

const InputField = ({ label, name, type = "text", value, onChange, placeholder, required = false, options = null, error = false }) => (
    <div className="mb-5">
        <label className={`block text-[10px] font-bold uppercase tracking-widest mb-2 ml-1 ${error ? 'text-red-500' : 'text-slate-400'}`}>
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {options ? (
            <div className="relative">
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`w-full bg-slate-50 border text-slate-800 p-4 font-medium text-base focus:outline-none focus:bg-white focus:ring-1 transition-all appearance-none rounded-xl cursor-pointer ${
                        error 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900'
                    }`}
                >
                    <option value="">Select Time Slot</option>
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronRight className="rotate-90" size={16} />
                </div>
                {error && (
                    <p className="text-red-500 text-xs mt-1 ml-1">Vui lòng chọn {label.toLowerCase()}</p>
                )}
            </div>
        ) : (
            <div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-slate-50 border text-slate-800 p-4 font-medium text-base focus:outline-none focus:bg-white focus:ring-1 transition-all placeholder:text-slate-400 rounded-xl ${
                        error 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900'
                    }`}
                />
                {error && (
                    <p className="text-red-500 text-xs mt-1 ml-1">Vui lòng nhập {label.toLowerCase()}</p>
                )}
            </div>
        )}
    </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 md:p-4 animate-fadeIn">
            <div className="bg-white w-full md:max-w-lg p-6 md:p-8 shadow-2xl rounded-t-3xl md:rounded-2xl relative animate-slideUp max-h-[85vh] overflow-y-auto">
                <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6 md:hidden"></div>
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-full z-10 hidden md:block">
                    <X size={20} />
                </button>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 tracking-tight pr-8">{title}</h2>
                {children}
                <div className="mt-6 md:hidden">
                    <Button onClick={onClose} variant="secondary" className="w-full">Close</Button>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const DayDetailsContent = ({ selectedDayDetail }) => {
    if (!selectedDayDetail) return null;
    const bookingsBySlot = selectedDayDetail.bookings.reduce((acc, curr) => {
        if (!acc[curr.slot]) acc[curr.slot] = [];
        acc[curr.slot].push(curr);
        return acc;
    }, {});
    const sortedSlots = Object.keys(bookingsBySlot).sort();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Calendar size={18} className="text-slate-500" />
                <span className="font-bold text-slate-700">{selectedDayDetail.dateStr}</span>
                <div className="h-4 w-px bg-slate-300 mx-2"></div>
                <span className="text-sm text-slate-500 font-medium">{selectedDayDetail.bookings.length} Bookings</span>
            </div>

            {sortedSlots.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No bookings for this day.
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedSlots.map(slot => (
                        <div key={slot} className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                    <Clock size={14} className="text-slate-400" /> {slot}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bookingsBySlot[slot].length >= 2 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                    {bookingsBySlot[slot].length}/2
                                </span>
                            </div>
                            <div className="p-3 bg-white space-y-2">
                                {bookingsBySlot[slot].map(booking => (
                                    <div key={booking.id} className="flex items-center justify-between text-sm py-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {booking.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-slate-800 font-bold leading-tight">{booking.name}</div>
                                                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{booking.team || "N/A"}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CalendarComponent = ({ calendarView, setCalendarView, currentDate, navigateDate, handleDayClick, registrations }) => {
    const getMonthData = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const days = [];
        const numDays = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < startOffset; i++) days.push({ day: null, dateStr: `empty-${i}`, bookings: [] });
        for (let i = 1; i <= numDays; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayBookings = registrations.filter(r => r.date === dateStr);
            days.push({ day: i, dateStr, bookings: dayBookings });
        }
        return days;
    };

    const getWeekData = () => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        const days = [];
        for (let i = 0; i < 7; i++) {
            const temp = new Date(startOfWeek);
            temp.setDate(startOfWeek.getDate() + i);
            const dateStr = temp.toISOString().split('T')[0];
            const dayBookings = registrations.filter(r => r.date === dateStr);
            days.push({ dayName: temp.toLocaleDateString('en-US', { weekday: 'short' }), dateStr, bookings: dayBookings });
        }
        return days;
    };

    const renderMonth = () => {
        const days = getMonthData();
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6">
                <div className="grid grid-cols-7 mb-4">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, index) => (
                        <div key={index} className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {days.map((d) => {
                        if (!d.day) return <div key={d.dateStr} />;
                        const isToday = d.dateStr === new Date().toISOString().split('T')[0];
                        const hasBookings = d.bookings.length > 0;

                        // Group bookings by slot
                        const bookingsBySlot = d.bookings.reduce((acc, curr) => {
                            if (!acc[curr.slot]) acc[curr.slot] = [];
                            acc[curr.slot].push(curr);
                            return acc;
                        }, {});
                        const sortedSlots = Object.keys(bookingsBySlot).sort();

                        return (
                            <div
                                key={d.dateStr}
                                onClick={() => handleDayClick(d.dateStr, d.bookings)}
                                className={`aspect-square md:min-h-[140px] p-2 md:p-3 rounded-lg md:rounded-xl border transition-all cursor-pointer flex flex-col ${isToday ? 'bg-slate-900 text-white shadow-md' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                            >
                                <div className={`text-sm font-bold mb-1 ${isToday ? 'text-white' : 'text-slate-900'}`}>{d.day}</div>

                                {/* Mobile: Just a dot and count */}
                                <div className="md:hidden flex flex-col items-center justify-center flex-grow">
                                    {hasBookings && (
                                        <>
                                            <div className={`w-1.5 h-1.5 rounded-full mb-1 ${isToday ? 'bg-white' : 'bg-green-500'}`}></div>
                                            <div className={`text-[8px] font-bold ${isToday ? 'text-white/80' : 'text-slate-500'}`}>{d.bookings.length}</div>
                                        </>
                                    )}
                                </div>

                                {/* Desktop: Detailed booking info */}
                                <div className="hidden md:flex flex-col w-full flex-grow overflow-hidden">
                                    {hasBookings ? (
                                        <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 custom-scrollbar">
                                            {sortedSlots.map((slot, idx) => {
                                                const slotBookings = bookingsBySlot[slot];
                                                const isFull = slotBookings.length >= 2;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`p-1.5 rounded-md border ${isToday ? 'bg-white/10 border-white/20' : isFull ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}
                                                    >
                                                        <div className={`text-[8px] font-bold mb-0.5 ${isToday ? 'text-white' : 'text-slate-700'}`}>
                                                            {slot.split(' - ')[0]}
                                                        </div>
                                                        <div className={`text-[7px] font-bold ${isToday ? 'text-white/70' : isFull ? 'text-red-600' : 'text-green-600'}`}>
                                                            {slotBookings.length}/2
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center">
                                            <div className={`text-[9px] ${isToday ? 'text-white/50' : 'text-slate-300'}`}>Free</div>
                                        </div>
                                    )}
                                    {hasBookings && (
                                        <div className={`text-[8px] font-bold text-center mt-1 pt-1 border-t ${isToday ? 'text-white/80 border-white/20' : 'text-slate-500 border-slate-200'}`}>
                                            {d.bookings.length} {d.bookings.length === 1 ? 'booking' : 'bookings'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeek = () => {
        const days = getWeekData();
        return (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {days.map((d) => {
                    const isToday = d.dateStr === new Date().toISOString().split('T')[0];
                    const bookingsBySlot = d.bookings.reduce((acc, curr) => {
                        if (!acc[curr.slot]) acc[curr.slot] = [];
                        acc[curr.slot].push(curr);
                        return acc;
                    }, {});
                    const sortedSlots = Object.keys(bookingsBySlot).sort();

                    return (
                        <div key={d.dateStr} className={`flex flex-col rounded-2xl overflow-hidden border transition-all ${isToday ? 'border-slate-900 shadow-lg ring-1 ring-slate-900' : 'border-slate-100 bg-white'}`}>
                            <div className={`p-4 text-center border-b ${isToday ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border-slate-50'}`}>
                                <div className="text-sm font-bold uppercase tracking-wider">{d.dayName}</div>
                                <div className={`text-[10px] font-bold opacity-60`}>{d.dateStr.split('-').slice(1).join('/')}</div>
                            </div>
                            <div className="p-2 space-y-2 flex-grow min-h-[120px] bg-slate-50/50">
                                {sortedSlots.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-slate-300 text-xs font-medium uppercase tracking-widest py-4">Free</div>
                                ) : (
                                    sortedSlots.map((slot) => {
                                        const slotBookings = bookingsBySlot[slot];
                                        const isFull = slotBookings.length >= 2;
                                        return (
                                            <div key={slot} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                                <div className={`px-3 py-2 flex justify-between items-center border-b border-slate-100 ${isFull ? 'bg-red-50' : 'bg-slate-50'}`}>
                                                    <span className="text-[10px] font-bold text-slate-700">{slot}</span>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isFull ? 'bg-white text-red-500' : 'bg-white text-green-600'}`}>
                                                        {slotBookings.length}/2
                                                    </span>
                                                </div>
                                                <div className="p-2 space-y-2">
                                                    {slotBookings.map((b, idx) => (
                                                        <div key={idx} className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-slate-800 truncate">{b.name}</span>
                                                            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-medium">{b.team || "-"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="mt-12 w-full animate-slideUp">
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div className="w-full md:w-auto">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight mb-1">Schedule Overview</h2>
                    <p className="text-slate-500 text-xs md:text-sm">Tap a day for details</p>
                </div>

                <div className="w-full md:w-auto flex items-center justify-between gap-4 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100">
                    <button onClick={() => navigateDate(-1)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg"><ChevronLeft size={20} /></button>
                    <span className="text-center font-bold text-xs md:text-sm text-slate-800 uppercase tracking-wide flex-grow md:flex-grow-0 md:w-[140px]">
                        {calendarView === 'month' ? currentDate.toLocaleString('default', { month: 'short', year: '2-digit' }) : `Week ${currentDate.getDate()}`}
                    </span>
                    <button onClick={() => navigateDate(1)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg"><ChevronRight size={20} /></button>

                    <div className="h-6 w-px bg-slate-100 mx-1 hidden md:block"></div>

                    <div className="flex gap-1">
                        {['month', 'week'].map(view => (
                            <button key={view} onClick={() => setCalendarView(view)} className={`px-3 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${calendarView === view ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}>
                                {view}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {calendarView === 'month' ? renderMonth() : renderWeek()}
        </div>
    );
};

const BookingForm = ({ formData, handleInputChange, handleSubmit, isEdit, isFull, usersInCurrentSlot, errors = {}, errorMessage = '' }) => {
    return (
        <form onSubmit={handleSubmit} className="w-full">
            {errorMessage && (
                <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold">
                    {errorMessage}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1">
                    <InputField
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nguyen Van A"
                        required
                        error={errors.name}
                    />
                    <InputField
                        label="Team"
                        name="team"
                        value={formData.team}
                        onChange={handleInputChange}
                        placeholder="CM"
                        error={errors.team}
                    />
                </div>
                <div className="space-y-1">
                    <InputField
                        label="Date"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        error={errors.date}
                    />
                    <InputField
                        label="Session"
                        name="slot"
                        value={formData.slot}
                        onChange={handleInputChange}
                        options={TIME_SLOTS}
                        required
                        error={errors.slot}
                    />
                </div>
            </div>

            {/* Status Box */}
            <div className={`mt-4 mb-6 rounded-2xl p-5 md:p-6 transition-all duration-300 border ${isFull
                ? 'bg-red-50 border-red-100'
                : (formData.date && formData.slot ? 'bg-slate-50 border-slate-200' : 'bg-white border-dashed border-slate-200')
                }`}>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex items-center gap-3 md:block">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isFull ? 'bg-white text-red-500 shadow-sm' : 'bg-white text-slate-900 shadow-sm'}`}>
                            {isFull ? <X size={20} strokeWidth={3} /> : <Activity size={20} strokeWidth={2} />}
                        </div>
                        <h4 className={`text-sm font-bold uppercase tracking-wider md:hidden ${isFull ? 'text-red-600' : 'text-slate-900'}`}>
                            {isFull ? "Session Full" : "Availability"}
                        </h4>
                    </div>

                    <div className="flex-grow">
                        <div className="hidden md:flex justify-between items-center mb-2">
                            <h4 className={`text-sm font-bold uppercase tracking-wider ${isFull ? 'text-red-600' : 'text-slate-900'}`}>
                                {isFull ? "Session Full" : "Availability"}
                            </h4>
                            {formData.date && formData.slot && (
                                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                                    {usersInCurrentSlot.length} / 2
                                </span>
                            )}
                        </div>

                        {formData.date && formData.slot ? (
                            <div>
                                {usersInCurrentSlot.length > 0 ? (
                                    <div className="mt-2 md:mt-3 pt-3 border-t border-slate-200/50">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Registered:</span>
                                        <div className="grid grid-cols-1 gap-2">
                                            {usersInCurrentSlot.map((u, idx) => (
                                                <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-800">{u.name}</span>
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Team: {u.team || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-500 block mt-1">Slot is currently empty.</span>
                                )}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 italic">Select date & time to view status</div>
                        )}
                    </div>
                </div>
            </div>

            <Button className="w-full shadow-lg shadow-slate-900/20" disabled={isFull && !isEdit}>
                {isEdit ? "Update Booking" : "Confirm Booking"}
            </Button>
        </form>
    );
};

const AdminView = ({ registrations, handleEditClick, handleDelete }) => {
    const [filterDate, setFilterDate] = useState('');
    const [filterSlot, setFilterSlot] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Debug: Log registrations
    console.log("👥 AdminView - Total registrations:", registrations.length);
    console.log("👥 AdminView - Registrations data:", registrations);

    const sortByNewestSubmit = (a, b) => {
        const ca = a.createdAt || '';
        const cb = b.createdAt || '';
        if (ca && cb) return cb.localeCompare(ca); // newest first
        if (cb || ca) return cb ? -1 : 1;
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return a.slot.localeCompare(b.slot);
    };

    const filteredRegistrations = registrations.filter(item => {
        const matchDate = filterDate ? item.date === filterDate : true;
        const matchSlot = filterSlot ? item.slot === filterSlot : true;
        const matchName = searchTerm ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        return matchDate && matchSlot && matchName;
    });

    console.log("🔍 AdminView - Filtered registrations:", filteredRegistrations.length);

    return (
        <div className="animate-slideUp w-full max-w-5xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-900">Member List</h2>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                            Total: {filteredRegistrations.length} {registrations.length !== filteredRegistrations.length && `(filtered from ${registrations.length})`}
                        </p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <User size={20} className="text-slate-400" />
                    </div>
                </div>

                {/* Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Search Name</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Type to search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Filter Date</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Select Date"
                                onFocus={(e) => (e.target.type = "date")}
                                onBlur={(e) => {
                                    if (!e.target.value) e.target.type = "text";
                                }}
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors text-slate-600 uppercase placeholder:text-slate-400 appearance-none"
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                    <div className="relative">
                        <label className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">Filter Session</label>
                        <div className="relative">
                            <select
                                value={filterSlot}
                                onChange={(e) => setFilterSlot(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-slate-900 transition-colors text-slate-600 appearance-none"
                            >
                                <option value="">All Sessions</option>
                                {TIME_SLOTS.map(slot => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {(filterDate || filterSlot || searchTerm) && (
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => { setFilterDate(''); setFilterSlot(''); setSearchTerm(''); }}
                            className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <X size={12} /> Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-4 bg-slate-50 min-h-[200px]">
                {filteredRegistrations.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm italic">No bookings found matching filters</div>
                ) : (
                    filteredRegistrations.sort(sortByNewestSubmit).map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-fadeIn">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-slate-900">{item.name}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">{item.team || "N/A"}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditClick(item)} className="p-2 bg-slate-50 text-blue-600 rounded-lg"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-50 text-red-600 rounded-lg"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="flex gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-lg">
                                <Calendar size={14} /> {item.date}
                                <span className="text-slate-300">|</span>
                                <Clock size={14} /> {item.slot}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left border-collapse">
                <thead className="bg-white">
                    <tr>
                        <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date & Time</th>
                        <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Member Name</th>
                        <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400">Team</th>
                        <th className="py-6 px-8 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {filteredRegistrations.length === 0 ? (
                        <tr><td colSpan={4} className="py-12 text-center text-slate-400 font-medium italic">No active bookings found matching filters</td></tr>
                    ) : (
                        filteredRegistrations.sort(sortByNewestSubmit).map((item) => (
                            <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/80 transition-colors group">
                                <td className="py-5 px-8">
                                    <div className="text-slate-900 font-bold">{item.date}</div>
                                    <div className="text-slate-500 text-xs font-bold mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded">{item.slot}</div>
                                </td>
                                <td className="py-5 px-8">
                                    <div className="font-bold text-slate-800">{item.name}</div>
                                </td>
                                <td className="py-5 px-8">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 px-2 py-1 rounded-md">{item.team || "—"}</span>
                                </td>
                                <td className="py-5 px-8 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <button onClick={() => handleEditClick(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// --- MAIN APP ---

export default function GymBookingApp() {
    const [activeTab, setActiveTab] = useState('booking');
    const [registrations, setRegistrations] = useState([]);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        team: '',
        date: new Date().toISOString().split('T')[0],
        slot: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const [formErrorMessage, setFormErrorMessage] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [calendarView, setCalendarView] = useState('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDayDetail, setSelectedDayDetail] = useState(null);

    // Firestore Real-time Listener
    useEffect(() => {
        // Debug: Kiểm tra Firebase connection
        console.log("🔍 Firebase DB object:", db);
        console.log("🔍 Firebase DB type:", typeof db);
        console.log("🚀 Bắt đầu kết nối Firestore...");
        console.log("📦 Database object:", db);
        
        // Kiểm tra db có tồn tại không
        if (!db) {
            console.error("❌ Firestore database không được khởi tạo!");
            alert("⚠️ Lỗi kết nối Firebase!\n\nVui lòng kiểm tra:\n1. File .env có đầy đủ biến\n2. Firebase config đúng\n3. Restart dev server sau khi sửa .env");
            return;
        }
        
        try {
            // Không dùng orderBy trong query để tránh cần index, sẽ sort client-side
            const q = query(collection(db, 'bookings'));
            console.log("📝 Query created:", q);
            
            const unsubscribe = onSnapshot(q, 
                (snapshot) => {
                    console.log("📥 Snapshot received:", snapshot);
                    console.log("📊 Snapshot size:", snapshot.size);
                    console.log("📄 Snapshot docs:", snapshot.docs.length);
                    
                    const bookings = snapshot.docs.map(doc => {
                        const data = doc.data();
                        console.log("📋 Document ID:", doc.id, "Data:", data);
                        return {
                            id: doc.id,
                            name: data.name || '',
                            team: data.team || '',
                            date: data.date || '',
                            slot: data.slot || '',
                            createdAt: data.createdAt || '',
                            updatedAt: data.updatedAt || ''
                        };
                    });
                    
                    console.log("🔥 Đã tải:", bookings.length, "bookings", "Source:", snapshot.metadata.fromCache ? "Local Cache" : "Server");
                    console.log("📋 Bookings data:", bookings);

                    // Sort client-side by date (desc) then slot (asc)
                    bookings.sort((a, b) => {
                        if (!a.date || !b.date) return 0;
                        const dateCompare = b.date.localeCompare(a.date);
                        if (dateCompare !== 0) return dateCompare;
                        if (!a.slot || !b.slot) return 0;
                        return a.slot.localeCompare(b.slot);
                    });

                    console.log("✅ Setting registrations:", bookings);
                    setRegistrations(bookings);
                }, 
                (error) => {
                    console.error('❌ Error fetching bookings:', error);
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);
                    console.error('Full error object:', error);
                    
                    // Chỉ hiển thị alert nếu không phải lỗi permission (để tránh spam)
                    if (error.code !== 'permission-denied') {
                        alert(`Lỗi kết nối Data: ${error.message}\n\nVui lòng kiểm tra:\n1. Kết nối internet\n2. Firestore security rules\n3. Firebase configuration`);
                    } else {
                        console.error('⚠️ Permission denied - Kiểm tra Firestore Rules!');
                        alert('⚠️ Lỗi quyền truy cập!\n\nVui lòng kiểm tra Firestore Security Rules:\n- Vào Firebase Console > Firestore > Rules\n- Đảm bảo có: allow read, write: if true;\n- Click "Publish" để lưu');
                    }
                }
            );
            
            console.log("✅ onSnapshot listener đã được thiết lập");
            
            return () => {
                console.log("🛑 Unsubscribing from Firestore listener");
                unsubscribe();
            };
        } catch (error) {
            console.error('❌ Lỗi khi thiết lập Firestore listener:', error);
            alert(`Lỗi khởi tạo: ${error.message}`);
        }
    }, []);

    // --- PWA SETUP ---
    useEffect(() => {
        // 1. Set Document Title
        document.title = "Diageo";

        // 2. Register Service Worker
        const registerServiceWorker = async () => {
            if ('serviceWorker' in navigator) {
                try {
                    // Wait a bit for page to load
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Unregister old service workers
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (let registration of registrations) {
                        await registration.unregister();
                        console.log('🗑️ Unregistered old SW:', registration.scope);
                    }
                    
                    // Register new service worker
                    const registration = await navigator.serviceWorker.register('/sw.js', { 
                        scope: '/' 
                    });
                    console.log('✅ Service Worker registered:', registration.scope);
                    
                    // Wait for service worker to be ready
                    if (registration.installing) {
                        console.log('⏳ Service Worker installing...');
                        registration.installing.addEventListener('statechange', (e) => {
                            if (e.target.state === 'activated') {
                                console.log('✅ Service Worker activated!');
                            }
                        });
                    } else if (registration.waiting) {
                        console.log('⏳ Service Worker waiting...');
                    } else if (registration.active) {
                        console.log('✅ Service Worker active!');
                    }
                    
                } catch (error) {
                    console.error('❌ Service Worker registration failed:', error);
                }
            }
        };

        registerServiceWorker();

        // 3. Inject Meta Tags for PWA
        const metaTags = [
            { name: 'mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'apple-mobile-web-app-title', content: 'Diageo' }
        ];

        metaTags.forEach(tagInfo => {
            let meta = document.querySelector(`meta[name="${tagInfo.name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.name = tagInfo.name;
                document.head.appendChild(meta);
            }
            meta.content = tagInfo.content;
        });

        // 4. Handle Install Prompt
        const handleBeforeInstallPrompt = (e) => {
            console.log('🎯 beforeinstallprompt event fired!');
            e.preventDefault();
            setDeferredPrompt(e);
            console.log('✅ Install prompt saved to state');
        };

        // Listen for install prompt (can take a few seconds)
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('📱 App is already installed');
        }

        // Mobile detection and install prompt handling
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);

        if (isMobile) {
            console.log('📱 Mobile device detected:', { isIOS, isAndroid });
        }

        // Debug: Log PWA readiness
        setTimeout(() => {
            console.log('🔍 PWA Status Check:');
            console.log('- Service Worker:', 'serviceWorker' in navigator);
            console.log('- Manifest:', document.querySelector('link[rel="manifest"]')?.href);
            console.log('- Deferred Prompt:', deferredPrompt ? 'Available' : 'Not available');
            console.log('- Is Mobile:', isMobile);
            console.log('- Is iOS:', isIOS);
            console.log('- Is Android:', isAndroid);
        }, 2000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        console.log('🔘 Install button clicked');
        console.log('Deferred prompt available:', !!deferredPrompt);
        
        if (deferredPrompt) {
            try {
                // Show the install prompt
                deferredPrompt.prompt();
                
                // Wait for the user to respond
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`👤 User choice: ${outcome}`);
                
                if (outcome === 'accepted') {
                    console.log('✅ User accepted installation');
                    // Clear the prompt after installation
                    setDeferredPrompt(null);
                } else {
                    console.log('❌ User dismissed installation');
                    // Keep the prompt available for next time
                }
            } catch (error) {
                console.error('❌ Error showing install prompt:', error);
                // Clear invalid prompt
                setDeferredPrompt(null);
            }
        } else {
            // Check if app is already installed
            const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
            
            if (isInstalled) {
                console.log('📱 App is already installed');
                // Allow reinstallation - browser will handle it
                alert('App đã được cài đặt. Bạn có thể cài đặt lại từ menu trình duyệt:\n\nChrome/Edge: Menu (⋮) > Cài đặt ứng dụng\nSafari: Share > Add to Home Screen');
            } else {
                // Check service worker status
                if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    if (registrations.length === 0) {
                        alert('Đang đăng ký Service Worker...\nVui lòng đợi vài giây rồi thử lại.');
                        return;
                    }
                }
                
                // Detect platform
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                const isAndroid = /Android/i.test(navigator.userAgent);
                const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent);
                const isEdge = /Edg/i.test(navigator.userAgent);
                
                if (isIOS) {
                    alert('Cài đặt trên iOS:\n\n1. Nhấn nút Share (hình vuông với mũi tên lên)\n2. Cuộn xuống\n3. Chọn "Add to Home Screen"\n4. Nhấn "Add"');
                } else if (isAndroid && (isChrome || isEdge)) {
                    alert('Cài đặt trên Android:\n\n1. Nhấn menu (⋮) ở góc trên bên phải\n2. Chọn "Cài đặt ứng dụng" hoặc "Install app"\n3. Nhấn "Install" trong popup\n\nHoặc đợi banner "Add to Home screen" xuất hiện ở dưới màn hình.');
                } else {
                    alert('Cài đặt ứng dụng:\n\nPrompt sẽ xuất hiện tự động khi sẵn sàng.\n\nHoặc:\n- Chrome/Edge: Menu (⋮) > Cài đặt ứng dụng\n- Safari: Share > Add to Home Screen\n\nĐảm bảo bạn đang dùng HTTPS hoặc localhost.');
                }
            }
        }
    };

    // --- LOGIC ---

    const getUsersInSlot = (date, slot) => {
        return registrations.filter(r => r.date === date && r.slot === slot);
    };

    const isSlotFull = (date, slot) => {
        const currentCount = registrations.filter(r =>
            r.date === date &&
            r.slot === slot &&
            r.id !== editingId
        ).length;
        return currentCount >= 2;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        if (formErrorMessage) {
            setFormErrorMessage('');
        }
    };

    // Load saved draft on mount
    useEffect(() => {
        const savedDraft = localStorage.getItem('bookingDraft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                // Only restore if it's not too old (optional, but good practice)? For now just restore.
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Failed to load draft", e);
            }
        }
    }, []);

    // Save draft on change
    useEffect(() => {
        localStorage.setItem('bookingDraft', JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear previous errors
        setFormErrors({});
        setFormErrorMessage('');

        // Validation Check - Collect all missing required fields
        const errors = {};
        let hasErrors = false;

        if (!formData.name || formData.name.trim() === '') {
            errors.name = true;
            hasErrors = true;
        }

        if (!formData.date || formData.date.trim() === '') {
            errors.date = true;
            hasErrors = true;
        }

        if (!formData.slot || formData.slot.trim() === '') {
            errors.slot = true;
            hasErrors = true;
        }

        // If there are validation errors, set them and return
        if (hasErrors) {
            setFormErrors(errors);
            
            // Create detailed error message
            const missingFields = [];
            if (errors.name) missingFields.push('Tên');
            if (errors.date) missingFields.push('Ngày');
            if (errors.slot) missingFields.push('Khung giờ');
            
            setFormErrorMessage(`Vui lòng điền đầy đủ: ${missingFields.join(', ')} (các trường có dấu * là bắt buộc).`);
            
            // Scroll to first error field
            const firstErrorField = document.querySelector('[name="' + Object.keys(errors)[0] + '"]');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorField.focus();
            }
            
            return;
        }

        if (isSlotFull(formData.date, formData.slot)) {
            alert("Slot is full. Please choose another time.");
            return;
        }

        try {
            if (editingId) {
                // Update existing booking
                const bookingRef = doc(db, 'bookings', editingId);
                await updateDoc(bookingRef, {
                    ...formData,
                    updatedAt: new Date().toISOString()
                });
                console.log("✅ Booking updated:", editingId);
                setEditingId(null);
                setIsEditModalOpen(false);
                alert("Booking updated successfully.");
            } else {
                // Create new booking
                const bookingData = {
                    ...formData,
                    createdAt: new Date().toISOString()
                };
                console.log("💾 Saving booking:", bookingData);
                const docRef = await addDoc(collection(db, 'bookings'), bookingData);
                console.log("✅ Booking saved with ID:", docRef.id);
                alert("Booking confirmed.");
            }

            setFormData({
                name: '',
                team: '',
                date: new Date().toISOString().split('T')[0],
                slot: ''
            });
            // Clear errors on successful submit
            setFormErrors({});
            setFormErrorMessage('');
        } catch (error) {
            console.error('❌ Error saving booking:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            alert(`Lỗi khi lưu booking:\n${error.message}\n\nVui lòng kiểm tra:\n1. Firestore security rules cho phép write\n2. Kết nối internet\n3. Firebase configuration`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Remove this booking?")) {
            try {
                await deleteDoc(doc(db, 'bookings', id));
                alert("Booking deleted successfully.");
            } catch (error) {
                console.error('Error deleting booking:', error);
                alert('Error deleting booking. Please try again.');
            }
        }
    };


    const handleEditClick = (item) => {
        setEditingId(item.id);
        setFormData({
            name: item.name,
            team: item.team,
            date: item.date,
            slot: item.slot
        });
        setFormErrors({}); // Clear errors when opening edit modal
        setIsEditModalOpen(true);
    };

    const handleDayClick = (dateStr, bookings) => {
        setSelectedDayDetail({ dateStr, bookings });
    };

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (calendarView === 'month') newDate.setMonth(newDate.getMonth() + direction);
        else newDate.setDate(newDate.getDate() + (direction * 7));
        setCurrentDate(newDate);
    };

    // Derive state for form display
    const isFull = !editingId && formData.date && formData.slot && isSlotFull(formData.date, formData.slot);
    const usersInCurrentSlot = formData.date && formData.slot ? getUsersInSlot(formData.date, formData.slot) : [];

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24">
            {/* INTERNAL USE BANNER - Highlighted */}
            <div className="bg-red-600 text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] py-2 text-center flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
                <Lock size={12} className="animate-pulse" />
                <span>Diageo Internal Use Only</span>
            </div>

            {/* Navbar */}
            <nav className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
                    <div className="flex flex-col cursor-pointer" onClick={() => setActiveTab('booking')}>
                        <div className="bg-white p-2 rounded-lg flex items-center justify-center">
                            <img src="/Logo.ico" alt="Diageo Logo" className="h-8 md:h-10 w-auto" />
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex bg-slate-100 p-1 rounded-xl items-center gap-2">
                        {['booking', 'admin'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 md:px-5 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                {tab}
                            </button>
                        ))}
                        <button onClick={handleInstallClick} className="px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg text-slate-400 hover:text-slate-900 flex items-center gap-1">
                            <Download size={14} /> Install
                        </button>
                    </div>

                    {/* Mobile Install/Nav (Simplified) */}
                    <div className="flex md:hidden bg-slate-100 p-1 rounded-lg items-center gap-1">
                        {['booking', 'admin'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                {tab}
                            </button>
                        ))}
                        <button onClick={handleInstallClick} className="px-3 py-2 text-slate-400 hover:text-slate-900">
                            <Download size={14} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12">
                {activeTab === 'booking' ? (
                    <div className="flex flex-col items-center animate-slideUp">
                        {/* Hero */}
                        <div className="text-center mb-8 md:mb-12 px-2">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-2 md:mb-3 tracking-tight leading-tight">Gym Registration Form</h1>
                            <p className="text-slate-500 font-medium text-sm md:text-base mb-3 md:mb-4">
                                at GT Fitness Center
                            </p>
                            <p className="text-slate-500 font-medium text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
                                All members in Diageo can use this membership card with maximum access 2 person/time
                            </p>
                        </div>

                        {/* Booking Card */}
                        <div className="w-full max-w-3xl bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-slate-200/50 p-5 md:p-12 border border-slate-100 mb-8 md:mb-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-60"></div>
                            <div className="relative z-10">
                                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-3">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white"><Clock size={16} /></span>
                                    Book Your Session
                                </h3>
                                <BookingForm
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSubmit={handleSubmit}
                                    isEdit={false}
                                    isFull={isFull}
                                    usersInCurrentSlot={usersInCurrentSlot}
                                    errors={formErrors}
                                    errorMessage={formErrorMessage}
                                />
                            </div>
                        </div>

                        <CalendarComponent
                            calendarView={calendarView}
                            setCalendarView={setCalendarView}
                            currentDate={currentDate}
                            navigateDate={navigateDate}
                            handleDayClick={handleDayClick}
                            registrations={registrations}
                        />
                    </div>
                ) : (
                    <AdminView
                        registrations={registrations}
                        handleEditClick={handleEditClick}
                        handleDelete={handleDelete}
                    />
                )}
            </main>

            {/* Day Details Modal */}
            <Modal
                isOpen={!!selectedDayDetail}
                onClose={() => setSelectedDayDetail(null)}
                title="Daily Schedule Log"
            >
                <DayDetailsContent selectedDayDetail={selectedDayDetail} />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingId(null); }}
                title="Update Booking"
            >
                <BookingForm
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    isEdit={true}
                    isFull={false} // Editing mode doesn't block submit on full (except logic handled in submit)
                    usersInCurrentSlot={usersInCurrentSlot}
                    errors={formErrors}
                    errorMessage={formErrorMessage}
                />
            </Modal>

            <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        `}</style>
        </div>
    );
}