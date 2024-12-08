import { ApiExtraModels } from '@nestjs/swagger';
import { ConnectOrderDetailDto } from '../../orderDetail/dto/connect-orderDetail.dto';

export class UpdateTicketOrderDetailRelationInputDto {
  connect: ConnectOrderDetailDto;
}

@ApiExtraModels(ConnectOrderDetailDto, UpdateTicketOrderDetailRelationInputDto)
export class UpdateTicketDto {
  orderDetail?: UpdateTicketOrderDetailRelationInputDto;
}
