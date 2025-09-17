import { IsNumber, IsOptional, IsPositive } from "class-validator";
import { Transform } from "class-transformer";

export class PaginationDto {
    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsOptional()
    @IsPositive()
    page: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber()
    @IsPositive()
    @IsOptional()
    limit: number;
}