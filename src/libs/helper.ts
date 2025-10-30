
import moment from 'moment';

export const formatDateTime = (value: string | number | Date) => {
  return moment(value).format('MMMM D, YYYY h:mm A');
};

export const getTimeAgo = (dateString: string) => {
  return moment(dateString).fromNow();
};