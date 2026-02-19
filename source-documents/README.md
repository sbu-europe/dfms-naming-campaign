# Source Documents

> Original documentation from Business Analyst team - preserved as received

## 📖 Context

These documents represent requirements gathered from **Nourish**, our launch client. While building for Nourish, we're designing DFMS as a **flexible product** that can serve multiple clients in the distribution and fleet management space.

> See [01-PRODUCT_VISION.md](../01-PRODUCT_VISION.md) for our product strategy

## ⚠️ Important

**Do not modify or delete files in this directory.** These documents represent the original artifacts from the Business Analyst team and serve as the authoritative source for all derived documentation.

## 📂 Directory Structure

### `01-prd/`
Product Requirements Documents (PRD) and core specifications.

- `PRD_DFMS_v1.0.docx` - Primary product requirements document (Word format)
- `PRD_DFMS_v1.0.md` - Product requirements document (Markdown format)

> 📖 See [PRD Documentation](../business-context/03-module-specifications/) for structured PRD content

### `02-flow-diagram/`
Visual workflow diagrams and process flows for DFMS operations.

- `DFMS_End_to_End_Operational_Flow_FG_v1.5.png` - End-to-end operational flow (v1.5)
- `DFMS_End_to_End_Operational_Flow_FG_v1.6.png` - End-to-end operational flow (v1.6, latest)
- `DFMS_End_to_End_Operational_Flow_v1.1.jpg` - End-to-end operational flow (v1.1)
- `DFMS_Operation_Workflow_FG_Transfer_v1.4.png` - Finished Goods transfer workflow
- `DFMS_Operation_Workflow_Port_Shipment_v1.4.png` - Port shipment workflow
- `DFMS_Operation_Workflow_v1.3.drawio.png` - Operational workflow (v1.3)
- `DFMS_Operational_Flow_End_to_End_v1.2.drawio.png` - End-to-end flow (v1.2)
- `DFMS_Operational_Workflow_Port_Consignment_v1.5.png` - Port consignment workflow (v1.5)
- `DFMS_Operational_Workflow_Port_Consignment_v1.6.png` - Port consignment workflow (v1.6)
- `Flow_Diagrams.drawio` - Draw.io source file for flow diagrams

### `03-sow/`
Statement of Work (SOW) documents and feature specifications for all phases.

#### Phase Documents
- `SOW Phase-1.md` - Statement of Work for Phase 1 (MVP - P1)
  - **Scope**: Core Foundation & Operational Flow
  - Comprehensive feature breakdown by module/epic
  - Portal type (Web/Mobile Application/Mobile Interface)
  - Feature descriptions, sub-features, and remarks
  - Timeline: 24-28 weeks with 2 weeks UAT
  - Covers: System Foundation, User & Tenant Management, Master Data, POI Management, Product Inventory, Fleet Management, Transport Orders, Vendor Management, Gate Operations, QC Workflow, Mobile Interfaces

- `SOW Phase-2.md` - Statement of Work for Phase 2 (P2)
  - **Scope**: Intermediate Enhancements
  - Enhanced features for TO, Fleet, POI, Dashboards, Invoicing, Basic Fuel Tracking
  - Builds upon Phase 1 foundation

- `SOW Phase-3.md` - Statement of Work for Phase 3 (P2 & P3)
  - **Scope**: Intermediate Enhancements & Advanced Features
  - Intermediate: PO/PR, QC Audits, Dashboards, Invoicing, Basic Fuel Tracking
  - Advanced: Workshop Management, Advanced Analytics, Alerts, KPIs, Enhanced Tracking

#### Supporting Documents
- `user-roles.md` - User roles and permissions matrix
  - Tenant-level roles (Super Admin, Tenant Admin, Department Admin)
  - Operational roles (19 roles: Product Requester, Approvers, Transport Planner, Gate Operator, QC Inspector, Driver, Vendor, etc.)
  - Role descriptions and responsibilities

- `DFMS - Feature List version_1.xlsx` - Feature list spreadsheet (Excel format)
  - Detailed feature specifications across all phases
  - Feature categorization and prioritization

### `04-wbs/`
Work Breakdown Structure (WBS) and project planning documents.

- `epics-table.md` - Epic-level breakdown (17 epics)
- `stories-table.md` - User stories table (94+ stories)
- `timeline-table.md` - Sprint timeline and schedule (12 sprints, 26-week baseline)
- `dependencies-table.md` - Epic dependencies and critical path analysis
- `dashboard-table.md` - Project tracker and key metrics
- `risks-table.md` - Risk register (17 risks with mitigation strategies)
- `release-table.md` - Release plan (5 major releases: R1-R5)
- `WBS_Nourish_DFMS Phase 1 v1.xlsx` - Detailed work breakdown structure spreadsheet

> 📖 See [04-wbs/README.md](04-wbs/README.md) for detailed WBS documentation

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
- **Requirements**: `01-prd/PRD_DFMS_v1.0.md` or `.docx`
- **Process Flows**: `02-flow-diagram/` (latest: v1.6)
- **Statement of Work**: 
  - Phase 1 (MVP): `03-sow/SOW Phase-1.md`
  - Phase 2 (Intermediate): `03-sow/SOW Phase-2.md`
  - Phase 3 (Advanced): `03-sow/SOW Phase-3.md`
- **User Roles**: `03-sow/user-roles.md`
- **Feature Lists**: `03-sow/DFMS - Feature List version_1.xlsx`
- **Work Breakdown**: `04-wbs/` (epics, stories, timeline, dependencies, risks, releases)
- **Project Planning**: `04-wbs/WBS_Nourish_DFMS Phase 1 v1.xlsx`

## 📊 Document Status

| Document Type | Latest Version | Location | Status |
|--------------|----------------|----------|--------|
| PRD | v1.0 | `01-prd/` | Current |
| Flow Diagrams | v1.6 | `02-flow-diagram/` | Latest |
| SOW Phase 1 | v1 | `03-sow/SOW Phase-1.md` | Current |
| SOW Phase 2 | v1 | `03-sow/SOW Phase-2.md` | Current |
| SOW Phase 3 | v1 | `03-sow/SOW Phase-3.md` | Current |
| User Roles | v1 | `03-sow/user-roles.md` | Current |
| Feature List | v1 | `03-sow/` | Current |
| WBS Phase 1 | v1 | `04-wbs/` | Current |
| Epics | 17 epics | `04-wbs/epics-table.md` | Planned |
| Stories | 94+ stories | `04-wbs/stories-table.md` | Planned |
| Timeline | 26 weeks | `04-wbs/timeline-table.md` | Planned |
| Releases | R1-R5 | `04-wbs/release-table.md` | Planned |

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

