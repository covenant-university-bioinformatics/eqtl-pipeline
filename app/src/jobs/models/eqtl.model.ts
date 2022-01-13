import * as mongoose from 'mongoose';
import { JobStatus } from './eqtl.jobs.model';

export enum Populations {
  AFR = 'afr',
  AMR = 'amr',
  EUR = 'eur',
  EAS = 'eas',
  SAS = 'sas',
}

export enum OnOffOptions {
  ON = 'on',
  OFF = 'off',
}

export enum TrueFalseOptions {
  TRUE = 'true',
  FALSE = 'false',
}

export enum TISSUEOptions {
  Adipose_Subcutaneous = 'Adipose_Subcutaneous',
  Adipose_Visceral_Omentum = 'Adipose_Visceral_Omentum',
  Adrenal_Gland = 'Adrenal_Gland',
  Artery_Aorta = 'Artery_Aorta',
  Artery_Coronary = 'Artery_Coronary',
  Artery_Tibial = 'Artery_Tibial',
  Brain_Amygdala = 'Brain_Amygdala',
  Brain_Anterior_cingulate_cortex_BA24 = 'Brain_Anterior_cingulate_cortex_BA24',
  Brain_Caudate_basal_ganglia = 'Brain_Caudate_basal_ganglia',
  Brain_Cerebellar_Hemisphere = 'Brain_Cerebellar_Hemisphere',
  Brain_Cerebellum = 'Brain_Cerebellum',
  Brain_Cortex = 'Brain_Cortex',
  Brain_Frontal_Cortex_BA9 = 'Brain_Frontal_Cortex_BA9',
  Brain_Hippocampus = 'Brain_Hippocampus',
  Brain_Hypothalamus = 'Brain_Hypothalamus',
  Brain_Nucleus_accumbens_basal_ganglia = 'Brain_Nucleus_accumbens_basal_ganglia',
  Brain_Putamen_basal_ganglia = 'Brain_Putamen_basal_ganglia',
  Brain_Spinal_cord_cervical_c_1 = 'Brain_Spinal_cord_cervical_c_1',
  Brain_Substantia_nigra = 'Brain_Substantia_nigra',
  Breast_Mammary_Tissue = 'Breast_Mammary_Tissue',
  Cells_Cultured_fibroblasts = 'Cells_Cultured_fibroblasts',
  Cells_EBV_transformed_lymphocytes = 'Cells_EBV_transformed_lymphocytes',
  Colon_Sigmoid = 'Colon_Sigmoid',
  Colon_Transverse = 'Colon_Transverse',
  Esophagus_Gastroesophageal_Junction = 'Esophagus_Gastroesophageal_Junction',
  Esophagus_Mucosa = 'Esophagus_Mucosa',
  Esophagus_Muscularis = 'Esophagus_Muscularis',
  Heart_Atrial_Appendage = 'Heart_Atrial_Appendage',
  Heart_Left_Ventricle = 'Heart_Left_Ventricle',
  Kidney_Cortex = 'Kidney_Cortex',
  Liver = 'Liver',
  Lung = 'Lung',
  Minor_Salivary_Gland = 'Minor_Salivary_Gland',
  Muscle_Skeletal = 'Muscle_Skeletal',
  Nerve_Tibial = 'Nerve_Tibial',
  Ovary = 'Ovary',
  Pancreas = 'Pancreas',
  Pituitary = 'Pituitary',
  Prostate = 'Prostate',
  Skin_Not_Sun_Exposed_Suprapubic = 'Skin_Not_Sun_Exposed_Suprapubic',
  Skin_Sun_Exposed_Lower_leg = 'Skin_Sun_Exposed_Lower_leg',
  Small_Intestine_Terminal_Ileum = 'Small_Intestine_Terminal_Ileum',
  Spleen = 'Spleen',
  Stomach = 'Stomach',
  Testis = 'Testis',
  Thyroid = 'Thyroid',
  Uterus = 'Uterus',
  Vagina = 'Vagina',
  Whole_Blood = 'Whole_Blood',
}

console.log(Object.values(TISSUEOptions));

//Interface that describe the properties that are required to create a new job
interface EqtlAttrs {
  job: string;
  population: Populations;
  heidi: OnOffOptions;
  trans: OnOffOptions;
  smr_multi: OnOffOptions;
  maf: string;
  diff_freq: string;
  diff_freq_prop: string;
  cis_wind: string;
  peqtl_smr: string;
  ld_upper_limit: string;
  ld_lower_limit: string;
  peqtl_heidi: string;
  heidi_mtd: string;
  heidi_min_m: string;
  heidi_max_m: string;
  trans_wind: string;
  set_wind: string;
  ld_multi_snp: string;
  Westra_eqtl: string;
  CAGE_eqtl: string;
  GTEx_v8_tissue: TISSUEOptions;
}

// An interface that describes the extra properties that a eqtl model has
//collection level methods
interface EqtlModel extends mongoose.Model<EqtlDoc> {
  build(attrs: EqtlAttrs): EqtlDoc;
}

//An interface that describes a properties that a document has
export interface EqtlDoc extends mongoose.Document {
  id: string;
  version: number;
  population: Populations;
  heidi: OnOffOptions;
  trans: OnOffOptions;
  smr_multi: OnOffOptions;
  maf: string;
  diff_freq: string;
  diff_freq_prop: string;
  cis_wind: string;
  peqtl_smr: string;
  ld_upper_limit: string;
  ld_lower_limit: string;
  peqtl_heidi: string;
  heidi_mtd: string;
  heidi_min_m: string;
  heidi_max_m: string;
  trans_wind: string;
  set_wind: string;
  ld_multi_snp: string;
  Westra_eqtl: string;
  CAGE_eqtl: string;
  GTEx_v8_tissue: TISSUEOptions;
}

const EqtlSchema = new mongoose.Schema<EqtlDoc, EqtlModel>(
  {
    population: {
      type: String,
      enum: [
        Populations.AFR,
        Populations.AMR,
        Populations.EUR,
        Populations.EAS,
        Populations.SAS,
      ],
      trim: true,
    },
    heidi: {
      type: String,
      enum: [OnOffOptions.ON, OnOffOptions.OFF],
      trim: true,
      default: OnOffOptions.OFF,
    },
    trans: {
      type: String,
      enum: [OnOffOptions.ON, OnOffOptions.OFF],
      trim: true,
      default: OnOffOptions.OFF,
    },
    smr_multi: {
      type: String,
      enum: [OnOffOptions.ON, OnOffOptions.OFF],
      trim: true,
      default: OnOffOptions.OFF,
    },
    maf: {
      type: String,
      trim: true,
      default: '0.05',
    },
    diff_freq: {
      type: String,
      trim: true,
      default: '0.2',
    },
    diff_freq_prop: {
      type: String,
      trim: true,
      default: '0.05',
    },
    cis_wind: {
      type: String,
      trim: true,
      default: '2000',
    },
    peqtl_smr: {
      type: String,
      trim: true,
      default: '5.0e-8',
    },
    ld_upper_limit: {
      type: String,
      trim: true,
      default: '0.9',
    },
    ld_lower_limit: {
      type: String,
      trim: true,
      default: '0.05',
    },
    peqtl_heidi: {
      type: String,
      trim: true,
      default: '1.57e-3',
    },
    heidi_mtd: {
      type: String,
      trim: true,
      default: '1',
    },
    heidi_min_m: {
      type: String,
      trim: true,
      default: '3',
    },
    heidi_max_m: {
      type: String,
      trim: true,
      default: '20',
    },
    trans_wind: {
      type: String,
      trim: true,
      default: '1000',
    },
    set_wind: {
      type: String,
      trim: true,
      default: '-9',
    },
    ld_multi_snp: {
      type: String,
      trim: true,
      default: '0.1',
    },
    Westra_eqtl: {
      type: String,
      enum: [TrueFalseOptions.TRUE, TrueFalseOptions.FALSE],
      trim: true,
      default: TrueFalseOptions.FALSE,
    },
    CAGE_eqtl: {
      type: String,
      enum: [TrueFalseOptions.TRUE, TrueFalseOptions.FALSE],
      trim: true,
      default: TrueFalseOptions.FALSE,
    },
    GTEx_v8_tissue: {
      type: String,
      enum: [...Object.values(TISSUEOptions)],
      trim: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EqtlJob',
      required: true,
    },
    version: {
      type: Number,
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        // delete ret._id;
        // delete ret.__v;
      },
    },
  },
);

//increments version when document updates
EqtlSchema.set('versionKey', 'version');

//collection level methods
EqtlSchema.statics.build = (attrs: EqtlAttrs) => {
  return new EqtlModel(attrs);
};

//create mongoose model
const EqtlModel = mongoose.model<EqtlDoc, EqtlModel>(
  'Eqtl',
  EqtlSchema,
  'eqtls',
);

export { EqtlModel };
