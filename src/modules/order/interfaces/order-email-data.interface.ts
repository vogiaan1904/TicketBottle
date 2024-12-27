class Ticket {
  ticketClassName: string;
  quantity: number;
  price: number;
}

export class OrderSuccessDataDto {
  orderId: string;
  eventName: string;
  userFirstName: string;
  tickets: Ticket[];
  paymentGateway: string;
  totalPayment: number;
  orderTime: Date;
}
