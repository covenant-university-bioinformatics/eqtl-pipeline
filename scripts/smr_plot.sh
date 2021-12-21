#!/usr/bin/env bash
## https://cnsgenomics.com/software/smr/#SMR

### How to run in  the smr tool
  ## smr --bfile mydata --gwas-summary mygwas.ma --beqtl-summary myeqtl --out mysmr --thread-num 10
### How to run this script

### Files to download
# 1- SMR excutable tool https://cnsgenomics.com/software/smr/#Download
# 2- R script for SMR locus plot  https://cnsgenomics.com/software/smr/#Download
# 3- eQTL summary data
# 4- mQTL summary data
# 5- caQTL summary data


#### Input gwas_summary format
#SNP    A1  A2  freq    b   se  p   n
bindir='/mnt/d/eqtl'
db="$bindir";

gwas_summary=$1;
outdir=$2;
population=$3;
#eqtl_summary=$4
probe=$4;
probe_wind=$5; #default 500
gene_list=$6; #{glist-hg19, glist-hg38} -->default glist-hg19


### Parameters
maf=$6; #The default value is 0.05
diff_freq=$8 # The default value is 0.2.
diff_freq_prop=$9 ; # The default value is 0.05.
cis_wind=${10} #The default value is 2000Kb.
peqtl_smr=${11};  # The default value is 5.0e-8.
ld_upper_limit=${12}; #The default value is 0.9
ld_lower_limit=${13}; #The default value is 0.05.

### Heidi Parameters
peqtl_heidi=${14}; #The default value is 1.57e-3,
heidi_mtd=${15}; #{0,1} The default value is 1
heidi_min_m=${16};  #  The default value is 3
heidi_max_m=${17}; # The default value is 20.

### plot Parameters
smr_thresh=${18} # default 8.4e-6,
heidi_thresh=${19} # default 0.05,
plotWindow=${20}  # default 1000,
max_anno_probe=${21} ## default 16
### Set default values
if [[ -z "$maf" ]];then
    maf=0.05;
fi

if [[ -z "$diff_freq" ]];then
    diff_freq=0.2;
fi

if [[ -z "$diff_freq_prop" ]];then
    diff_freq_prop=0.05;
fi

if [[ -z "$cis_wind" ]];then
    cis_wind=2000;
fi

if [[ -z "$peqtl_smr" ]];then
    peqtl_smr=5.0e-8;
fi

if [[ -z "$ld_upper_limit" ]];then
    ld_upper_limit=0.9;
fi

if [[ -z "$ld_lower_limit" ]];then
    ld_lower_limit=0.05;
fi
## HEIDI

if [[ -z "$peqtl_heidi" ]];then
    peqtl_heidi=1.57e-3;
fi

if [[ -z "$heidi_mtd" ]];then
    heidi_mtd=1;
fi

if [[ -z "$heidi_min_m" ]];then
    heidi_min_m=3;
fi

if [[ -z "$heidi_max_m" ]];then
    heidi_max_m=20;
fi

### Set plot Parameters
if [[ -z "$probe_wind" ]];then
    probe_wind=500;
fi

if [[ -z "$gene_list" ]];then
    gene_list='glist-hg19';
fi

if [[ -z "$smr_thresh" ]];then
    smr_thresh=8.4e-6;
fi

if [[ -z "$heidi_thresh" ]];then
    heidi_thresh=0.05;
fi

if [[ -z "$plotWindow" ]];then
    plotWindow=1000;
fi

if [[ -z "$max_anno_probe" ]];then
    max_anno_probe=16;
fi

### Set commands for : HEIDI, trans, and multi_snp

  HEIDI_cmd="--heidi-mtd ${heidi_mtd} \
  --peqtl-heidi ${peqtl_heidi} \
  --heidi-min-m ${heidi_min_m} \
  --heidi-max-m ${heidi_max_m} "






#./smr.sh UKB_bv_height_SMR_0.05.txt  output eur  ILMN_2349633 500 glist-hg19
#${bindir}/smr_Linux  --bfile ${bindir}/g1000/g1000_${population}   \
#--gwas-summary ${gwas_summary} \
#--beqtl-summary ${bindir}/resources/${eqtl_summary} \
#--out ${outdir}/${output}
smr_cmd(){
  ${bindir}/smr_Linux  --bfile ${db}/g1000/g1000_${population}   \
  --gwas-summary ${gwas_summary} \
  --beqtl-summary ${db}/resources/$1 \
  --maf ${maf} \
  --cis-wind ${cis_wind} \
  --diff-freq ${diff_freq} \
  --diff-freq-prop ${diff_freq_prop} \
  --peqtl-smr ${peqtl_smr} \
  --plot --probe ${probe} \
  --probe-wind ${probe_wind} \
  --gene-list ${db}/${gene_list} \
  ${HEIDI_cmd} \
  --out ${outdir}/$2

  Rscript --vanilla ${bindir}/smr_plot.R ${bindir} $2.${probe}.txt ${outdir} $2 \
   ${smr_thresh} ${heidi_thresh} ${plotWindow} \
   ${max_anno_probe}
}

##### eqtl ananlysis
Westra_eqtl=${22} #{true, false}
Westra_eqtl="true";
if [[ "$Westra_eqtl" = "true" ]]; then
    smr_out="Westra";
    smr_cmd westra_eqtl_hg19 ${smr_out};
fi

CAGE_eqtl=${23} #{true, false}
CAGE_eqtl="true";
if [[ "$CAGE_eqtl" = "true" ]]; then
    smr_out="CAGE";
    smr_cmd CAGE.sparse ${smr_out};
fi

GTEx_v8_tissue=${24};
# Adipose_Subcutaneous
# Adipose_Visceral_Omentum
# Adrenal_Gland
# Artery_Aorta
# Artery_Coronary
# Artery_Tibial
# Brain_Amygdala
# Brain_Anterior_cingulate_cortex_BA24
# Brain_Caudate_basal_ganglia
# Brain_Cerebellar_Hemisphere
# Brain_Cerebellum
# Brain_Cortex
# Brain_Frontal_Cortex_BA9
# Brain_Hippocampus
# Brain_Hypothalamus
# Brain_Nucleus_accumbens_basal_ganglia
# Brain_Putamen_basal_ganglia
# Brain_Spinal_cord_cervical_c_1  ----> chnage hyphon to underscore
# Brain_Substantia_nigra
# Breast_Mammary_Tissue
# Cells_Cultured_fibroblasts
# Cells_EBV_transformed_lymphocytes  ---> chnage hyphon to underscore
# Colon_Sigmoid
# Colon_Transverse
# Esophagus_Gastroesophageal_Junction
# Esophagus_Mucosa
# Esophagus_Muscularis
# Heart_Atrial_Appendage
# Heart_Left_Ventricle
# Kidney_Cortex
# Liver
# Lung
# Minor_Salivary_Gland
# Muscle_Skeletal
# Nerve_Tibial
# Ovary
# Pancreas
# Pituitary
# Prostate
# Skin_Not_Sun_Exposed_Suprapubic
# Skin_Sun_Exposed_Lower_leg
# Small_Intestine_Terminal_Ileum
# Spleen
# Stomach
# Testis
# Thyroid
# Uterus
# Vagina
# Whole_Blood

GTEx_v8_tissue="Lung";
##SMR GTEx 8
if [[ "$GTEx_v8_tissue" != "" ]]; then
	smr_out=${GTEx_v8_tissue};
  smr_cmd GTEx8/${GTEx_v8_tissue}/${GTEx_v8_tissue} ${smr_out};
fi
