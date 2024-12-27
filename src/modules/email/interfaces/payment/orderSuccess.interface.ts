class Ticket {
  ticketClassName: string;
  quantity: number;
}

export class OrderSuccessDataDto {
  orderId: string;
  eventName: string;
  tickets: Ticket[];
  paymentGateway: string;
  totalPayment: number;
  orderTime: Date;
}
