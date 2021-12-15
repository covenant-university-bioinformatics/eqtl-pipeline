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
bindir='.'
db_dir="$bindir";

gwas_summary=$1;
outdir=$2;
population=$3;
eqtl_summary=$4
heidi=$5       #{on, off}
trans=$6;      #{on,off} #SMR and HEIDI tests in trans regions
smr_multi=$7;  #{on,off}  #Multi-SNP-based SMR test


### Parameters
maf=$8; #The default value is 0.05
diff_freq=$9 # The default value is 0.2.
diff_freq_prop=${10}; # The default value is 0.05.
cis_wind=${11} #The default value is 2000Kb.
peqtl_smr=${12};  # The default value is 5.0e-8.
ld_upper_limit=${13}; #The default value is 0.9
ld_lower_limit=${14}; #The default value is 0.05.

### Heidi Parameters
peqtl_heidi=${15}; #The default value is 1.57e-3,
heidi_mtd=${16}; #{0,1} The default value is 1
heidi_min_m=${17};  #  The default value is 3
heidi_max_m=${18}; # The default value is 20.

### Parameters for  trans regions analysis
trans_wind=${19}

### Parameters for Multi-SNP-based SMR test
set_wind=${20}; # defines a window width (Kb).-9 resulting in selecting SNPs in the whole cis-region if this option is not specified.
ld_multi_snp=${21} # The default value is 0.1.

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
### Parameters for  trans regions analysis
if [[ -z "$trans_wind" ]];then
    trans_wind=1000;
fi
### Parameters for Multi-SNP-based SMR test
if [[ -z "$set_wind" ]];then
    set_wind=-9;
fi

if [[ -z "$ld_multi_snp" ]];then
    ld_multi_snp=0.1;
fi

### Set commands for : HEIDI, trans, and multi_snp
HEIDI_cmd='';
if [[ $heidi = "off" ]]; then
  HEIDI_cmd='--heidi-off';
else
  HEIDI_cmd="--heidi-mtd ${heidi_mtd} \
  --peqtl-heidi ${peqtl_heidi} \
  --heidi-min-m ${heidi_min_m} \
  --heidi-max-m ${heidi_max_m} "
fi


#SMR and HEIDI tests in trans regions
trans_cmd='';
if [[ ${trans} = "on" ]]; then
  trans_cmd="--trans \
  --trans-wind ${trans_wind} "
fi

#Multi-SNP-based SMR test
smr_multi_cmd='';
if [[ ${smr_multi} = "on" ]]; then
  smr_multi_cmd="--smr-multi \
  --ld-multi-snp ${ld_multi_snp} "
fi




#./smr.sh UKB_bv_height_SMR_0.05.txt  output eur westra_eqtl_hg19 on on on
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
  ${HEIDI_cmd} \
  --out ${outdir}/$2
}

smr_trans_cmd(){
  ${bindir}/smr_Linux  --bfile ${db}/g1000/g1000_${population}   \
  --gwas-summary ${gwas_summary} \
  --beqtl-summary ${db}/resources/$1 \
  --maf ${maf} \
  --cis-wind ${cis_wind} \
  --diff-freq ${diff_freq} \
  --diff-freq-prop ${diff_freq_prop} \
  --peqtl-smr ${peqtl_smr} \
  ${HEIDI_cmd} \
  ${trans_cmd} \
  --out ${outdir}/$2
}

smr_muti_cmd(){
  ${bindir}/smr_Linux  --bfile ${db}/g1000/g1000_${population}   \
  --gwas-summary ${gwas_summary} \
  --beqtl-summary ${db}/resources/$1 \
  --maf ${maf} \
  --cis-wind ${cis_wind} \
  --diff-freq ${diff_freq} \
  --diff-freq-prop ${diff_freq_prop} \
  --peqtl-smr ${peqtl_smr} \
  ${HEIDI_cmd} \
  ${smr_multi_cmd} \
  --out ${outdir}/$2
}

##### eqtl ananlysis
Westra_eqtl=${22} #{true, false}
if [[ "$Westra_eqtl" = "true" ]]; then
    smr_out="Westra";
    smr_cmd westra_eqtl_hg19 ${smr_out};
    if [[ ${trans} = "on" ]]; then
      smr_trans_cmd westra_eqtl_hg19 ${smr_out}_trans;
    fi

    if [[ ${smr_multi} = "on" ]]; then
        smr_muti_cmd westra_eqtl_hg19 ${smr_out}_multi;
    fi
fi

CAGE_eqtl=${23} #{true, false}
if [[ "$CAGE_eqtl" = "true" ]]; then
    smr_out="CAGE";
    smr_cmd CAGE.sparse ${smr_out};
    if [[ ${trans} = "on" ]]; then
      smr_trans_cmd CAGE.sparse ${smr_out}_trans;
    fi

    if [[ ${smr_multi} = "on" ]]; then
        smr_muti_cmd CAGE.sparse ${smr_out}_multi;
    fi
fi

GTEx_v8_array=()
Adipose_Subcutaneous_GTEx_v8=${24} #{true, false}
if [[ ${Adipose_Subcutaneous_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Adipose_Subcutaneous")
fi
Adipose_Visceral_Omentum_GTEx_v8=${25} #{true, false}
if [[ ${Adipose_Visceral_Omentum_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Adipose_Visceral_Omentum")
fi
Adrenal_Gland_GTEx_v8=${26} #{true, false}
if [[ ${Adrenal_Gland_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Adrenal_Gland")
fi
Artery_Aorta_GTEx_v8=${27} #{true, false}
if [[ ${Artery_Aorta_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Artery_Aorta")
fi
Artery_Coronary_GTEx_v8=${28} #{true, false}
if [[ ${Artery_Coronary_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Artery_Coronary")
fi
Artery_Tibial_GTEx_v8=${29} #{true, false}
if [[ ${Artery_Tibial_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Artery_Tibial")
fi
Brain_Amygdala_GTEx_v8=${30} #{true, false}
if [[ ${Brain_Amygdala_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Amygdala")
fi
Brain_Anterior_cingulate_cortex_BA24_GTEx_v8=${31} #{true, false}
if [[ ${Brain_Anterior_cingulate_cortex_BA24_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Anterior_cingulate_cortex_BA24")
fi
Brain_Caudate_basal_ganglia_GTEx_v8=${32} #{true, false}
if [[ ${Brain_Caudate_basal_ganglia_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Caudate_basal_ganglia")
fi
Brain_Cerebellar_Hemisphere_GTEx_v8=${33} #{true, false}
if [[ ${Brain_Cerebellar_Hemisphere_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Cerebellar_Hemisphere")
fi
Brain_Cerebellum_GTEx_v8=${34} #{true, false}
if [[ ${Brain_Cerebellum_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Cerebellum")
fi
Brain_Cortex_GTEx_v8=${35} #{true, false}
if [[ ${Brain_Cortex_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Cortex")
fi
Brain_Frontal_Cortex_BA9_GTEx_v8=${36} #{true, false}
if [[ ${Brain_Frontal_Cortex_BA9_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Frontal_Cortex_BA9")
fi
Brain_Hippocampus_GTEx_v8=${37} #{true, false}
if [[ ${Brain_Hippocampus_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Hippocampus")
fi
Brain_Hypothalamus_GTEx_v8=${38} #{true, false}
if [[ ${Brain_Hypothalamus_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Hypothalamus")
fi
Brain_Nucleus_accumbens_basal_ganglia_GTEx_v8=${39} #{true, false}
if [[ ${Brain_Nucleus_accumbens_basal_ganglia_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Nucleus_accumbens_basal_ganglia")
fi
Brain_Putamen_basal_ganglia_GTEx_v8=${40} #{true, false}
if [[ ${Brain_Putamen_basal_ganglia_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Putamen_basal_ganglia")
fi
Brain_Spinal_cord_cervical_c_1_GTEx_v8=${41} #{true, false} ----> chnage hyphon to underscore
if [[ ${Brain_Spinal_cord_cervical_c_1_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Spinal_cord_cervical_c_1")
fi
Brain_Substantia_nigra_GTEx_v8=${42} #{true, false}
if [[ ${Brain_Substantia_nigra_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Brain_Substantia_nigra")
fi
Breast_Mammary_Tissue_GTEx_v8=${43} #{true, false}
if [[ ${Breast_Mammary_Tissue_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Breast_Mammary_Tissue")
fi
Cells_Cultured_fibroblasts_GTEx_v8=${44} #{true, false}
if [[ ${Cells_Cultured_fibroblasts_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Cells_Cultured_fibroblasts")
fi
Cells_EBV_transformed_lymphocytes_GTEx_v8=${45} #{true, false} --->
if [[ ${Cells_EBV_transformed_lymphocytes_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Cells_EBV_transformed_lymphocytes")
fi
Colon_Sigmoid_GTEx_v8=${46} #{true, false}
if [[ ${Colon_Sigmoid_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Colon_Sigmoid")
fi
Colon_Transverse_GTEx_v8=${47} #{true, false}
if [[ ${Colon_Transverse_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Colon_Transverse")
fi
Esophagus_Gastroesophageal_Junction_GTEx_v8=${48} #{true, false}
if [[ ${Esophagus_Gastroesophageal_Junction_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Esophagus_Gastroesophageal_Junction")
fi
Esophagus_Mucosa_GTEx_v8=${49} #{true, false}
if [[ ${Esophagus_Mucosa_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Esophagus_Mucosa")
fi
Esophagus_Muscularis_GTEx_v8=${50} #{true, false}
if [[ ${Esophagus_Muscularis_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Esophagus_Muscularis")
fi
Heart_Atrial_Appendage_GTEx_v8=${51} #{true, false}
if [[ ${Heart_Atrial_Appendage_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Heart_Atrial_Appendage")
fi
Heart_Left_Ventricle_GTEx_v8=${52} #{true, false}
if [[ ${Heart_Left_Ventricle_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Heart_Left_Ventricle")
fi
Kidney_Cortex_GTEx_v8=${53} #{true, false}
if [[ ${Kidney_Cortex_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Kidney_Cortex")
fi
Liver_GTEx_v8=${54} #{true, false}
if [[ ${Liver_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Liver")
fi
Lung_GTEx_v8=${55} #{true, false}
if [[ ${Lung_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Lung")
fi
Minor_Salivary_Gland_GTEx_v8=${56} #{true, false}
if [[ ${Minor_Salivary_Gland_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Minor_Salivary_Gland")
fi
Muscle_Skeletal_GTEx_v8=${57} #{true, false}
if [[ ${Muscle_Skeletal_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Muscle_Skeletal")
fi
Nerve_Tibial_GTEx_v8=${58} #{true, false}
if [[ ${Nerve_Tibial_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Nerve_Tibial")
fi
Ovary_GTEx_v8=${59} #{true, false}
if [[ ${Ovary_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Ovary")
fi
Pancreas_GTEx_v8=${60} #{true, false}
if [[ ${Pancreas_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Pancreas")
fi
Pituitary_GTEx_v8=${61} #{true, false}
if [[ ${Pituitary_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Pituitary")
fi
Prostate_GTEx_v8=${62} #{true, false}
if [[ ${Prostate_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Prostate")
fi
Skin_Not_Sun_Exposed_Suprapubic_GTEx_v8=${63} #{true, false}
if [[ ${Skin_Not_Sun_Exposed_Suprapubic_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Skin_Not_Sun_Exposed_Suprapubic")
fi
Skin_Sun_Exposed_Lower_leg_GTEx_v8=${64} #{true, false}
if [[ ${Skin_Sun_Exposed_Lower_leg_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Skin_Sun_Exposed_Lower_leg")
fi
Small_Intestine_Terminal_Ileum_GTEx_v8=${65} #{true, false}
if [[ ${Small_Intestine_Terminal_Ileum_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Small_Intestine_Terminal_Ileum")
fi
Spleen_GTEx_v8=${66} #{true, false}
if [[ ${Spleen_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Spleen")
fi
Stomach_GTEx_v8=${67} #{true, false}
if [[ ${Stomach_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Stomach")
fi
Testis_GTEx_v8=${68} #{true, false}
if [[ ${Testis_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Testis")
fi
Thyroid_GTEx_v8=${69} #{true, false}
if [[ ${Thyroid_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Thyroid")
fi
Uterus_GTEx_v8=${70} #{true, false}
if [[ ${Uterus_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Uterus")
fi
Vagina_GTEx_v8=${71} #{true, false}
if [[ ${Vagina_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Vagina")
fi
Whole_Blood_GTEx_v8=${72} #{true, false}
if [[ ${Whole_Blood_GTEx_v8} = "true" ]]; then
    GTEx_v8_array+=("Whole_Blood")
fi

##SMR GTEx 8
for tissue in "${GTEx_v8_array[@]}"
do
	smr_out=${tissue};
  smr_cmd GTEx8/${tissue} ${smr_out};
  if [[ ${trans} = "on" ]]; then
    smr_trans_cmd GTEx8/${tissue} ${smr_out}_trans;
  fi

  if [[ ${smr_multi} = "on" ]]; then
      smr_muti_cmd GTEx8/${tissue} ${smr_out}_multi;
  fi

done