# Quick Reference Guide

## 📖 Important: Read This First

**[01-PRODUCT_VISION.md](01-PRODUCT_VISION.md)** - Understand the product vision and strategy
- Brain Station 23 is building DFMS as a **product**
- Nourish is our **launch client** (not the only client)
- Architecture designed for **flexibility and multi-tenancy**

---

## 📁 Repository Organization

### Current Structure
✅ **source-documents/** - All original BA team documents, organized and renamed

### Coming Soon
🔜 **knowledge-base/** - Structured markdown documentation (LLM & engineer friendly)

## 🎯 Find Information Fast

### By Stakeholder Department

| Department | Document Location |
|-----------|-------------------|
| **Transport** | `source-documents/meeting-minutes/2025-09/Transport_Operations_2025-09-29.docx` |
| **Procurement** | `source-documents/meeting-minutes/2025-10/Procurement_Operations_2025-10-06.docx` |
| **Distribution & Sales** | `source-documents/meeting-minutes/2025-10/Distribution_Sales_2025-10-06.docx` |
| **Quality (QA/QC)** | `source-documents/meeting-minutes/2025-10/QA_QC_Operations_2025-10-06.docx` |
| **Accounts & Finance** | `source-documents/meeting-minutes/2025-10/Accounts_Finance_2025-10-08.docx` |
| **Commercial** | `source-documents/meeting-minutes/2025-10/Commercial_Operations_2025-10-08.docx` |
| **MIS** | `source-documents/meeting-minutes/2025-10/MIS_Operations_2025-10-08.docx` |

### By Document Type

| What You Need | Where to Find It |
|--------------|------------------|
| **Discovery phase materials** | `source-documents/discovery-phase/` (questionnaires, workflows, samples) |
| **Business proposals** | `source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx` |
| **Core requirements** | `source-documents/requirements/PRD_DFMS_v1.0.docx` |
| **Latest features** | `source-documents/planning/feature-lists/DFMS_Feature_List_v1.2.xlsx` |
| **Phase 1 work plan** | `source-documents/planning/work-breakdown/WBS_Phase_1_v1.0.xlsx` |
| **Phase 2 work plan** | `source-documents/planning/work-breakdown/WBS_Phase_2_v1.0.xlsx` |
| **Phase 3 work plan** | `source-documents/planning/work-breakdown/WBS_Phase_3_v1.0.xlsx` |
| **Logistics & Fleet** | `source-documents/planning/work-breakdown/WBS_Logistics_Fleet_v1.3.xlsx` |
| **Process flows** | `source-documents/discovery-phase/flow-diagrams/` |
| **BA team review** | `source-documents/reviews/DFMS_V2_Reviewed_BA_Team.docx` |
| **Contract discussion** | `source-documents/meeting-minutes/2025-07/TMS_Contract_Discussion_2025-07-30.docx` |

### By Timeline

| Period | Events |
|--------|--------|
| **July 2025** | TMS contract discussions |
| **Sept 2025** | Transport operations requirements gathering |
| **Oct 2025** | Multi-department stakeholder meetings (7 departments) |
| **Nov 2025** | General DFMS planning sessions |
| **Dec 2025** | Continued planning and feature refinement |

## 🔍 Search Commands

```bash
# Search for specific term across all documents
grep -r "procurement" source-documents/

# Find all Excel files
find source-documents/ -name "*.xlsx"

# Find all Word documents
find source-documents/ -name "*.docx"

# List all meeting minutes
ls -lh source-documents/meeting-minutes/*/

# Find latest version of feature list
ls -lt source-documents/planning/feature-lists/
```

## 📊 Version Tracking

| Document | Current Version | Notes |
|----------|----------------|-------|
| Business Proposal (BS23) | v1.3.1 | **Latest** - without commercial aspects |
| Business Proposal (BS23) | v1.2.1 | Internal version |
| PRD | v1.0 | Initial product requirements |
| Feature List | v1.2 | **Latest** - use this version |
| WBS Phase 1-3 | v1.0 | Initial work breakdown |
| WBS Logistics | v1.3 | **Latest** - most current logistics plan |

## 🚀 Getting Started

### New Engineer Onboarding
1. Read `README.md` for repository overview
2. Review business proposal: `source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx`
3. Review `source-documents/requirements/PRD_DFMS_v1.0.docx`
4. Check latest features: `source-documents/planning/feature-lists/DFMS_Feature_List_v1.2.xlsx`
5. Explore process flows: `source-documents/design/Flow_Diagrams.drawio`
6. Understand stakeholder needs: Review relevant meeting minutes

### Business Stakeholder Review
1. Start with `source-documents/README.md`
2. Review business proposals in `source-documents/business-proposal/`
3. Review your department's meeting minutes
4. Check feature list for your requirements
5. Review work breakdown for timeline

### Project Manager View
1. Business proposals: `source-documents/business-proposal/`
2. Latest features: `source-documents/planning/feature-lists/DFMS_Feature_List_v1.2.xlsx`
3. Phase breakdown: `source-documents/planning/work-breakdown/`
4. Stakeholder engagement: `source-documents/meeting-minutes/`
5. Review status: `source-documents/reviews/`

## 🎨 File Naming Convention

All files follow this pattern:

```
Category_Description_Version_or_Date.extension
```

**Examples:**
- `PRD_DFMS_v1.0.docx`
- `Transport_Operations_2025-09-29.docx`
- `WBS_Phase_1_v1.0.xlsx`

**Rules:**
- Use underscores (not spaces)
- Dates: `YYYY-MM-DD` format
- Versions: `v1.0`, `v1.1`, `v1.2`
- Descriptive but concise names

## 🔐 Important Notes

⚠️ **Do NOT modify files in `source-documents/`**  
These are original artifacts from the BA team - preserve as-is

✅ **Use `knowledge-base/` for working documentation** (coming soon)  
Derived from source documents, structured for development

## 📞 Need Help?

- **Can't find a document?** Check `source-documents/README.md`
- **Need business context?** Review meeting minutes from relevant department
- **Looking for technical specs?** Wait for `knowledge-base/` (coming soon)
- **Version confusion?** See version tracking table above

---

**Pro Tip**: Use `grep` to search across all documents for specific terms, features, or requirements!

