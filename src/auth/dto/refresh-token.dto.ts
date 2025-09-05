import { IsString } from "class-validator";

export class RefreshTokenDTO {
    @IsString({ message: 'Refresh token không được để trống' })
    token: string;
}