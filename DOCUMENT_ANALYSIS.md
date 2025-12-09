# SMART ERP Billing System - Document Analysis

## 1. Summary of All Reports

### Report Types Identified:
1. **Tax Invoice** - Billing for sizing services (GST compliant)
2. **Set Report (Sizing Job Card)** - Complete job card with warping & sizing
3. **Yarn Receipt** - Inward yarn from vendors
4. **Yarn Return** - Return of unused yarn to vendors
5. **Yarn Delivery** - Outbound yarn to customers
6. **Warping Job Card** - Warping process details

## 2. Field Extraction Per Report

### 2.1 Tax Invoice Fields

**Header Section:**
- Company Name: "ORANGE SIZING UNIT"
- Company Address: "545/1,ULAGAPURAM, , KUMARAVALASU, PERUNDURAI, , ERODE-638112"
- PAN: "BFLPV9549C"
- Phone: "9345945190,7094421351"
- GSTIN: "33BFLPV9549C1ZZ"
- Email: "orangesizingunit@gmail.com"
- Tax Reverse Charge: "NO"

**Invoice Details:**
- Invoice No: "SZ0975/24-25"
- Ack.No: "152419188704679"
- Invoice Date: "10/09/2024"
- Ack.Date: "10/09/2024"
- IRN: "f99a57ad9cfe77193f0f60269bc70171e9c47ba6aee90c7f464b1ad6d83e5c5a"

**Party Details:**
- Billed To: "M/S.SRI SHANMUGA TEXTILES"
- Billed Address: "4/225, PETHAMUCHIPALAYAM, SAMALAPURAM, Tiruppur - 641663"
- Billed State: "Tamil Nadu"
- Billed State Code: "33"
- Billed GSTIN: "33AJDPP7980L1ZN"
- Billed PAN: "AJDPP7980L"
- Delivered To: Same as billed (can be different)

**Job Details:**
- Set No: "394A"
- Ends: "4080"
- Count: "30's vortex"
- Meters: "22070.00"

**Item Table:**
- S.No: "2"
- Particulars: "4080/30's vortex - SIZING CHARGES"
- HSN/SAC: "998821"
- Quantity: "1674.700"
- Rate: "19.00"
- Amount: "31819.30"

**Bank Details:**
- Account No: "1641223000000131"
- Bank Name: "KARUR VYSYA BANK"
- Branch: "CHENNIMALAI"
- IFSC: "KVBL0001641"

**Tax Calculation:**
- Taxable Amount: "31819.30"
- CGST 2.5%: "795.48"
- SGST 2.5%: "795.48"
- Round Off: "-0.26"
- Net Amount: "33410.00"
- Amount in Words: "Thirty Three Thousand Four Hundred And Ten Only"

**Payment Terms:**
- Payment Terms: "45 Days ( 25/10/2024 )"

**Signatures:**
- Prepared By
- Checked By
- Authorised Signatory

**Footer:**
- Subject to CHENNIMALAI Jurisdiction
- E.&O.E

### 2.2 Set Report (Sizing Job Card) Fields

**Header:**
- Company Name: "ORANGE SIZING UNIT"
- Company Address: "545/1,ULAGAPURAM, KUMARAVALASU, PERUNDURAI, ERODE-638112"
- GSTIN: "33BFLPV9549C1ZZ"

**Party Details:**
- To: "SRI VIPIN TEXTILE"
- Party Address: "Door No.1/81, KARANAMPETTAI, PALLADAM Tiruppur - 641401"
- Party GSTIN: "33BQIPS4885G1ZD"

**Job Card Details:**
- Set No: "399A"
- Date: "11-09-2024"
- Loom Type: "SULZER"
- Ends: "4800"
- Count: "30's vortex"
- Mill: "Kumaragiri"
- Tape Length: (empty)
- Beam Width: "74''"
- Mark: (empty)
- Avg.Count: "30.78"
- Excess: "1.500"
- Warping - Metre: "15800.00"

**Sizing Details Table:**
Columns: No, Ends, Grs Wt, Net Wt, Breaks
Data rows for each beam (8 rows total)

**Delivery Details Table:**
Columns: No, BeamNo, Grs Wgt, Tr Wgt, Net Wgt, Pcs, Metre, Dc.No, Delivery To
Data rows for each beam (4 rows total)

**Baby Cone Detail:**
- Bags: "3", Cones: "600", Weight: "72.700" (repeated 3 times)
- Tare Weight: "30.600"
- Final entry: Bags: "3", Cones: "600", Weight: "42.100"

**Empty Beam Stock:**
- Opening: "0"
- Received: "4"
- Consumed: "-4"
- Closing: "0"
- No. "975"

**Yarn Stock:**
- Opening: "0.000"
- RecNo.804: "2400.000"
- Total: "2400.000"
- Taken Yarn: "1500.000"
- Balance: "900.000"
- Baby Yarn: "42.100"
- Balance: "942.100"
- Pickup %: "8.13"
- Elongation %: "4.81"

**Yarn Taken Detail:**
- TYPE: "MILL"
- COUNT: "30's vortex"
- MILL NAME: "KUMARAGIRI"
- CONES: "600"
- WEIGHT: "1500.000"

**Signatures:**
- Prepared by
- Checked by
- GM Sign
- Authorised Sign

### 2.3 Yarn Receipt Fields

**Header:**
- Company Name: "ORANGE SIZING UNIT"
- Company Address: "545/1,ULAGAPURAM, , KUMARAVALASU, PERUNDURAI, , ERODE-638112"
- GSTIN: "33BFLPV9549C1ZZ"
- Phone: "9345945190,7094421351"

**Document Details:**
- REC NO: "823"
- REC.DATE: "13/09/2024 11:50 AM"
- P.DC.NO: "823"

**Vendor Details:**
- From: "M/S.SRI SHANMUGA TEXTILES"
- Vendor Address: "4/225, PETHAMUCHIPALAYAM, SAMALAPURAM , Tiruppur - 641663"
- GSTIN NO: "33AJDPP7980L1ZN"

**Item Table:**
- S.NO: "1"
- MILL NAME: "LUCKY"
- LOT NO: "WY-008"
- COUNT: "30's vortex"
- BAGS: "100"
- CONES: "2400"
- WT/CONE: "2.500"
- WEIGHT: "6000.000"

**Totals:**
- TOTAL BAGS: "100"
- TOTAL CONES: "2400"
- TOTAL WEIGHT: "6000.000"

**Vehicle Details:**
- Vechile No: "TN56R2935"

**Signatures:**
- Received By: (empty)
- Prepared By
- Checked By
- GM Sign
- For ORANGE SIZING UNIT

### 2.4 Yarn Return Fields

**Header:**
- Company Name: "ORANGE SIZING UNIT"
- Company Address: "545/1,ULAGAPURAM, , KUMARAVALASU, PERUNDURAI, , ERODE-638112"
- GSTIN: "33BFLPV9549C1ZZ"
- Phone: "9345945190,7094421351"

**Document Details:**
- D.C.NO: "Y338"
- D.C.DATE: "05/12/2025 12:20 PM"

**Party Details:**
- To: "M/s. ASHRIYTH AUTOLOOMS"
- Party Address: "SF NO.389/1A KOLLANKADDU THOTTAM, THATTAMPUDUR, KANIYUR POST, KARUMATHAMPATTI Coimbatore - 641659"
- GSTIN: "33APQPN4127C1Z2"

**Item Table:**
- TYPE: "MILL"
- SET NO: "PALLAVA (PALLET)"
- MILL NAME: "PALLAVA (PALLET)"
- COUNT: "30's vortex"
- HSN: "55101110"
- BAGS: "0"
- CONES: "44"
- WEIGHT: "134.640"

**Totals:**
- TOTAL BAGS: "0"
- TOTAL CONES: "44"
- TOTAL WEIGHT: "134.640"

**Notes:**
- "NOT FOR SALE ( JOBWORK ONLY )"

**Vehicle Details:**
- Vehicle No: "DIRECT"

**Signatures:**
- Receivers Signature
- Prepared By
- Checked By
- GM Sign
- For ORANGE SIZING UNIT

### 2.5 Yarn Delivery Fields

**Header:**
- Company Name: "GREEN FINE TEXTILES"
- Company Address: "247, THENMUGAM VELLODE, 200,KUMARAVALASU, ULAGAPURAM"
- Phone: "8973509999"
- GSTIN: "33AAUFG4014A2ZU"

**Document Details:**
- DC NO: "56"
- DATE: "28/08/2024"

**Party Details:**
- To: "PRAVIN TEXTILE"
- Party Address: "3/733,ARACHALUR ROAD, AMMAPALAYAM,CHENNIMALAI,ERODE-638051"
- GSTIN: "33AKKPM0480A1ZN"

**Item Table:**
- NO: "1"
- TYPE: "R/W"
- MILL NAME: "PALLAVA"
- COUNT: "30's vortex"
- BAGS: "0"
- CONES: "0"
- WEIGHT: "719.260"
- RATE: "190.00"
- AMOUNT: "136659.40"

**Totals:**
- TOTAL BAGS: "0"
- TOTAL CONES: "0"
- TOTAL WEIGHT: "719.260"
- TOTAL RATE: "190.00"
- TOTAL AMOUNT: "136659.40"

**Vehicle Details:**
- VEHICLE: "TN56R2913"

**Financial Details:**
- TAXABLE VALUE: "136659.40"
- "NOT FOR SALE (FOR JOBWORK ONLY)"

**Signatures:**
- Receiver Sign
- Prepared By
- Checked By
- For GREEN FINE TEXTILES

### 2.6 Warping Job Card Fields (From Images)

**Header Fields:**
- M/C Name
- Date
- Set No
- Set Length (Meters)
- Party Name
- Count
- Total Ends
- Mark Wheel
- Mark
- Tape Length
- Beam Width (inch)
- Loom Type
- No. of Beams
- RF
- Viscosity
- Pre (handwritten)
- Check
- Pick Up
- Elongation

**Main Table Columns:**
- F/R
- S.No
- Beam No
- Cloth Metres
- Pcs
- G.W.T in Kgs
- T.W.T in Kgs
- N.W.T in Kgs
- Reading Metres
- Time Taken – Start
- Time Taken – Finish
- Sizer
- Back Sizer
- Pick Ups
- Vendor Name
- Sizing Comb
- Size Box
- Warp Beam
- Cylinder

**Table Summary:**
- TOTAL (for each column)

**Remarks Section:**
- Remarks (If any)

**Bottom Box Fields:**
- Elongation
- Elongation (%)
- Avg Pick Up (%)

**Shift Box:**
- Shift
- Pavu
- Mtr
- Kg

**Waste Fields:**
- Front Waste
- Back Waste
- Baby cone / leftover yarn list

**Particulars Section:**
- Warp Beam Checking
- Weaver's Empty Beam Checking

**Baby Cone Details:**
- Material Name (maize, beans, binders, etc.)
- Weight

**Signatures:**
- Shift Supervisor
- Checked By
- Manager
- Sizer Sign
- M.D Sign
- F.M Sign

**KARL MAYER Warping Card Additional Fields:**

**Header:**
- Date
- Set No
- Length in Mtrs
- Party Name
- Mill Name
- Count
- M/C No
- Total Ends
- Lot No
- Pre (handwritten)
- Check
- Cone Wt (3kg etc.)

**Main Table Columns:**
- S.No
- Beam No
- Metre
- Ends
- G.W.T in Kgs
- T.W.T in Kgs
- N.W.T in Kgs
- Time Taken – Start
- Time Taken – Finish
- RPM
- Warper Name
- Breaks
- Beam Count

**Run Out Cone Taken:**
- Creeling 5 cones weight
- R/W
- Cone
- N.W.T

**Details of Remnants (Baby Cone):**
- S.No
- No of Cones
- G.W.T
- N.W.T

**Warp Details Summary:**
- Total Warp Breaks
- Breaks / Million Mtrs
- Full Bags Taken
- Bags
- Run Out Cone Taken
- Cone
- N.W.T
- Total Yarn Taken N.W.T in Kgs
- Warp N.W.T in Kgs
- Cut Cone N.W.T in Kgs
- Total N.W.T in Kgs
- Excess / Shortage

**Tare WT Details:**
- Tare Weight
- Cones
- Bags