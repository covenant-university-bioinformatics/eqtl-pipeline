import * as mongoose from 'mongoose';

export enum Populations {
  AFR = 'afr',
  AMR = 'amr',
  EUR = 'eur',
  EAS = 'eas',
  SAS = 'sas',
}

export enum GeneListOptions {
  HG19 = 'glist-hg19',
  HG38 = 'glist-hg38',
}

export enum EqtlOptions {
  WESTRA = 'Westra_eqtl',
  CAGE = 'CAGE_eqtl',
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

//Interface that describe the properties that are required to create a new job
interface EqtlPlotAttrs {
  job: string;
  population: Populations;
  eqtl_summary: EqtlOptions;
  probe: string;
  probe_wind: string;
  gene_list: GeneListOptions;
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
  smr_thresh: string;
  heidi_thresh: string;
  plotWindow: string;
  max_anno_probe: string;
}

// An interface that describes the extra properties that a eqtl model has
//collection level methods
interface EqtlModel extends mongoose.Model<EqtlPlotDoc> {
  build(attrs: EqtlPlotAttrs): EqtlPlotDoc;
}

//An interface that describes a properties that a document has
export interface EqtlPlotDoc extends mongoose.Document {
  id: string;
  version: number;
  population: Populations;
  eqtl_summary: EqtlOptions;
  probe: string;
  probe_wind: string;
  gene_list: GeneListOptions;
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
  smr_thresh: string;
  heidi_thresh: string;
  plotWindow: string;
  max_anno_probe: string;
}

const EqtlPlotSchema = new mongoose.Schema<EqtlPlotDoc, EqtlModel>(
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
    eqtl_summary: {
      type: String,
      enum: [...Object.values(EqtlOptions)],
      trim: true,
      default: EqtlOptions.WESTRA,
    },
    probe: {
      type: String,
      trim: true,
    },
    probe_wind: {
      type: String,
      trim: true,
      default: '500',
    },

    gene_list: {
      type: String,
      enum: [GeneListOptions.HG19, GeneListOptions.HG38],
      trim: true,
      default: GeneListOptions.HG19,
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
    smr_thresh: {
      type: String,
      trim: true,
      default: '8.4e-6',
    },
    heidi_thresh: {
      type: String,
      trim: true,
      default: '0.05',
    },
    plotWindow: {
      type: String,
      trim: true,
      default: '1000',
    },
    max_anno_probe: {
      type: String,
      trim: true,
      default: '16',
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EqtlPlotJob',
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
EqtlPlotSchema.set('versionKey', 'version');

//collection level methods
EqtlPlotSchema.statics.build = (attrs: EqtlPlotAttrs) => {
  return new EqtlPlotModel(attrs);
};

//create mongoose model
const EqtlPlotModel = mongoose.model<EqtlPlotDoc, EqtlModel>(
  'EqtlPlot',
  EqtlPlotSchema,
  'eqtlplots',
);

export { EqtlPlotModel };
