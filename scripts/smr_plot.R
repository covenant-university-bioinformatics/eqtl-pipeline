#!/usr/bin/env Rscript
#Rscript --vanilla ${bindir}/smr_plot.R ${bindir} smr_out ${outdir} smr
# ${smr_thresh} ${heidi_thresh} ${plotWindow} \
# ${max_anno_probe}
args = commandArgs(trailingOnly=TRUE)
bindir <- args[1]
smr_out <-  args[2]
output_dir <- args[3]
output_prefix <- args[4] # not used
smr_thresh <- as.numeric(args[5])  #8.4e-6
heidi_thresh <- as.numeric(args[6]) #0.05
plotWindow <- as.numeric(args[7])
max_anno_probe <- as.numeric(args[8])

plot_SMR_R=paste0(bindir,"/plot_SMR.r")
source(plot_SMR_R)
# Read the data file in R:
SMRData = ReadSMRData(paste0(output_dir,"/","plot/", smr_out))
# Plot the SMR results in a genomic region centred around a probe:
LocusPlot =paste0(output_dir,"/", "LocusPlot.png")
png(LocusPlot, width=1000, height=500)
SMRLocusPlot(data=SMRData, smr_thresh=smr_thresh, heidi_thresh=heidi_thresh, plotWindow=plotWindow, max_anno_probe=max_anno_probe)
#SMRLocusPlot(data=SMRData, smr_thresh=8.4e-6, heidi_thresh=0.05, plotWindow=1000, max_anno_probe=16)
# smr_thresh: genome-wide significance level for the SMR test.
# heidi_thresh: threshold for the HEIDI test. The default value is 0.05.
# cis_wind: size of a window centred around the probe to select cis-eQTLs for plot. The default value is 2000Kb.
# max_anno_probe: maximum number of probe names to be displayed on the figure. The default value is 16.
dev.off()
# Plot effect sizes from GWAS against those from eQTL study:
Effect_sizes =paste0(output_dir,"/", "Effect_sizes.png")
png(Effect_sizes)
SMREffectPlot(data=SMRData)
# trait_name: name of the trait or disease.
dev.off()
