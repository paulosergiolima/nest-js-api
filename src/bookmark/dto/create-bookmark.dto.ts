import { IsNotEmpty, IsOptional, IsString } from "class-validator"
import { title } from "process"

export class CreateBookmarkDto {
    @IsString()
    @IsNotEmpty()
    title: string
    
    @IsString()
    @IsOptional()
    description?: string

    @IsString()
    @IsNotEmpty()
    link: string
}