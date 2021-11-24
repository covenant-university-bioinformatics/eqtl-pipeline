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

gwas_summary=$1;
outdir=$2;
population=$3;
eqtl_summary=$4
bindir='.'
output="eqtl"
#./smr.sh UKB_bv_height_SMR_0.05.txt  output eur westra_eqtl_hg19
${bindir}/smr_Linux  --bfile ${bindir}/g1000/g1000_${population}/g1000_${population}   \
--gwas-summary ${gwas_summary} \
--beqtl-summary ${bindir}/resources/${eqtl_summary} \
--out ${outdir}/${output}
