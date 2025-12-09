# JSON Schemas for Each Report Type

## 3. JSON Schema for Each Report

### 3.1 Tax Invoice JSON Schema

```json
{
  "TaxInvoice": {
    "type": "object",
    "required": ["invoiceNo", "invoiceDate", "companyId", "partyId", "items"],
    "properties": {
      "id": { "type": "integer" },
      "invoiceNo": { 
        "type": "string",
        "example": "SZ0975/24-25",
        "description": "Unique invoice number with prefix"
      },
      "ackNo": { 
        "type": "string",
        "example": "152419188704679",
        "description": "Acknowledgment number from GST system"
      },
      "invoiceDate": { 
        "type": "string",
        "format": "date",
        "example": "2024-09-10"
      },
      "ackDate": { 
        "type": "string",
        "format": "date",
        "example": "2024-09-10"
      },
      "irn": { 
        "type": "string",
        "example": "f99a57ad9cfe77193f0f60269bc70171e9c47ba6aee90c7f464b1ad6d83e5c5a",
        "description": "Invoice Reference Number from GST system"
      },
      "reverseCharge": { 
        "type": "boolean",
        "default": false,
        "description": "Tax payable on reverse charge"
      },
      "companyId": { "type": "integer" },
      "partyId": { "type": "integer" },
      "deliveredToPartyId": { 
        "type": "integer",
        "description": "Different from billed party if applicable"
      },
      "setNo": { 
        "type": "string",
        "example": "394A",
        "description": "Job card set number"
      },
      "ends": { "type": "integer", "example": 4080 },
      "count": { "type": "string", "example": "30's vortex" },
      "meters": { "type": "number", "example": 22070.00 },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["description", "hsnSac", "quantity", "rate", "amount"],
          "properties": {
            "sno": { "type": "integer" },
            "description": { 
              "type": "string",
              "example": "4080/30's vortex - SIZING CHARGES"
            },
            "hsnSac": { 
              "type": "string",
              "example": "998821",
              "description": "HSN for goods, SAC for services"
            },
            "quantity": { "type": "number", "example": 1674.700 },
            "rate": { "type": "number", "example": 19.00 },
            "amount": { "type": "number", "example": 31819.30 }
          }
        }
      },
      "bankDetails": {
        "type": "object",
        "properties": {
          "accountNo": { "type": "string", "example": "1641223000000131" },
          "bankName": { "type": "string", "example": "KARUR VYSYA BANK" },
          "branch": { "type": "string", "example": "CHENNIMALAI" },
          "ifsc": { "type": "string", "example": "KVBL0001641" }
        }
      },
      "taxableAmount": { "type": "number", "example": 31819.30 },
      "cgst": { "type": "number", "example": 795.48 },
      "sgst": { "type": "number", "example": 795.48 },
      "igst": { "type": "number", "example": 0 },
      "roundOff": { "type": "number", "example": -0.26 },
      "netAmount": { "type": "number", "example": 33410.00 },
      "amountInWords": { 
        "type": "string",
        "example": "Thirty Three Thousand Four Hundred And Ten Only"
      },
      "paymentTerms": { 
        "type": "string",
        "example": "45 Days ( 25/10/2024 )"
      },
      "vehicleId": { "type": "integer" },
      "deliveryPlaceId": { "type": "integer" },
      "preparedBy": { "type": "string" },
      "checkedBy": { "type": "string" },
      "authorisedSignatory": { "type": "string" },
      "jurisdiction": { 
        "type": "string",
        "example": "CHENNIMALAI"
      },
      "createdAt": { "type": "string", "format": "date-time" },
      "updatedAt": { "type": "string", "format": "date-time" }
    }
  }
}
```

### 3.2 Set Report (Sizing Job Card) JSON Schema

```json
{
  "SetReport": {
    "type": "object",
    "required": ["setNo", "date", "companyId", "partyId"],
    "properties": {
      "id": { "type": "integer" },
      "setNo": { 
        "type": "string",
        "example": "399A",
        "description": "Unique set number across warping and sizing"
      },
      "date": { 
        "type": "string",
        "format": "date",
        "example": "2024-09-11"
      },
      "companyId": { "type": "integer" },
      "partyId": { "type": "integer" },
      "loomTypeId": { "type": "integer" },
      "ends": { "type": "integer", "example": 4800 },
      "count": { "type": "string", "example": "30's vortex" },
      "millName": { "type": "string", "example": "Kumaragiri" },
      "tapeLength": { "type": "string" },
      "beamWidth": { 
        "type": "string",
        "example": "74''",
        "description": "Beam width in inches"
      },
      "mark": { "type": "string" },
      "avgCount": { "type": "number", "example": 30.78 },
      "excess": { "type": "number", "example": 1.500 },
      "warpingMetres": { "type": "number", "example": 15800.00 },
      
      "sizingDetails": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "no": { "type": "integer" },
            "ends": { "type": "integer" },
            "grossWeight": { "type": "number" },
            "netWeight": { "type": "number" },
            "breaks": { "type": "integer" }
          }
        }
      },
      
      "deliveryDetails": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "no": { "type": "integer" },
            "beamNo": { "type": "string" },
            "grossWeight": { "type": "number" },
            "tareWeight": { "type": "number" },
            "netWeight": { "type": "number" },
            "pieces": { "type": "integer" },
            "metres": { "type": "number" },
            "dcNo": { "type": "string" },
            "deliveryTo": { "type": "string" }
          }
        }
      },
      
      "babyConeDetails": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "bags": { "type": "integer" },
            "cones": { "type": "integer" },
            "weight": { "type": "number" }
          }
        }
      },
      "tareWeight": { "type": "number", "example": 30.600 },
      
      "emptyBeamStock": {
        "type": "object",
        "properties": {
          "opening": { "type": "integer", "example": 0 },
          "received": { "type": "integer", "example": 4 },
          "consumed": { "type": "integer", "example": -4 },
          "closing": { "type": "integer", "example": 0 },
          "beamNo": { "type": "string", "example": "975" }
        }
      },
      
      "yarnStock": {
        "type": "object",
        "properties": {
          "opening": { "type": "number", "example": 0.000 },
          "receiptNo": { "type": "string", "example": "804" },
          "receiptWeight": { "type": "number", "example": 2400.000 },
          "total": { "type": "number", "example": 2400.000 },
          "takenYarn": { "type": "number", "example": 1500.000 },
          "balance": { "type": "number", "example": 900.000 },
          "babyYarn": { "type": "number", "example": 42.100 },
          "finalBalance": { "type": "number", "example": 942.100 },
          "pickupPercentage": { "type": "number", "example": 8.13 },
          "elongationPercentage": { "type": "number", "example": 4.81 }
        }
      },
      
      "yarnTakenDetails": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "type": { "type": "string", "example": "MILL" },
            "count": { "type": "string", "example": "30's vortex" },
            "millName": { "type": "string", "example": "KUMARAGIRI" },
            "cones": { "type": "integer", "example": 600 },
            "weight": { "type": "number", "example": 1500.000 }
          }
        }
      },
      
      "preparedBy": { "type": "string" },
      "checkedBy": { "type": "string" },
      "gmSign": { "type": "string" },
      "authorizedSign": { "type": "string" },
      "createdAt": { "type": "string", "format": "date-time" },
      "updatedAt": { "type": "string", "format": "date-time" }
    }
  }
}
```

### 3.3 Yarn Receipt JSON Schema

```json
{
  "YarnReceipt": {
    "type": "object",
    "required": ["receiptNo", "receiptDate", "companyId", "partyId", "items"],
    "properties": {
      "id": { "type": "integer" },
      "receiptNo": { 
        "type": "string",
        "example": "823",
        "description": "Unique receipt number"
      },
      "receiptDate": { 
        "type": "string",
        "format": "date-time",
        "example": "2024-09-13T11:50:00"
      },
      "pdcNo": { 
        "type": "string",
        "example": "823",
        "description": "Previous DC number"
      },
      "companyId": { "type": "integer" },
      "partyId": { "type": "integer" },
      
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["millName", "count", "weight"],
          "properties": {
            "sno": { "type": "integer" },
            "millName": { "type": "string", "example": "LUCKY" },
            "lotNo": { "type": "string", "example": "WY-008" },
            "count": { "type": "string", "example": "30's vortex" },
            "bags": { "type": "integer", "example": 100 },
            "cones": { "type": "integer", "example": 2400 },
            "weightPerCone": { "type": "number", "example": 2.500 },
            "weight": { "type": "number", "example": 6000.000 }
          }
        }
      },
      
      "totals": {
        "type": "object",
        "properties": {
          "totalBags": { "type": "integer", "example": 100 },
          "totalCones": { "type": "integer", "example": 2400 },
          "totalWeight": { "type": "number", "example": 6000.000 }
        }
      },
      
      "vehicleId": { "type": "integer" },
      "receivedBy": { "type": "string" },
      "preparedBy": { "type": "string" },
      "checkedBy": { "type": "string" },
      "gmSign": { "type": "string" },
      "createdAt": { "type": "string", "format": "date-time" },
      "updatedAt": { "type": "string", "format": "date-time" }
    }
  }
}
```

### 3.4 Yarn Return JSON Schema

```json
{
  "YarnReturn": {
    "type": "object",
    "required": ["dcNo", "dcDate", "companyId", "partyId", "items"],
    "properties": {
      "id": { "type": "integer" },
      "dcNo": { 
        "type": "string",
        "example": "Y338",
        "description": "Delivery challan number for return"
      },
      "dcDate": { 
        "type": "string",
        "format": "date-time",
        "example": "2025-12-05T12:20:00"
      },
      "companyId": { "type": "integer" },
      "partyId": { "type": "integer" },
      
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["type", "count", "weight"],
          "properties": {
            "type": { "type": "string", "example": "MILL" },
            "setNo": { "type": "string", "example": "PALLAVA (PALLET)" },
            "millName": { "type": "string", "example": "PALLAVA (PALLET)" },
            "count": { "type": "string", "example": "30's vortex" },
            "hsn": { "type": "string", "example": "55101110" },
            "bags": { "type": "integer", "example": 0 },
            "cones": { "type": "integer", "example": 44 },
            "weight": { "type": "number", "example": 134.640 }
          }
        }
      },
      
      "totals": {
        "type": "object",
        "properties": {
          "totalBags": { "type": "integer", "example": 0 },
          "totalCones": { "type": "integer", "example": 44 },
          "totalWeight": { "type": "number", "example": 134.640 }
        }
      },
      
      "notes": { 
        "type": "string",
        "example": "NOT FOR SALE ( JOBWORK ONLY )"
      },
      
      "vehicleId": { "type": "integer" },
      "isDirectDelivery": { 
        "type": "boolean",
        "default": false,
        "description": "Direct delivery without vehicle"
      },
      
      "receiversSignature": { "type": "string" },
      "preparedBy": { "type": "string" },
      "checkedBy": { "type": "string" },
      "gmSign": { "type": "string" },
      "createdAt": { "type": "string", "format": "date-time" },
      "updatedAt": { "type": "string", "format": "date-time" }
    }
  }
}
```

### 3.5 Yarn Delivery JSON Schema

```json
{
  "YarnDelivery": {
    "type": "object",
    "required": ["dcNo", "date", "companyId", "partyId", "items"],
    "properties": {
      "id": { "type": "integer" },
      "dcNo": { 
        "type": "string",
        "example": "56",
        "description": "Delivery challan number"
      },
      "date": { 
        "type": "string",
        "format": "date",
        "example": "2024-08-28"
      },
      "companyId": { "type": "integer" },
      "partyId": { "type": "integer" },
      
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["millName", "count", "weight", "rate", "amount"],
          "properties": {
            "no": { "type": "integer" },
            "type": { "type": "string", "example": "R/W" },
            "millName": { "type": "string", "example": "PALLAVA" },
            "count": { "type": "string", "example": "30's vortex" },
            "bags": { "type": "integer", "example": 0 },
            "cones": { "type": "integer", "example": 0 },
            "weight": { "type": "number", "example": 719.260 },
            "rate": { "type": "number", "example": 190.00 },
            "amount": { "type": "number", "example": 136659.40 }
          }
        }
      },
      
      "totals": {
        "type": "object",
        "properties": {
          "totalBags": { "type": "integer", "example": 0 },
          "totalCones": { "type": "integer", "example": 0 },
          "totalWeight": { "type": "number", "example": 719.260 },
          "totalRate": { "type": "number", "example": 190.00 },
          "totalAmount": { "type": "number", "example": 136659.40 }
        }
      },
      
      "taxableValue": { "type": "number", "example": 136659.40 },
      "notes": { 
        "type": "string",
        "example": "NOT FOR SALE (FOR JOBWORK ONLY)"
      },
      
      "vehicleId": { "type": "integer" },
      "receiverSign": { "type": "string" },
      "preparedBy": { "type": "string" },
      "checkedBy": { "type": "string" },
      "createdAt": { "type": "string", "format": "date-time" },
      "updatedAt": { "type": "string", "format": "date-time" }
    }
  }
}
```

### 3.6 Warping Job Card JSON Schema

```json
{
  "WarpingJobCard": {
    "type": "object",
    "required": ["setNo", "date", "companyId", "partyId"],
    "properties": {
      "id": { "type": "integer" },
      "setNo": { 
        "type": "string",
        "example": "394A",
        "description": "Unique set number"
      },
      "date": { 
        "type": "string",
        "format": "date",
        "example": "2024-09-11"
      },
      "companyId": { "type": "integer" },
      "partyId": { "type": "integer" },
      
      "header": {
        "type": "object",
        "properties": {
          "machineName": { "type": "string" },
          "setLengthMeters": { "type": "number" },
          "count": { "type": "string", "example": "30's vortex" },
          "totalEnds": { "type": "integer" },
          "markWheel": { "type": "string" },
          "mark": { "type": "string" },
          "tapeLength": { "type": "string" },
          "beamWidthInch": { "type": "string" },
          "loomTypeId": { "type": "integer" },
          "noOfBeams": { "type": "integer" },
          "rf": { "type": "string" },
          "viscosity": { "type": "string" },
          "pre": { "type": "string" },
          "check": { "type": "string" },
          "pickUp": { "type": "string" },
          "elongation": { "type": "string" },
          "millName": { "type": "string" },
          "mcNo": { "type": "string" },
          "lotNo": { "type": "string" },
          "coneWeight": { "type": "string" }
        }
      },
      
      "beamDetails": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "fr": { "type": "string" },
            "sno": { "type": "integer" },
            "beamNo": { "type": "string" },
            "clothMetres": { "type": "number" },
            "pieces": { "type": "integer" },
            "grossWeightKgs": { "type": "number" },
            "tareWeightKgs": { "type": "number" },
            "netWeightKgs": { "type": "number" },
            "readingMetres": { "type": "number" },
            "timeStart": { "type": "string" },
            "timeFinish": { "type": "string" },
            "sizer": { "type": "string" },
            "backSizer": { "type": "string" },
            "pickUps": { "type": "string" },
            "vendorName": { "type": "string" },
            "sizingComb": { "type": "string" },
            "sizeBox": { "type": "string" },
            "warpBeam": { "type": "string" },
            "cylinder": { "type": "string" },
            "rpm": { "type": "number" },
            "warperName": { "type": "string" },
            "breaks": { "type": "integer" },
            "beamCount": { "type": "string" }
          }
        }
      },
      
      "totals": {
        "type": "object",
        "properties": {
          "totalClothMetres": { "type": "number" },
          "totalPieces": { "type": "integer" },
          "totalGrossWeight": { "type": "number" },
          "totalTareWeight": { "type": "number" },
          "totalNetWeight": { "type": "number" },
          "totalReadingMetres": { "type": "number" },
          "avgBeamCount": { "type": "string" }
        }
      },
      
      "remarks": { "type": "string" },
      
      "bottomBox": {
        "type": "object",
        "properties": {
          "elongation": { "type": "string" },
          "elongationPercentage": { "type": "number" },
          "avgPickUpPercentage": { "type": "number" }
        }
      },
      
      "shiftDetails": {
        "type": "object",
        "properties": {
          "shift": { "type": "string" },
          "pavu": { "type": "string" },
          "metres": { "type": "number" },
          "kgs": { "type": "number" }
        }
      },
      
      "waste": {
        "type": "object",
        "properties": {
          "frontWaste": { "type": "number" },
          "backWaste": { "type": "number" },
          "babyConeLeftoverList": { "type": "string" }
        }
      },
      
      "particulars": {
        "type": "object",
        "properties": {
          "warpBeamChecking": { "type": "string" },
          "weaversEmptyBeamChecking": { "type": "string" }
        }
      },
      
      "babyConeDetails": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "materialName": { 
              "type": "string",
              "example": "maize, beans, binders"
            },
            "weight": { "type": "number" }
          }
        }
      },
      
      "runOutConeTaken": {
        "type": "object",
        "properties": {
          "creeling5ConesWeight": { "type": "number" },
          "rw": { "type": "string" },
          "cone": { "type": "string" },
          "netWeight": { "type": "number" }
        }
      },
      
      "remnantDetails": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "sno": { "type": "integer" },
            "noOfCones": { "type": "integer" },
            "grossWeight": { "type": "number" },
            "netWeight": { "type": "number" }
          }
        }
      },
      
      "warpDetailsSummary": {
        "type": "object",
        "properties": {
          "totalWarpBreaks": { "type": "integer" },
          "breaksPerMillionMtrs": { "type": "number" },
          "fullBagsTaken": { "type": "integer" },
          "bags": { "type": "integer" },
          "runOutConeTaken": { "type": "integer" },
          "cone": { "type": "integer" },
          "netWeight": { "type": "number" },
          "totalYarnTakenNetWeight": { "type": "number" },
          "warpNetWeight": { "type": "number" },
          "cutConeNetWeight": { "type": "number" },
          "totalNetWeight": { "type": "number" },
          "excessShortage": { "type": "number" }
        }
      },
      
      "tareWeightDetails": {
        "type": "object",
        "properties": {
          "tareWeight": { "type": "number" },
          "cones": { "type": "integer" },
          "bags": { "type": "integer" }
        }
      },
      
      "signatures": {
        "type": "object",
        "properties": {
          "shiftSupervisor": { "type": "string" },
          "checkedBy": { "type": "string" },
          "manager": { "type": "string" },
          "sizerSign": { "type": "string" },
          "mdSign": { "type": "string" },
          "fmSign": { "type": "string" }
        }
      },
      
      "createdAt": { "type": "string", "format": "date-time" },
      "updatedAt": { "type": "string", "format": "date-time" }
    }
  }
}
```