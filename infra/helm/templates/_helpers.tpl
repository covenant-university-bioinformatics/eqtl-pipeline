{{/* Generate basic labels */}}
{{- define "chart.label" }}
  labels:
    app.kubernetes.io/name: {{ include "microservice.name" . }}
    helm.sh/chart: {{ include "microservice.chart" . }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}


{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}

{{- define "microservice.name" -}}
{{$name := printf "%s-%s" .Release.Name "depl" }}
{{- default .Chart.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "microservice.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "microservice.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}


{{- define "cfgannots" }}
  annotations:
   "helm.sh/hook": pre-install
   "helm.sh/hook-weight": "-1"
{{- end -}}
{{/*    "helm.sh/hook-delete-policy": hook-succeeded*/}}

{{- define "pvcannots" }}
  annotations:
   helm.sh/hook: pre-install
   helm.sh/hook-weight: "-1"
   helm.sh/resource-policy: keep
{{- end -}}

{{- define "env-vars" }}
env:
  - name: var1
    value: value1
{{- end -}}

{{/*{{- define "namespace" -}}*/}}
{{/*{{- if eq .Values.type "microservice"  -}}*/}}
{{/*{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}*/}}
{{/*{{- else -}}*/}}
{{/*{{- $name := default .Chart.Name .Values.nameOverride -}}*/}}
{{/*{{- if contains $name .Release.Name -}}*/}}
{{/*{{- .Release.Name | trunc 63 | trimSuffix "-" -}}*/}}
{{/*{{- else -}}*/}}
{{/*{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}*/}}
{{/*{{- end -}}*/}}
{{/*{{- end -}}*/}}
{{/*{{- end -}}*/}}