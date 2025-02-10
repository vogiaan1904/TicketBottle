class Ticket {
  ticketClassName: string;
  quantity: number;
  price: number;
}

export class OrderSuccessDataDto {
  orderCode: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  tickets: Ticket[];
  paymentGateway: string;
  totalAmount: number;
  orderTime: string;
}
