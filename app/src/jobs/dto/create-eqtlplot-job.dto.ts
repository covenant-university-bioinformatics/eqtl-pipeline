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
import { EqtlOptions, GeneListOptions } from '../models/eqtlplot.model';
import { CommonJobDto } from './common-job.dto';

export class CreateEqtlPlotJobDto extends CommonJobDto {
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
  @IsEnum(EqtlOptions)
  eqtl_summary: EqtlOptions;

  @IsString()
  probe: string;

  @IsNumberString()
  @IsOptional()
  probe_wind: string;

  @IsNotEmpty()
  @IsEnum(GeneListOptions)
  gene_list: GeneListOptions;

  @IsNumberString()
  @IsOptional()
  smr_thresh: string;

  @IsNumberString()
  @IsOptional()
  heidi_thresh: string;

  @IsNumberString()
  @IsOptional()
  plotWindow: string;

  @IsNumberString()
  @IsOptional()
  max_anno_probe: string;
}
