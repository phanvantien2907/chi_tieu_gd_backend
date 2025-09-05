import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RefreshTokenDTO {
    @IsString({ message: 'Refresh token không được để trống' })
    @ApiProperty({ example: 'c89b236b-a651-44fa-9051-f2e9b033214a', description: 'Refresh token' })
    token: string;
}