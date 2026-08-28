# Current Authority Judicial Status Guard — V50

## Purpose
Prevent an officially hosted but judicially suspended/annulled secondary source from being treated as current authority.

## New pre-promotion gate
`OFFICIAL_SOURCE_FOUND -> EFFECTIVE_DATE_CHECK -> REPEAL/REPLACEMENT_CHECK -> JUDICIAL_STATUS_CHECK -> CURRENT_EFFECT_CONFIRMED -> EXACT_ARTICLE_SCOPE_MATCH -> ARTICLE_VERIFIED`

A source fails current-authority status when any of the following is established and no later restoring/replacing instrument is found:
- repeal,
- replacement,
- stay/suspension of execution,
- annulment,
- expiry/sunset.

## MEB RAM Directive case
Source: MEB Rehberlik ve Araştırma Merkezi Yönergesi dated 31.08.2020.
Judicial status found:
- judicial materials document suspension of execution of the Directive as a whole;
- Danıştay 8th Chamber E.2020/6422 K.2024/2231 dated 24.04.2024 annulled the Directive as a whole and RPD Regulation Article 14 on hierarchy-of-norms/authority grounds.

MEB archive/mevzuat listing presence is provenance only and does not override judicial status.

## System flags
- `SOURCE_PUBLISHED_OFFICIAL = true`
- `SOURCE_CURRENT_EFFECT = false/pending-final-status-check`
- `SOURCE_JUDICIAL_STATUS = ANNULLED_OR_STAYED`
- `ARTICLE_VERIFIED_ELIGIBLE = false`

## Affected prior V49 promotions
- HB-0395 -> rollback
- HB-0138 -> rollback

## Affected candidate mappings
Any RAM master row whose only exact parent was RAM Directive Md5 is withheld until matched to a current Regulation/Law/CBK provision.

## Source hierarchy rule
Current effectiveness outranks mere official hosting. The engine must never infer `current=true` solely because an official MEB page still links a PDF.

Migration: 0. Implement as catalog/validation logic and verification metadata.