# Database Schema Design

## 4. Combined Master Schema

### 4.1 Core Master Tables

```sql
-- Companies Table (Orange Sizing Unit and other companies)
CREATE TABLE Companies (
    CompanyId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyName NVARCHAR(200) NOT NULL,
    GSTIN NVARCHAR(15) UNIQUE NOT NULL,
    PAN NVARCHAR(20) UNIQUE,
    Address NVARCHAR(500),
    State NVARCHAR(100),
    StateCode NVARCHAR(10),
    Phone NVARCHAR(50),
    Email NVARCHAR(150),
    Website NVARCHAR(200),
    BankName NVARCHAR(150),
    BankAccount NVARCHAR(50),
    IFSC NVARCHAR(20),
    Branch NVARCHAR(100),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Parties (Customers/Vendors)
CREATE TABLE Parties (
    PartyId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL, -- Reference to Companies table
    PartyName NVARCHAR(200) NOT NULL,
    GSTIN NVARCHAR(15) UNIQUE,
    PAN NVARCHAR(20),
    Address NVARCHAR(500),
    State NVARCHAR(100),
    StateCode NVARCHAR(10),
    Phone NVARCHAR(50),
    Email NVARCHAR(150),
    OrganizationType NVARCHAR(100),
    BankName NVARCHAR(150),
    BankAccount NVARCHAR(50),
    IFSC NVARCHAR(20),
    Branch NVARCHAR(100),
    NoOfLooms INT NULL,
    CommissionPerBag DECIMAL(18,2) NULL,
    CommissionPercent DECIMAL(5,2) NULL,
    DueDays INT DEFAULT 0,
    LedgerTypeId INT,
    AccountGroupId INT,
    AccountMaintenance NVARCHAR(50), -- 'Balance Only' or 'Bill to Bill'
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId)
);

-- Ledger Types
CREATE TABLE LedgerTypes (
    LedgerTypeId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Account Groups
CREATE TABLE AccountGroups (
    AccountGroupId INT IDENTITY(1,1) PRIMARY KEY,
    GroupName NVARCHAR(150) NOT NULL,
    ParentGroupId INT NULL,
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ParentGroupId) REFERENCES AccountGroups(AccountGroupId)
);

-- Delivery Places
CREATE TABLE DeliveryPlaces (
    DeliveryPlaceId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL,
    PlaceName NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500),
    Contact NVARCHAR(100),
    Phone NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId)
);

-- Counts (Yarn Counts)
CREATE TABLE Counts (
    CountId INT IDENTITY(1,1) PRIMARY KEY,
    CountNumber NVARCHAR(50) UNIQUE NOT NULL,
    CountName NVARCHAR(100),
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Ends
CREATE TABLE Ends (
    EndId INT IDENTITY(1,1) PRIMARY KEY,
    EndNumber INT NOT NULL,
    CountId INT NOT NULL,
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CountId) REFERENCES Counts(CountId)
);

-- Units of Measurement
CREATE TABLE Units (
    UnitId INT IDENTITY(1,1) PRIMARY KEY,
    UnitName NVARCHAR(50) NOT NULL,
    UnitSymbol NVARCHAR(20),
    Description NVARCHAR(200),
    UnitType NVARCHAR(50), -- 'Weight', 'Length', 'Count', etc.
    ConversionFactor DECIMAL(18,4), -- Base unit conversion
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Taxes
CREATE TABLE Taxes (
    TaxId INT IDENTITY(1,1) PRIMARY KEY,
    TaxName NVARCHAR(50) NOT NULL,
    Rate DECIMAL(5,2) NOT NULL,
    TaxType NVARCHAR(20), -- 'CGST', 'SGST', 'IGST'
    IsActive BIT DEFAULT 1,
    EffectiveFrom DATE NOT NULL,
    EffectiveTo DATE NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Loom Types
CREATE TABLE LoomTypes (
    LoomTypeId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(250),
    ChargePerBeam DECIMAL(18,2) NULL,
    ChargePerKg DECIMAL(18,2) NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Vehicles
CREATE TABLE Vehicles (
    VehicleId INT IDENTITY(1,1) PRIMARY KEY,
    VehicleNo NVARCHAR(50) UNIQUE NOT NULL,
    VehicleType NVARCHAR(50),
    DriverName NVARCHAR(100),
    DriverPhone NVARCHAR(50),
    DriverLicense NVARCHAR(50),
    CompanyId INT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId)
);

-- Beams
CREATE TABLE Beams (
    BeamId INT IDENTITY(1,1) PRIMARY KEY,
    BeamNo NVARCHAR(50) UNIQUE NOT NULL,
    GrossWeight DECIMAL(18,3) NOT NULL,
    TareWeight DECIMAL(18,3) NOT NULL,
    YarnWeight AS (GrossWeight - TareWeight) PERSISTED,
    Status NVARCHAR(50) DEFAULT 'IN', -- IN, OUT, MAINTENANCE
    CurrentLocation NVARCHAR(100),
    LastUsedDate DATETIME NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Sizing Charges (Party-specific)
CREATE TABLE SizingCharges (
    SizingChargeId INT IDENTITY(1,1) PRIMARY KEY,
    PartyId INT NOT NULL,
    ChargePerKg DECIMAL(18,2) NOT NULL,
    ChargePerBeam DECIMAL(18,2) NULL,
    EffectiveFrom DATE NOT NULL,
    EffectiveTo DATE NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (PartyId) REFERENCES Parties(PartyId)
);
```

### 4.2 Transaction Tables

```sql
-- Set Reports / Job Cards
CREATE TABLE JobCards (
    JobCardId INT IDENTITY(1,1) PRIMARY KEY,
    SetNo NVARCHAR(50) UNIQUE NOT NULL,
    Date DATE NOT NULL,
    CompanyId INT NOT NULL,
    PartyId INT NOT NULL,
    LoomTypeId INT,
    MillName NVARCHAR(200),
    Count NVARCHAR(50),
    Ends INT,
    TapeLength NVARCHAR(50),
    BeamWidth NVARCHAR(50),
    Mark NVARCHAR(50),
    AvgCount DECIMAL(8,3),
    Excess DECIMAL(8,3),
    WarpingMetres DECIMAL(12,2),
    PickupPercentage DECIMAL(5,2),
    ElongationPercentage DECIMAL(5,2),
    YarnTakenKg DECIMAL(18,3),
    Remarks NVARCHAR(400),
    PreparedBy NVARCHAR(100),
    CheckedBy NVARCHAR(100),
    GMSign NVARCHAR(100),
    AuthorizedSign NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    FOREIGN KEY (LoomTypeId) REFERENCES LoomTypes(LoomTypeId)
);

-- Job Card Beam Details
CREATE TABLE JobCardBeams (
    JobCardBeamId INT IDENTITY(1,1) PRIMARY KEY,
    JobCardId INT NOT NULL,
    BeamNo NVARCHAR(50),
    GrossWeight DECIMAL(18,3),
    TareWeight DECIMAL(18,3),
    NetWeight AS (GrossWeight - TareWeight) PERSISTED,
    Breaks INT,
    Meter DECIMAL(12,2),
    Pieces INT,
    ClothMetres DECIMAL(12,2),
    ReadingMetres DECIMAL(12,2),
    TimeStart TIME,
    TimeFinish TIME,
    Sizer NVARCHAR(100),
    BackSizer NVARCHAR(100),
    PickUps NVARCHAR(50),
    VendorName NVARCHAR(200),
    SizingComb NVARCHAR(50),
    SizeBox NVARCHAR(50),
    WarpBeam NVARCHAR(50),
    Cylinder NVARCHAR(50),
    RPM DECIMAL(8,2),
    WarperName NVARCHAR(100),
    BeamCount NVARCHAR(50),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (JobCardId) REFERENCES JobCards(JobCardId)
);

-- Job Card Sizing Details
CREATE TABLE JobCardSizingDetails (
    SizingDetailId INT IDENTITY(1,1) PRIMARY KEY,
    JobCardId INT NOT NULL,
    No INT,
    Ends INT,
    GrossWeight DECIMAL(18,3),
    NetWeight DECIMAL(18,3),
    Breaks INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (JobCardId) REFERENCES JobCards(JobCardId)
);

-- Job Card Delivery Details
CREATE TABLE JobCardDeliveryDetails (
    DeliveryDetailId INT IDENTITY(1,1) PRIMARY KEY,
    JobCardId INT NOT NULL,
    No INT,
    BeamNo NVARCHAR(50),
    GrossWeight DECIMAL(18,3),
    TareWeight DECIMAL(18,3),
    NetWeight AS (GrossWeight - TareWeight) PERSISTED,
    Pieces INT,
    Metre DECIMAL(12,2),
    DcNo NVARCHAR(50),
    DeliveryTo NVARCHAR(200),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (JobCardId) REFERENCES JobCards(JobCardId)
);

-- Baby Cone Details
CREATE TABLE BabyConeDetails (
    BabyConeId INT IDENTITY(1,1) PRIMARY KEY,
    JobCardId INT NULL,
    YarnReceiptId INT NULL,
    YarnReturnId INT NULL,
    Bags INT,
    Cones INT,
    Weight DECIMAL(18,3),
    MaterialName NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (JobCardId) REFERENCES JobCards(JobCardId)
);

-- Yarn Stock Transactions
CREATE TABLE YarnStockTransactions (
    TransId INT IDENTITY(1,1) PRIMARY KEY,
    JobCardId INT NULL,
    YarnReceiptId INT NULL,
    YarnReturnId INT NULL,
    YarnDeliveryId INT NULL,
    Type NVARCHAR(20), -- IN, OUT, ADJUST
    QtyKg DECIMAL(18,3),
    BalanceKg DECIMAL(18,3),
    Notes NVARCHAR(400),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (JobCardId) REFERENCES JobCards(JobCardId)
);

-- Yarn Receipts
CREATE TABLE YarnReceipts (
    YarnReceiptId INT IDENTITY(1,1) PRIMARY KEY,
    ReceiptNo NVARCHAR(50) UNIQUE NOT NULL,
    ReceiptDate DATETIME NOT NULL,
    PdcNo NVARCHAR(50),
    CompanyId INT NOT NULL,
    PartyId INT NOT NULL,
    VehicleId INT NULL,
    TotalBags INT DEFAULT 0,
    TotalCones INT DEFAULT 0,
    TotalWeight DECIMAL(18,3) DEFAULT 0,
    ReceivedBy NVARCHAR(100),
    PreparedBy NVARCHAR(100),
    CheckedBy NVARCHAR(100),
    GMSign NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId)
);

-- Yarn Receipt Items
CREATE TABLE YarnReceiptItems (
    YarnReceiptItemId INT IDENTITY(1,1) PRIMARY KEY,
    YarnReceiptId INT NOT NULL,
    SNo INT,
    MillName NVARCHAR(200),
    LotNo NVARCHAR(50),
    Count NVARCHAR(50),
    Bags INT,
    Cones INT,
    WeightPerCone DECIMAL(8,3),
    Weight DECIMAL(18,3),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (YarnReceiptId) REFERENCES YarnReceipts(YarnReceiptId)
);

-- Yarn Returns
CREATE TABLE YarnReturns (
    YarnReturnId INT IDENTITY(1,1) PRIMARY KEY,
    DcNo NVARCHAR(50) UNIQUE NOT NULL,
    DcDate DATETIME NOT NULL,
    CompanyId INT NOT NULL,
    PartyId INT NOT NULL,
    VehicleId INT NULL,
    IsDirectDelivery BIT DEFAULT 0,
    TotalBags INT DEFAULT 0,
    TotalCones INT DEFAULT 0,
    TotalWeight DECIMAL(18,3) DEFAULT 0,
    Notes NVARCHAR(400),
    ReceiversSignature NVARCHAR(100),
    PreparedBy NVARCHAR(100),
    CheckedBy NVARCHAR(100),
    GMSign NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId)
);

-- Yarn Return Items
CREATE TABLE YarnReturnItems (
    YarnReturnItemId INT IDENTITY(1,1) PRIMARY KEY,
    YarnReturnId INT NOT NULL,
    Type NVARCHAR(50),
    SetNo NVARCHAR(50),
    MillName NVARCHAR(200),
    Count NVARCHAR(50),
    HSN NVARCHAR(50),
    Bags INT,
    Cones INT,
    Weight DECIMAL(18,3),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (YarnReturnId) REFERENCES YarnReturns(YarnReturnId)
);

-- Yarn Deliveries
CREATE TABLE YarnDeliveries (
    YarnDeliveryId INT IDENTITY(1,1) PRIMARY KEY,
    DcNo NVARCHAR(50) UNIQUE NOT NULL,
    Date DATE NOT NULL,
    CompanyId INT NOT NULL,
    PartyId INT NOT NULL,
    VehicleId INT NULL,
    TotalBags INT DEFAULT 0,
    TotalCones INT DEFAULT 0,
    TotalWeight DECIMAL(18,3) DEFAULT 0,
    TotalRate DECIMAL(18,2) DEFAULT 0,
    TotalAmount DECIMAL(18,2) DEFAULT 0,
    TaxableValue DECIMAL(18,2) DEFAULT 0,
    Notes NVARCHAR(400),
    ReceiverSign NVARCHAR(100),
    PreparedBy NVARCHAR(100),
    CheckedBy NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId)
);

-- Yarn Delivery Items
CREATE TABLE YarnDeliveryItems (
    YarnDeliveryItemId INT IDENTITY(1,1) PRIMARY KEY,
    YarnDeliveryId INT NOT NULL,
    No INT,
    Type NVARCHAR(50),
    MillName NVARCHAR(200),
    Count NVARCHAR(50),
    Bags INT,
    Cones INT,
    Weight DECIMAL(18,3),
    Rate DECIMAL(18,2),
    Amount DECIMAL(18,2),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (YarnDeliveryId) REFERENCES YarnDeliveries(YarnDeliveryId)
);

-- Tax Invoices
CREATE TABLE TaxInvoices (
    InvoiceId INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceNo NVARCHAR(50) UNIQUE NOT NULL,
    AckNo NVARCHAR(100),
    InvoiceDate DATE NOT NULL,
    AckDate DATE NULL,
    IRN NVARCHAR(200),
    ReverseCharge BIT DEFAULT 0,
    CompanyId INT NOT NULL,
    PartyId INT NOT NULL,
    DeliveredToPartyId INT NULL,
    SetNo NVARCHAR(50),
    Ends INT,
    Count NVARCHAR(50),
    Meters DECIMAL(12,2),
    TaxableAmount DECIMAL(18,2) DEFAULT 0,
    CGST DECIMAL(18,2) DEFAULT 0,
    SGST DECIMAL(18,2) DEFAULT 0,
    IGST DECIMAL(18,2) DEFAULT 0,
    RoundOff DECIMAL(18,2) DEFAULT 0,
    NetAmount DECIMAL(18,2) DEFAULT 0,
    AmountInWords NVARCHAR(500),
    PaymentTerms NVARCHAR(200),
    VehicleId INT NULL,
    DeliveryPlaceId INT NULL,
    Jurisdiction NVARCHAR(100),
    PreparedBy NVARCHAR(100),
    CheckedBy NVARCHAR(100),
    AuthorizedSignatory NVARCHAR(100),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    FOREIGN KEY (DeliveredToPartyId) REFERENCES Parties(PartyId),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId),
    FOREIGN KEY (DeliveryPlaceId) REFERENCES DeliveryPlaces(DeliveryPlaceId)
);

-- Tax Invoice Items
CREATE TABLE TaxInvoiceItems (
    InvoiceItemId INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceId INT NOT NULL,
    SNo INT,
    Description NVARCHAR(400),
    HSN_SAC NVARCHAR(50),
    Quantity DECIMAL(18,3),
    Rate DECIMAL(18,2),
    Amount DECIMAL(18,2),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (InvoiceId) REFERENCES TaxInvoices(InvoiceId)
);

-- Bank Details (for invoices)
CREATE TABLE InvoiceBankDetails (
    BankDetailId INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceId INT NOT NULL,
    AccountNo NVARCHAR(50),
    BankName NVARCHAR(150),
    Branch NVARCHAR(100),
    IFSC NVARCHAR(20),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (InvoiceId) REFERENCES TaxInvoices(InvoiceId)
);
```

### 4.3 Supporting Tables

```sql
-- Users and Roles
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) UNIQUE NOT NULL,
    Email NVARCHAR(150) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(256) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Phone NVARCHAR(50),
    RoleId INT,
    IsActive BIT DEFAULT 1,
    LastLogin DATETIME NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) UNIQUE NOT NULL,
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Audit Log
CREATE TABLE AuditLog (
    AuditId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    TableName NVARCHAR(100),
    Action NVARCHAR(20), -- INSERT, UPDATE, DELETE
    KeyValue NVARCHAR(200),
    OldValues NVARCHAR(MAX),
    NewValues NVARCHAR(MAX),
    IPAddress NVARCHAR(50),
    UserAgent NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- System Settings
CREATE TABLE SystemSettings (
    SettingId INT IDENTITY(1,1) PRIMARY KEY,
    SettingKey NVARCHAR(100) UNIQUE NOT NULL,
    SettingValue NVARCHAR(MAX),
    Description NVARCHAR(250),
    Category NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- GST API Configuration
CREATE TABLE GSTApiConfig (
    ConfigId INT IDENTITY(1,1) PRIMARY KEY,
    ProviderName NVARCHAR(100),
    ApiKey NVARCHAR(500),
    ApiUrl NVARCHAR(200),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);
```

### 4.4 Indexes for Performance

```sql
-- Indexes for frequently queried fields
CREATE INDEX IX_JobCards_SetNo ON JobCards(SetNo);
CREATE INDEX IX_JobCards_Date ON JobCards(Date);
CREATE INDEX IX_JobCards_PartyId ON JobCards(PartyId);
CREATE INDEX IX_JobCards_CompanyId ON JobCards(CompanyId);

CREATE INDEX IX_TaxInvoices_InvoiceNo ON TaxInvoices(InvoiceNo);
CREATE INDEX IX_TaxInvoices_InvoiceDate ON TaxInvoices(InvoiceDate);
CREATE INDEX IX_TaxInvoices_PartyId ON TaxInvoices(PartyId);
CREATE INDEX IX_TaxInvoices_CompanyId ON TaxInvoices(CompanyId);

CREATE INDEX IX_YarnReceipts_ReceiptNo ON YarnReceipts(ReceiptNo);
CREATE INDEX IX_YarnReceipts_ReceiptDate ON YarnReceipts(ReceiptDate);
CREATE INDEX IX_YarnReceipts_PartyId ON YarnReceipts(PartyId);

CREATE INDEX IX_YarnReturns_DcNo ON YarnReturns(DcNo);
CREATE INDEX IX_YarnReturns_DcDate ON YarnReturns(DcDate);
CREATE INDEX IX_YarnReturns_PartyId ON YarnReturns(PartyId);

CREATE INDEX IX_YarnDeliveries_DcNo ON YarnDeliveries(DcNo);
CREATE INDEX IX_YarnDeliveries_Date ON YarnDeliveries(Date);
CREATE INDEX IX_YarnDeliveries_PartyId ON YarnDeliveries(PartyId);

CREATE INDEX IX_Parties_GSTIN ON Parties(GSTIN);
CREATE INDEX IX_Companies_GSTIN ON Companies(GSTIN);

CREATE INDEX IX_Beams_BeamNo ON Beams(BeamNo);
CREATE INDEX IX_Beams_Status ON Beams(Status);

CREATE INDEX IX_Vehicles_VehicleNo ON Vehicles(VehicleNo);

CREATE INDEX IX_AuditLog_TableName ON AuditLog(TableName);
CREATE INDEX IX_AuditLog_CreatedAt ON AuditLog(CreatedAt);
```

### 4.5 Views for Reporting

```sql
-- View for Job Card Summary
CREATE VIEW V_JobCardSummary AS
SELECT 
    jc.SetNo,
    jc.Date,
    c.CompanyName,
    p.PartyName,
    lt.Name AS LoomType,
    jc.Count,
    jc.Ends,
    jc.WarpingMetres,
    jc.PickupPercentage,
    jc.ElongationPercentage,
    SUM(jcb.NetWeight) AS TotalNetWeight,
    COUNT(jcb.JobCardBeamId) AS NumberOfBeams
FROM JobCards jc
JOIN Companies c ON jc.CompanyId = c.CompanyId
JOIN Parties p ON jc.PartyId = p.PartyId
LEFT JOIN LoomTypes lt ON jc.LoomTypeId = lt.LoomTypeId
LEFT JOIN JobCardBeams jcb ON jc.JobCardId = jcb.JobCardId
GROUP BY jc.SetNo, jc.Date, c.CompanyName, p.PartyName, lt.Name, jc.Count, jc.Ends, jc.WarpingMetres, jc.PickupPercentage, jc.ElongationPercentage;

-- View for Invoice Summary
CREATE VIEW V_InvoiceSummary AS
SELECT 
    ti.InvoiceNo,
    ti.InvoiceDate,
    c.CompanyName,
    p.PartyName,
    ti.SetNo,
    ti.NetAmount,
    ti.TaxableAmount,
    ti.PaymentTerms,
    CASE 
        WHEN ti.InvoiceDate + ISNULL(NULLIF(p.DueDays, 0), 45) < GETDATE() THEN 'Overdue'
        ELSE 'Pending'
    END AS Status
FROM TaxInvoices ti
JOIN Companies c ON ti.CompanyId = c.CompanyId
JOIN Parties p ON ti.PartyId = p.PartyId;

-- View for Yarn Stock Position
CREATE VIEW V_YarnStockPosition AS
SELECT 
    p.PartyName,
    yrt.Type,
    SUM(yrt.QtyKg) AS TotalQuantity,
    SUM(yrt.BalanceKg) AS CurrentBalance
FROM YarnStockTransactions yrt
JOIN Parties p ON yrt.PartyId = p.PartyId
GROUP BY p.PartyName, yrt.Type;
```

## 5. Database Schema Recommendation

### 5.1 Key Design Principles

1. **Normalization**: Database follows 3NF to reduce redundancy
2. **Referential Integrity**: Foreign keys ensure data consistency
3. **Audit Trail**: Complete audit logging for all transactions
4. **Performance**: Strategic indexes on frequently queried columns
5. **Scalability**: Designed for growth with partitioning capabilities
6. **Data Integrity**: Computed columns for derived values (NetWeight)

### 5.2 Relationship Summary

```
Companies (1) → (N) Parties
Companies (1) → (N) DeliveryPlaces
Companies (1) → (N) Vehicles

Parties (1) → (N) JobCards
Parties (1) → (N) TaxInvoices
Parties (1) → (N) YarnReceipts
Parties (1) → (N) YarnReturns
Parties (1) → (N) YarnDeliveries
Parties (1) → (N) SizingCharges

JobCards (1) → (N) JobCardBeams
JobCards (1) → (N) JobCardSizingDetails
JobCards (1) → (N) JobCardDeliveryDetails
JobCards (1) → (N) BabyConeDetails

TaxInvoices (1) → (N) TaxInvoiceItems
YarnReceipts (1) → (N) YarnReceiptItems
YarnReturns (1) → (N) YarnReturnItems
YarnDeliveries (1) → (N) YarnDeliveryItems
```

### 5.3 Data Migration Strategy

1. **Phase 1**: Create master data tables and import existing companies/parties
2. **Phase 2**: Migrate historical job cards and invoices
3. **Phase 3**: Import yarn transaction data
4. **Phase 4**: Set up stock positions and balances

### 5.4 Backup and Recovery

- **Full Backups**: Daily during off-peak hours
- **Transaction Log Backups**: Every 15 minutes during business hours
- **Point-in-Time Recovery**: Supported through transaction logs
- **Off-site Storage**: Critical backups stored on NAS as specified