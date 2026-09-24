import type { Table } from '../types';

export interface ReservationWarning {
  diffMinutes: number;
  formattedTime: string;
  customer: string;
  message: string;
}

export const getReservationWarningInfo = (table: Table): ReservationWarning | null => {
  if (!table || (!table.reservationDateTime && table.status !== 'Reserved')) {
    return null;
  }

  const now = new Date();
  let resDate: Date | null = null;

  if (table.reservationDateTime) {
    if (table.reservationDateTime.includes('T')) {
      resDate = new Date(table.reservationDateTime);
    } else if (table.reservationDateTime.includes(':')) {
      const [h, m] = table.reservationDateTime.split(':');
      resDate = new Date();
      resDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    } else {
      resDate = new Date(table.reservationDateTime);
    }
  }

  // Fallback if status is Reserved but reservationDateTime is missing
  if (!resDate || isNaN(resDate.getTime())) {
    if (table.status === 'Reserved') {
      const customer = table.reservationCustomerName || 'a guest';
      return {
        diffMinutes: 0,
        formattedTime: 'Upcoming',
        customer,
        message: `Warning: ${table.tableNumber} is reserved for ${customer}!`,
      };
    }
    return null;
  }

  const diffMs = resDate.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  // Trigger warning if reservation is within 1 hour (<= 60 mins away or started within last 30 mins)
  if (diffMinutes >= -30 && diffMinutes <= 60) {
    const formattedTime = resDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const customer = table.reservationCustomerName || 'a guest';
    const timeText =
      diffMinutes <= 0
        ? `started ${Math.abs(diffMinutes)} min${Math.abs(diffMinutes) === 1 ? '' : 's'} ago`
        : `starts in ${diffMinutes} min${diffMinutes === 1 ? '' : 's'}`;

    return {
      diffMinutes,
      formattedTime,
      customer,
      message: `Warning: ${table.tableNumber} has an upcoming reservation for ${customer} at ${formattedTime} (${timeText})!`,
    };
  }

  return null;
};
