import { ApiExtraModels } from '@nestjs/swagger';
import { ConnectOrderDetailDto } from '../../orderDetail/dto/connect-orderDetail.dto';

export class CreateTicketOrderDetailRelationInputDto {
  connect: ConnectOrderDetailDto;
}

@ApiExtraModels(ConnectOrderDetailDto, CreateTicketOrderDetailRelationInputDto)
export class CreateTicketDto {
  orderDetail?: CreateTicketOrderDetailRelationInputDto;
}
