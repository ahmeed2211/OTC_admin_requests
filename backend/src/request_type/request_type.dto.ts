
import { ApiProperty } from '@nestjs/swagger';
export class RequestTypeDto{
    @ApiProperty({example : "conge"})
    name: string;
    @ApiProperty({example : "Description of the request type"})
    description : string; 
    @ApiProperty()
    isActive : boolean;
}