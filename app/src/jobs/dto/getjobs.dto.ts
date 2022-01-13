import { IsNumberString, IsOptional, IsString, Matches } from 'class-validator';

export class GetJobsDto {
  @IsOptional()
  @IsString()
  select: string;

  @IsOptional()
  @IsString()
  sort: string;

  @IsOptional()
  @IsString()
  @Matches(/(?<!\d)\d{1,2}(?!\d)/, {
    message: 'Please send valid limit value',
  })
  limit: string;

  @IsOptional()
  @IsNumberString()
  @Matches(/(?<!\d)\d{1,2}(?!\d)/, {
    message: 'Please send valid page number',
  })
  page: string;
}
