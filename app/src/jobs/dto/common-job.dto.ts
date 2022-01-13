import { IsNumberString, IsOptional } from 'class-validator';

export class CommonJobDto {
  @IsNumberString()
  @IsOptional()
  maf: string;

  @IsNumberString()
  @IsOptional()
  diff_freq: string;

  @IsNumberString()
  @IsOptional()
  diff_freq_prop: string;

  @IsNumberString()
  @IsOptional()
  cis_wind: string;

  @IsNumberString()
  @IsOptional()
  peqtl_smr: string;

  @IsNumberString()
  @IsOptional()
  ld_upper_limit: string;

  @IsNumberString()
  @IsOptional()
  ld_lower_limit: string;

  @IsNumberString()
  @IsOptional()
  peqtl_heidi: string;

  @IsNumberString()
  @IsOptional()
  heidi_mtd: string;

  @IsNumberString()
  @IsOptional()
  heidi_min_m: string;

  @IsNumberString()
  @IsOptional()
  heidi_max_m: string;
}
