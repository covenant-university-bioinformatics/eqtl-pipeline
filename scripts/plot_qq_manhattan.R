#!/usr/bin/env Rscript

# To run it
###Rscript --vanilla plot_qq_manhattan.R SMR_out output-dir outfile_prefix \
# ${smr_thresh} ${heidi_thresh} ${plotWindow} \
# ${max_anno_probe}

##### Dependencies ---> qqman R package
###  Installation
#### 1- Install the stable release from CRAN:
     #### install.packages("qqman")
#### 2-  install directly from github using devtools
    ## library(devtools)
    ## install_github("stephenturner/qqman")

library(qqman)

args = commandArgs(trailingOnly=TRUE)
GWAS_summary <- args[1]
output_dir <- args[2]
output_prefix <- args[3]


GWAS_summary=read.table(GWAS_summary,header=T)
qq=paste0(output_dir,"/", output_prefix, "_","qq.png")
png(qq)# width=950, height=500)
qq(GWAS_summary$p_SMR, main = "Q-Q plot of SMR p-values")
dev.off()
manhattan =paste0(output_dir,"/", output_prefix, "_", "manhattan.png")
png(manhattan, width=1000, height=500)
manhattan(GWAS_summary, chr="topSNP_chr", bp="topSNP_bp", snp="topSNP", p="p_SMR", col = c("blue4", "orange3"), suggestiveline = F,
main="Manhattan plots of SMR tests for association between gene expression and complex traits")
dev.off()

##probes
#manhattan_probes =paste0(output_dir,"/", output_prefix, "_probes_", "manhattan.png")
#png(manhattan_probes, width=1000, height=500)
#manhattan(GWAS_summary, chr="ProbeChr", bp="Probe_bp", snp="probeID", p="p_SMR" )
#dev.off()
quit(save = "no", status = 0, runLast = FALSE)

