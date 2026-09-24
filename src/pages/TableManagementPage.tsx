import React, { useState } from 'react';
import { useSystemStore } from '../context/SystemStoreContext';
import type { Table, TableStatus } from '../types';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { getReservationWarningInfo } from '../utils/reservationUtils';
import { Users, Merge, PlusCircle, Clock, Calendar, Phone, User, BookmarkCheck, CheckCircle, Edit2, Plus, Trash2, AlertTriangle } from 'lucide-react';

export const TableManagementPage: React.FC = () => {
  const { tables, orders, addTable, deleteTable, updateTableStatus, reserveTable, cancelReservation, mergeTables, unmergeTable, createOrder, addToast } = useSystemStore();
  const navigate = useNavigate();

  const [selectedPrimaryTable, setSelectedPrimaryTable] = useState<string>('');
  const [selectedSecondaryTables, setSelectedSecondaryTables] = useState<string[]>([]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);

  // Add Table Modal State
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState<boolean>(false);
  const [newTableNumber, setNewTableNumber] = useState<string>('');
  const [newTableCapacity, setNewTableCapacity] = useState<string>('4');

  // Delete Table Modal State
  const [deletingTable, setDeletingTable] = useState<Table | null>(null);

  // Reservation Modal State
  const [reservingTable, setReservingTable] = useState<Table | null>(null);
  const [resName, setResName] = useState<string>('');
  const [resPhone, setResPhone] = useState<string>('');
  const [resDate, setResDate] = useState<string>('');
  const [resTime, setResTime] = useState<string>('');
  const [resGuests, setResGuests] = useState<string>('2');
  const [isDateTimeConfirmed, setIsDateTimeConfirmed] = useState<boolean>(false);

  // Interactive Time Picker Dropdown State
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false);
  const [selectedHour, setSelectedHour] = useState<string>('19');
  const [selectedMinute, setSelectedMinute] = useState<string>('30');

  const formatTimeTo12Hour = (time24: string) => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    if (isNaN(h)) return time24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${mStr || '00'} ${ampm}`;
  };

  const handleOpenPOS = (table: Table) => {
    const resWarning = getReservationWarningInfo(table);
    if (resWarning) {
      addToast(resWarning.message, 'warning');
    }

    const activeOrder = orders.find(
      (o) => o.status === 'Active' && (o.id === table.currentOrderId || o.tableId === table.id)
    );

    if (activeOrder) {
      navigate(`/order-entry?orderId=${activeOrder.id}`);
    } else {
      const order = createOrder(
        'Dine-In',
        table.id,
        table.reservationCustomerName,
        table.reservationCustomerPhone
      );
      navigate(`/order-entry?orderId=${order.id}`);
    }
  };

  const handleOpenAddTableModal = () => {
    setNewTableNumber(`Table ${String(tables.length + 1).padStart(2, '0')}`);
    setNewTableCapacity('4');
    setIsAddTableModalOpen(true);
  };

  const handleSaveNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;
    addTable({
      tableNumber: newTableNumber.trim(),
      capacity: parseInt(newTableCapacity) || 4,
      location: 'Main Dining',
    });
    setIsAddTableModalOpen(false);
  };

  const handleOpenReserveModal = (table: Table) => {
    setReservingTable(table);
    setResName(table.reservationCustomerName || '');
    setResPhone(table.reservationCustomerPhone || '');
    
    const today = new Date().toISOString().split('T')[0];
    const defaultTime = '19:30';

    if (table.reservationDateTime) {
      const parts = table.reservationDateTime.split('T');
      setResDate(parts[0] || today);
      const timePart = parts[1] || defaultTime;
      setResTime(timePart);
      const [h, m] = timePart.split(':');
      if (h) setSelectedHour(h);
      if (m) setSelectedMinute(m);
      setIsDateTimeConfirmed(true);
    } else {
      setResDate(today);
      setResTime(defaultTime);
      setSelectedHour('19');
      setSelectedMinute('30');
      setIsDateTimeConfirmed(false);
    }

    setIsTimePickerOpen(false);
    setResGuests(table.guestCount ? table.guestCount.toString() : table.capacity.toString());
  };

  const handleSelectTimeAndClose = (timeStr: string) => {
    setResTime(timeStr);
    const [h, m] = timeStr.split(':');
    if (h) setSelectedHour(h);
    if (m) setSelectedMinute(m);
    setIsDateTimeConfirmed(true);
    setIsTimePickerOpen(false);
  };

  const handleSelectHour = (hr: string) => {
    setSelectedHour(hr);
    const newTime = `${hr}:${selectedMinute}`;
    setResTime(newTime);
    setIsDateTimeConfirmed(true);
  };

  const handleSelectMinute = (min: string) => {
    setSelectedMinute(min);
    const newTime = `${selectedHour}:${min}`;
    setResTime(newTime);
    setIsDateTimeConfirmed(true);
    setIsTimePickerOpen(false);
  };

  const handleConfirmDateTime = () => {
    setIsDateTimeConfirmed(true);
    setIsTimePickerOpen(false);
  };

  const handleSaveReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservingTable) return;
    const combinedDateTime = `${resDate}T${resTime}`;
    reserveTable(reservingTable.id, {
      customerName: resName || 'Guest',
      customerPhone: resPhone,
      dateTime: combinedDateTime,
      guestCount: parseInt(resGuests) || 2,
    });
    setReservingTable(null);
  };

  const handleExecuteMerge = () => {
    if (selectedPrimaryTable && selectedSecondaryTables.length > 0) {
      mergeTables(selectedPrimaryTable, selectedSecondaryTables);
      setIsMergeModalOpen(false);
      setSelectedPrimaryTable('');
      setSelectedSecondaryTables([]);
    }
  };

  // Helper to check table status taking active orders into account
  const getTableEffectiveState = (table: Table) => {
    const activeOrder = orders.find(
      (o) => o.status === 'Active' && (o.id === table.currentOrderId || o.tableId === table.id)
    );

    const isOccupied = !!activeOrder || table.status === 'Occupied';
    const effectiveStatus: TableStatus = isOccupied
      ? 'Occupied'
      : table.status === 'Reserved'
      ? 'Reserved'
      : table.status === 'Merged'
      ? 'Merged'
      : 'Free';

    return { activeOrder, effectiveStatus };
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Dining Floor Management</h2>
          <p className="text-xs text-slate-500 font-medium">Manage restaurant tables, reservations, and seating</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddTableModal}
          >
            Add New Table
          </Button>
          <Button
            variant="outline"
            icon={<Merge className="w-4 h-4" />}
            onClick={() => setIsMergeModalOpen(true)}
          >
            Merge Tables
          </Button>
        </div>
      </div>

      {/* Legend & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-800">Free Tables</span>
          <span className="text-lg font-bold text-emerald-800">
            {tables.filter((t) => getTableEffectiveState(t).effectiveStatus === 'Free').length}
          </span>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800">Occupied Tables</span>
          <span className="text-lg font-bold text-amber-800">
            {tables.filter((t) => getTableEffectiveState(t).effectiveStatus === 'Occupied').length}
          </span>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-800">Reserved Tables</span>
          <span className="text-lg font-bold text-indigo-800">
            {tables.filter((t) => getTableEffectiveState(t).effectiveStatus === 'Reserved').length}
          </span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-800">Merged Sets</span>
          <span className="text-lg font-bold text-blue-800">
            {tables.filter((t) => getTableEffectiveState(t).effectiveStatus === 'Merged').length}
          </span>
        </div>
      </div>

      {/* Interactive Tables Layout Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {tables.map((table) => {
          const { activeOrder, effectiveStatus } = getTableEffectiveState(table);

          return (
            <div
              key={table.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                effectiveStatus === 'Occupied'
                  ? 'border-amber-300 bg-amber-50/30'
                  : effectiveStatus === 'Reserved'
                  ? 'border-indigo-300 bg-indigo-50/30'
                  : effectiveStatus === 'Merged'
                  ? 'border-blue-300 bg-blue-50/30'
                  : 'border-slate-200 hover:border-[#0B4EAE]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-extrabold text-lg text-slate-800">{table.tableNumber}</h3>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge status={effectiveStatus} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingTable(table);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Table"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {table.capacity} Seats Capacity
                  </span>
                </div>

                {activeOrder && (
                  <div className="mt-3 p-2.5 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-amber-900">
                      <span>{activeOrder.orderNumber}</span>
                      <span>LKR {activeOrder.grandTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {activeOrder.customerName || 'Guest'} • {activeOrder.miniOrders.length} Mini-Orders
                    </p>
                  </div>
                )}

                {effectiveStatus === 'Reserved' && (() => {
                  const resWarn = getReservationWarningInfo(table);
                  return (
                    <div className={`mt-3 p-2.5 rounded-xl text-xs space-y-1 ${resWarn ? 'bg-amber-50 border border-amber-300' : 'bg-indigo-50 border border-indigo-200'}`}>
                      {resWarn && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 pb-1 border-b border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Reservation starts in &lt; 1 hour!</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-indigo-950">
                        <span>{table.reservationCustomerName || 'Reserved Guest'}</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {table.guestCount} Guests
                        </span>
                      </div>
                      {table.reservationDateTime && (
                        <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-medium">
                          <Calendar className="w-3 h-3 text-indigo-500" />
                          <span>
                            {new Date(table.reservationDateTime).toLocaleString([], {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      )}
                      {table.reservationCustomerPhone && (
                        <p className="text-[10px] text-slate-500">Phone: {table.reservationCustomerPhone}</p>
                      )}
                    </div>
                  );
                })()}

                {table.mergedWith && table.mergedWith.length > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-semibold flex items-center justify-between">
                    <span>Merged with {table.mergedWith.join(', ')}</span>
                    <button
                      onClick={() => unmergeTable(table.id)}
                      className="text-rose-600 hover:underline"
                    >
                      Unmerge
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                {effectiveStatus === 'Free' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      icon={<PlusCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenPOS(table)}
                    >
                      Start Order
                    </Button>
                    <button
                      onClick={() => handleOpenReserveModal(table)}
                      className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      Reserve
                    </button>
                  </>
                )}

                {effectiveStatus === 'Occupied' && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      icon={<Clock className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenPOS(table)}
                    >
                      View / Edit Order
                    </Button>
                    <button
                      onClick={() => updateTableStatus(table.id, 'Free')}
                      className="px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Free Table
                    </button>
                  </>
                )}

                {effectiveStatus === 'Reserved' && (
                  <div className="flex flex-col gap-1.5 w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                      icon={<BookmarkCheck className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenPOS(table)}
                    >
                      Seated (Start Order)
                    </Button>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <button
                        onClick={() => handleOpenReserveModal(table)}
                        className="flex-1 py-1 px-2 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1 border border-indigo-200"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Reservation</span>
                      </button>
                      <button
                        onClick={() => cancelReservation(table.id)}
                        className="py-1 px-2 text-xs font-semibold text-rose-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {effectiveStatus === 'Merged' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => handleOpenPOS(table)}
                  >
                    Open Merged Order
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Table Modal */}
      <Modal
        isOpen={isAddTableModalOpen}
        onClose={() => setIsAddTableModalOpen(false)}
        title="Create New Dining Table"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsAddTableModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveNewTable}>
              Save Table
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveNewTable} className="space-y-4">
          <Input
            label="Table Number / Name"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            placeholder="e.g. Table 09 or VIP Table 01"
            required
          />

          <Input
            label="Seating Capacity (Guests)"
            type="number"
            value={newTableCapacity}
            onChange={(e) => setNewTableCapacity(e.target.value)}
            placeholder="e.g. 4"
            icon={<Users className="w-4 h-4" />}
            required
          />
        </form>
      </Modal>

      {/* Delete Table Modal */}
      <Modal
        isOpen={!!deletingTable}
        onClose={() => setDeletingTable(null)}
        title={`Delete Table - ${deletingTable?.tableNumber}`}
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeletingTable(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deletingTable) deleteTable(deletingTable.id);
                setDeletingTable(null);
              }}
            >
              Delete Table
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to permanently remove <strong>{deletingTable?.tableNumber}</strong> from the dining floor plan?
        </p>
      </Modal>

      {/* Reserve Table Details Modal */}
      <Modal
        isOpen={!!reservingTable}
        onClose={() => setReservingTable(null)}
        title={
          reservingTable?.status === 'Reserved'
            ? `Edit Reservation - ${reservingTable?.tableNumber}`
            : `Reserve ${reservingTable?.tableNumber}`
        }
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setReservingTable(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveReservation}>
              {reservingTable?.status === 'Reserved' ? 'Update Reservation' : 'Confirm Table Reservation'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveReservation} className="space-y-4">
          {/* Aligned Date & Custom Time Picker Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0B4EAE]" />
                Select Reservation Date & Time
              </label>
              {isDateTimeConfirmed && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Confirmed
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Reservation Date</label>
                <input
                  type="date"
                  value={resDate}
                  onChange={(e) => {
                    setResDate(e.target.value);
                    setIsDateTimeConfirmed(false);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B4EAE]/30"
                  required
                />
              </div>

              <div className="relative">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Reservation Time</label>
                <button
                  type="button"
                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-[#0B4EAE] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#0B4EAE]/30"
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0B4EAE]" />
                    {formatTimeTo12Hour(resTime) || 'Select Time'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">({resTime})</span>
                </button>

                {/* Interactive Time Picker Popover */}
                {isTimePickerOpen && (
                  <div className="absolute top-full right-0 w-80 mt-2 z-40 bg-white rounded-2xl border border-slate-300 shadow-2xl p-4 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#0B4EAE]" /> Choose Hour & Minute
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsTimePickerOpen(false)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Popular Slots */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Popular Slots (Auto-Select & Close)
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: '08:00 AM', val: '08:00' },
                          { label: '09:30 AM', val: '09:30' },
                          { label: '11:00 AM', val: '11:00' },
                          { label: '12:30 PM', val: '12:30' },
                          { label: '01:30 PM', val: '13:30' },
                          { label: '07:00 PM', val: '19:00' },
                          { label: '07:30 PM', val: '19:30' },
                          { label: '08:30 PM', val: '20:30' },
                        ].map((slot) => (
                          <button
                            key={slot.val}
                            type="button"
                            onClick={() => handleSelectTimeAndClose(slot.val)}
                            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold transition-all border ${
                              resTime === slot.val
                                ? 'bg-[#0B4EAE] text-white border-[#0B4EAE] shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Morning Hours (AM) Grid */}
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center justify-between">
                        <span>Morning Hours (AM)</span>
                        <span className="text-[9px] font-normal text-slate-400">Breakfast & Brunch</span>
                      </span>
                      <div className="grid grid-cols-6 gap-1">
                        {[
                          { label: '7 AM', val: '07' },
                          { label: '8 AM', val: '08' },
                          { label: '9 AM', val: '09' },
                          { label: '10 AM', val: '10' },
                          { label: '11 AM', val: '11' },
                        ].map((hr) => (
                          <button
                            key={hr.val}
                            type="button"
                            onClick={() => handleSelectHour(hr.val)}
                            className={`py-1 rounded text-[11px] font-semibold transition-all border ${
                              selectedHour === hr.val
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            {hr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Afternoon & Evening Hours (PM) Grid */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center justify-between">
                        <span>Afternoon & Evening Hours (PM)</span>
                        <span className="text-[9px] font-normal text-slate-400">Lunch & Dinner</span>
                      </span>
                      <div className="grid grid-cols-6 gap-1">
                        {[
                          { label: '12 PM', val: '12' },
                          { label: '1 PM', val: '13' },
                          { label: '2 PM', val: '14' },
                          { label: '3 PM', val: '15' },
                          { label: '4 PM', val: '16' },
                          { label: '5 PM', val: '17' },
                          { label: '6 PM', val: '18' },
                          { label: '7 PM', val: '19' },
                          { label: '8 PM', val: '20' },
                          { label: '9 PM', val: '21' },
                          { label: '10 PM', val: '22' },
                          { label: '11 PM', val: '23' },
                        ].map((hr) => (
                          <button
                            key={hr.val}
                            type="button"
                            onClick={() => handleSelectHour(hr.val)}
                            className={`py-1 rounded text-[11px] font-semibold transition-all border ${
                              selectedHour === hr.val
                                ? 'bg-[#0B4EAE] text-white border-[#0B4EAE]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {hr.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Minutes Grid */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Step 2: Select Minute (Auto-Select & Close)
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['00', '15', '30', '45'].map((min) => (
                          <button
                            key={min}
                            type="button"
                            onClick={() => handleSelectMinute(min)}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              selectedMinute === min
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            :{min}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-[#0B4EAE] hover:bg-[#093D89] text-white font-bold"
                      onClick={() => handleSelectTimeAndClose(`${selectedHour}:${selectedMinute}`)}
                    >
                      OK - Select {formatTimeTo12Hour(`${selectedHour}:${selectedMinute}`)}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* OK Button for Date & Time Selection */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-200">
              <span className="text-xs text-slate-600 font-medium">
                Slot: <strong className="text-slate-900">{resDate || 'Date'}</strong> at <strong className="text-slate-900">{formatTimeTo12Hour(resTime) || resTime}</strong>
              </span>
              <button
                type="button"
                onClick={handleConfirmDateTime}
                className={`w-full sm:w-auto px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                  isDateTimeConfirmed
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-[#0B4EAE] hover:bg-[#093D89] text-white'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isDateTimeConfirmed ? 'Date & Time Confirmed (OK)' : 'OK - Confirm Selection'}</span>
              </button>
            </div>
          </div>

          <Input
            label="Customer / Guest Name"
            value={resName}
            onChange={(e) => setResName(e.target.value)}
            placeholder="e.g. Dr. Kasun Wickrama"
            icon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Customer Phone Number"
            value={resPhone}
            onChange={(e) => setResPhone(e.target.value)}
            placeholder="e.g. +94 77 888 9911"
            icon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Guest Count"
            type="number"
            value={resGuests}
            onChange={(e) => setResGuests(e.target.value)}
            placeholder="e.g. 4"
            icon={<Users className="w-4 h-4" />}
            required
          />
        </form>
      </Modal>

      {/* Merge Tables Modal */}
      <Modal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        title="Merge Multiple Dining Tables"
        footer={
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setIsMergeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExecuteMerge}>
              Confirm Merge
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Select Primary Lead Table
            </label>
            <select
              value={selectedPrimaryTable}
              onChange={(e) => setSelectedPrimaryTable(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            >
              <option value="">-- Choose Lead Table --</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tableNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Select Secondary Tables to Attach
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
              {tables
                .filter((t) => t.id !== selectedPrimaryTable)
                .map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      value={t.id}
                      checked={selectedSecondaryTables.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSecondaryTables([...selectedSecondaryTables, t.id]);
                        } else {
                          setSelectedSecondaryTables(
                            selectedSecondaryTables.filter((id) => id !== t.id)
                          );
                        }
                      }}
                      className="rounded text-[#0B4EAE]"
                    />
                    <span>{t.tableNumber}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
