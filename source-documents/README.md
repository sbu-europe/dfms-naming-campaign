# Source Documents

> Original documentation from Business Analyst team - preserved as received

## 📖 Context

These documents represent requirements gathered from **Nourish**, our launch client. While building for Nourish, we're designing DFMS as a **flexible product** that can serve multiple clients in the distribution and fleet management space.

> See [01-PRODUCT_VISION.md](../01-PRODUCT_VISION.md) for our product strategy

## ⚠️ Important

**Do not modify or delete files in this directory.** These documents represent the original artifacts from the Business Analyst team and serve as the authoritative source for all derived documentation.

## 📂 Directory Structure

### `requirements/`
Product Requirements Documents (PRD) and core specifications.

- `PRD_DFMS_v1.0.docx` - Primary product requirements document

### `discovery-phase/`
Documentation and artifacts collected during the discovery phase with Nourish (Sept-Dec 2025).

- `client-feedback/` - Reviewed questionnaires and feedback
- `questionnaires/` - Discovery session questionnaires (English & Bengali)
- `client-resources/` - Reference documents, samples, and master data from Nourish
- `flow-diagrams/` - Visual workflow diagrams (v1.1 through v1.6)
- `feature-lists/` - Evolution of feature lists during discovery

> 📖 See [discovery-phase/README.md](discovery-phase/README.md) for detailed information about discovery phase materials

### `business-proposal/`
Business proposals from BS23 for the Logistics and Fleet Management System.

- `BS23_Proposal_Nourish_LFMS_v1.2.1_Internal.docx` - Internal proposal version 1.2.1
- `BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx` - Version 1.3.1 without commercial aspects (Latest)

> 📖 See [business-proposal/README.md](business-proposal/README.md) for deployment phases and instructions on reading binary DOCX files

### `planning/`
Project planning artifacts including features and work breakdown.

#### `planning/feature-lists/`
Feature specifications across different versions:
- `DFMS_Feature_List_v1.0.xlsx` - Initial feature list
- `DFMS_Feature_List_v1.1.xlsx` - Updated feature list
- `DFMS_Feature_List_v1.2.xlsx` - Current feature list

#### `planning/work-breakdown/`
Work Breakdown Structure (WBS) by project phase:
- `WBS_Phase_1_v1.0.xlsx` - Phase 1 work breakdown
- `WBS_Phase_2_v1.0.xlsx` - Phase 2 work breakdown
- `WBS_Phase_3_v1.0.xlsx` - Phase 3 work breakdown
- `WBS_Logistics_Fleet_v1.3.xlsx` - Logistics & Fleet Management breakdown

### `meeting-minutes/`
Chronological record of stakeholder meetings organized by date.

#### `2025-07/`
- `TMS_Contract_Discussion_2025-07-30.docx` - Transport Management System contract discussion

#### `2025-09/`
- `Transport_Operations_2025-09-29.docx` - Transport operations stakeholder meeting

#### `2025-10/`
- `Accounts_Finance_2025-10-08.docx` - Accounts & Finance operations meeting
- `Commercial_Operations_2025-10-08.docx` - Commercial operations meeting
- `Distribution_Sales_2025-10-06.docx` - Distribution & Sales operations meeting
- `MIS_Operations_2025-10-08.docx` - MIS operations meeting
- `Procurement_Operations_2025-10-06.docx` - Procurement operations meeting
- `QA_QC_Operations_2025-10-06.docx` - Quality Assurance & Quality Control meeting

#### `2025-11/`
- `General_Meeting_2025-11-25.docx` - General DFMS discussion

#### `2025-12/`
- `General_Meeting_2025-12-01.docx` - General DFMS discussion
- `General_Meeting_2025-12-17.docx` - General DFMS discussion

### `reviews/`
Review documents and feedback from stakeholders.

- `DFMS_V2_Reviewed_BA_Team.docx` - Version 2 review by Business Analyst team

## 📋 File Naming Convention

All files follow a consistent naming pattern:

```
Category_Description_Date/Version.extension

Examples:
- PRD_DFMS_v1.0.docx
- Transport_Operations_2025-09-29.docx
- WBS_Phase_1_v1.0.xlsx
```

**Conventions:**
- **Categories**: PRD, WBS, Feature_List, Department_Name, etc.
- **Dates**: YYYY-MM-DD format
- **Versions**: v1.0, v1.1, v1.2, etc.
- **Separators**: Underscores instead of spaces

## 📅 Timeline

Key documentation milestones:

- **July 2025**: TMS contract discussions initiated
- **September 2025**: Transport operations requirements gathered
- **October 2025**: Multi-department stakeholder meetings (6 departments)
- **November 2025**: General planning and feature discussions
- **December 2025**: Continued planning and refinement

## 🔍 Finding Information

### By Department/Function
- **Transport**: `meeting-minutes/2025-09/Transport_Operations_2025-09-29.docx`
- **Procurement**: `meeting-minutes/2025-10/Procurement_Operations_2025-10-06.docx`
- **Distribution**: `meeting-minutes/2025-10/Distribution_Sales_2025-10-06.docx`
- **Quality**: `meeting-minutes/2025-10/QA_QC_Operations_2025-10-06.docx`
- **Finance**: `meeting-minutes/2025-10/Accounts_Finance_2025-10-08.docx`
- **Commercial**: `meeting-minutes/2025-10/Commercial_Operations_2025-10-08.docx`
- **MIS**: `meeting-minutes/2025-10/MIS_Operations_2025-10-08.docx`

### By Document Type
- **Business Proposals**: `business-proposal/` (BS23 proposals, versions 1.2.1 & 1.3.1)
- **Requirements**: `requirements/PRD_DFMS_v1.0.docx`
- **Features**: `planning/feature-lists/` (check latest version)
- **Project Plan**: `planning/work-breakdown/` (by phase)
- **Processes**: `design/Flow_Diagrams.drawio`
- **Stakeholder Input**: `meeting-minutes/` (by date)
- **Reviews**: `reviews/DFMS_V2_Reviewed_BA_Team.docx`

## 📊 Document Status

| Document Type | Latest Version | Last Updated |
|--------------|----------------|--------------|
| Business Proposal | v1.3.1 | Latest |
| PRD | v1.0 | Initial |
| Feature List | v1.2 | Latest |
| WBS Phase 1 | v1.0 | Initial |
| WBS Phase 2 | v1.0 | Initial |
| WBS Phase 3 | v1.0 | Initial |
| WBS Logistics | v1.3 | Latest |
| Flow Diagrams | - | Current |

## 🎯 Next Steps

These source documents will be transformed into a structured `knowledge-base/` with:
- Markdown format for version control
- Mermaid diagrams for flows
- Cross-referenced documentation
- LLM-optimized structure
- Engineer-friendly organization

The source documents remain unchanged as the authoritative reference.

---

## 🤖 For LLMs: How to Read Binary Files (DOCX, XLSX)

Most files in this directory are binary formats (Microsoft Word, Excel) and cannot be read directly as text. Here's how to extract content:

### Reading DOCX Files (Word Documents)

DOCX files are ZIP archives containing XML. Extract text content using:

```bash
# Basic extraction - get all text
unzip -p "filename.docx" word/document.xml 2>/dev/null | \
  grep -o '<w:t[^>]*>[^<]*</w:t>' | \
  sed 's/<[^>]*>//g'

# Search for specific section
unzip -p "filename.docx" word/document.xml 2>/dev/null | \
  grep -o '<w:t[^>]*>[^<]*</w:t>' | \
  sed 's/<[^>]*>//g' | \
  grep -A 50 "Section Name"

# Extract first 200 lines
unzip -p "filename.docx" word/document.xml 2>/dev/null | \
  grep -o '<w:t[^>]*>[^<]*</w:t>' | \
  sed 's/<[^>]*>//g' | \
  head -200
```

**Explanation**:
- `unzip -p` extracts file to stdout without creating files
- `word/document.xml` contains the main text content
- `grep -o '<w:t[^>]*>[^<]*</w:t>'` extracts text elements
- `sed 's/<[^>]*>//g'` removes XML tags
- `2>/dev/null` suppresses error messages

### Reading XLSX Files (Excel Spreadsheets)

XLSX files are also ZIP archives with XML:

```bash
# List all sheets in workbook
unzip -l "filename.xlsx" | grep xl/worksheets

# Extract data from first sheet
unzip -p "filename.xlsx" xl/worksheets/sheet1.xml 2>/dev/null | \
  grep -o '<t[^>]*>[^<]*</t>' | \
  sed 's/<[^>]*>//g'

# Extract shared strings (often contains cell values)
unzip -p "filename.xlsx" xl/sharedStrings.xml 2>/dev/null | \
  grep -o '<t[^>]*>[^<]*</t>' | \
  sed 's/<[^>]*>//g'
```

### Alternative Methods

#### Using textutil (macOS built-in, DOCX only)
```bash
textutil -convert txt "filename.docx" -output output.txt
cat output.txt
```

#### Using pandoc (if installed)
```bash
pandoc "filename.docx" -o output.md
cat output.md
```

#### Using Python (if available)
```python
# For DOCX
from docx import Document
doc = Document('filename.docx')
for para in doc.paragraphs:
    print(para.text)

# For XLSX
import openpyxl
wb = openpyxl.load_workbook('filename.xlsx')
sheet = wb.active
for row in sheet.iter_rows(values_only=True):
    print(row)
```

### Common Use Cases

```bash
# 1. Get complete document content
unzip -p "PRD_DFMS_v1.0.docx" word/document.xml 2>/dev/null | \
  grep -o '<w:t[^>]*>[^<]*</w:t>' | \
  sed 's/<[^>]*>//g' > full_content.txt

# 2. Search across multiple documents
for file in *.docx; do
  echo "=== $file ==="
  unzip -p "$file" word/document.xml 2>/dev/null | \
    grep -o '<w:t[^>]*>[^<]*</w:t>' | \
    sed 's/<[^>]*>//g' | \
    grep -i "search_term"
done

# 3. Extract table of contents
unzip -p "filename.docx" word/document.xml 2>/dev/null | \
  grep -o '<w:t[^>]*>[^<]*</w:t>' | \
  sed 's/<[^>]*>//g' | \
  head -30

# 4. Count words in document
unzip -p "filename.docx" word/document.xml 2>/dev/null | \
  grep -o '<w:t[^>]*>[^<]*</w:t>' | \
  sed 's/<[^>]*>//g' | \
  wc -w
```

### Notes
- Extracted text may have formatting issues (spacing, line breaks)
- Tables and images won't be properly represented
- Use `grep -A N` for N lines after match, `-B N` for before, `-C N` for context
- For large documents, pipe through `less` or save to file

### Quick Reference Template

```bash
# Replace <filename> and <search_term> with your values
unzip -p "<filename>.docx" word/document.xml 2>/dev/null | \
  grep -o '<w:t[^>]*>[^<]*</w:t>' | \
  sed 's/<[^>]*>//g' | \
  grep -i "<search_term>"
```

---

**Product**: Distribution and Fleet Management System (DFMS)  
**Developed by**: Brain Station 23  
**Source**: Business Analyst Team (Nourish requirements)  
**Maintained by**: DFMS Product Team  
**Last Updated**: February 2026

