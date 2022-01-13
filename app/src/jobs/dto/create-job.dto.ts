import {
  IsNumberString,
  IsString,
  MaxLength,
  MinLength,
  IsEnum,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsBooleanString,
} from 'class-validator';
import { Populations, OnOffOptions, TISSUEOptions } from '../models/eqtl.model';
import { CommonJobDto } from './common-job.dto';

export class CreateJobDto extends CommonJobDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  job_name: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsBooleanString()
  useTest: string;

  @IsNumberString()
  marker_name: string;

  @IsNumberString()
  effect_allele: string;

  @IsNumberString()
  alternate_allele: string;

  @IsNumberString()
  effect_allele_freq: string;

  @IsNumberString()
  beta: string;

  @IsNumberString()
  se: string;

  @IsNumberString()
  p_value: string;

  @IsNumberString()
  sample_size: string;

  @IsNotEmpty()
  @IsEnum(Populations)
  population: Populations;

  @IsNotEmpty()
  @IsEnum(OnOffOptions)
  heidi: OnOffOptions;

  @IsNotEmpty()
  @IsEnum(OnOffOptions)
  trans: OnOffOptions;

  @IsNotEmpty()
  @IsEnum(OnOffOptions)
  smr_multi: OnOffOptions;

  @IsNumberString()
  @IsOptional()
  trans_wind: string;

  @IsNumberString()
  @IsOptional()
  set_wind: string;

  @IsNumberString()
  @IsOptional()
  ld_multi_snp: string;

  @IsBooleanString()
  Westra_eqtl: string;

  @IsBooleanString()
  CAGE_eqtl: string;

  @IsNotEmpty()
  @IsEnum(TISSUEOptions)
  GTEx_v8_tissue: TISSUEOptions;
}
