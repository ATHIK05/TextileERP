-- Complete SMART ERP Database Schema for Orange Sizing Unit
-- SQL Server Compatible Schema

-- ========================================
-- 1. COMPANIES TABLE
-- ========================================
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
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT CK_Companies_GSTIN CHECK (LEN(GSTIN) = 15),
    CONSTRAINT CK_Companies_PAN CHECK (PAN IS NULL OR LEN(PAN) = 10)
);

-- ========================================
-- 2. LEDGER TYPES TABLE
-- ========================================
CREATE TABLE LedgerTypes (
    LedgerTypeId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Insert all 18 ledger types as specified
INSERT INTO LedgerTypes (Name, Description) VALUES
('View/edit', 'View/edit ledger type'),
('Account', 'Account ledger type'),
('Agent', 'Agent ledger type'),
('Bank account AC', 'Bank account ledger type'),
('Buyer', 'Buyer ledger type'),
('Customer', 'Customer ledger type'),
('Others', 'Others ledger type'),
('Cash account', 'Cash account ledger type'),
('Processing', 'Processing ledger type'),
('Purchase ac', 'Purchase account ledger type'),
('Sales account', 'Sales account ledger type'),
('Sizing Vendor', 'Sizing vendor ledger type'),
('Supplier', 'Supplier ledger type'),
('Supplier store', 'Supplier store ledger type'),
('Tax', 'Tax ledger type'),
('Transport', 'Transport ledger type'),
('Warehouse', 'Warehouse ledger type'),
('Weaving vendor', 'Weaving vendor ledger type');

-- ========================================
-- 3. ACCOUNT GROUPS TABLE
-- ========================================
CREATE TABLE AccountGroups (
    AccountGroupId INT IDENTITY(1,1) PRIMARY KEY,
    GroupName NVARCHAR(150) NOT NULL,
    ParentGroupId INT NULL,
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_AccountGroups_Parent FOREIGN KEY (ParentGroupId) REFERENCES AccountGroups(AccountGroupId)
);

-- Insert default account groups
INSERT INTO AccountGroups (GroupName, Description) VALUES
('Sunday Creation', 'Sunday creation account group'),
('Primary', 'Primary account group'),
('Secondary', 'Secondary account group'),
('Sundry', 'Sundry account group');

-- ========================================
-- 4. PARTIES TABLE
-- ========================================
CREATE TABLE Parties (
    PartyId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL,
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
    LedgerTypeId INT NULL,
    AccountGroupId INT NULL,
    AccountMaintenance NVARCHAR(50), -- 'Balance Only' or 'Bill to Bill'
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Parties_Company FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    CONSTRAINT FK_Parties_LedgerType FOREIGN KEY (LedgerTypeId) REFERENCES LedgerTypes(LedgerTypeId),
    CONSTRAINT FK_Parties_AccountGroup FOREIGN KEY (AccountGroupId) REFERENCES AccountGroups(AccountGroupId),
    CONSTRAINT CK_Parties_GSTIN CHECK (GSTIN IS NULL OR LEN(GSTIN) = 15),
    CONSTRAINT CK_Parties_PAN CHECK (PAN IS NULL OR LEN(PAN) = 10),
    CONSTRAINT CK_Parties_AccountMaintenance CHECK (AccountMaintenance IN ('Balance Only', 'Bill to Bill'))
);

-- ========================================
-- 5. DELIVERY PLACES TABLE
-- ========================================
CREATE TABLE DeliveryPlaces (
    DeliveryPlaceId INT IDENTITY(1,1) PRIMARY KEY,
    CompanyId INT NOT NULL,
    PlaceName NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500),
    Contact NVARCHAR(100),
    Phone NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_DeliveryPlaces_Company FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId)
);

-- ========================================
-- 6. COUNTS TABLE
-- ========================================
CREATE TABLE Counts (
    CountId INT IDENTITY(1,1) PRIMARY KEY,
    CountNumber NVARCHAR(50) UNIQUE NOT NULL,
    CountName NVARCHAR(100),
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- ========================================
-- 7. ENDS TABLE
-- ========================================
CREATE TABLE Ends (
    EndId INT IDENTITY(1,1) PRIMARY KEY,
    EndNumber INT NOT NULL,
    CountId INT NOT NULL,
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Ends_Count FOREIGN KEY (CountId) REFERENCES Counts(CountId)
);

-- ========================================
-- 8. UNITS TABLE
-- ========================================
CREATE TABLE Units (
    UnitId INT IDENTITY(1,1) PRIMARY KEY,
    UnitName NVARCHAR(50) NOT NULL,
    UnitSymbol NVARCHAR(20),
    Description NVARCHAR(200),
    UnitType NVARCHAR(50), -- 'Weight', 'Length', 'Count', etc.
    ConversionFactor DECIMAL(18,4), -- Base unit conversion
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT CK_Units_UnitType CHECK (UnitType IN ('Weight', 'Length', 'Count', 'Volume', 'Area'))
);

-- Insert standard units
INSERT INTO Units (UnitName, UnitSymbol, Description, UnitType, ConversionFactor) VALUES
('Kilogram', 'kg', 'Weight measurement', 'Weight', 1.0000),
('Gram', 'g', 'Weight measurement', 'Weight', 0.0010),
('Meter', 'm', 'Length measurement', 'Length', 1.0000),
('Centimeter', 'cm', 'Length measurement', 'Length', 0.0100),
('Number', 'Nos', 'Count measurement', 'Count', 1.0000),
('Box', 'Box', 'Container measurement', 'Count', 1.0000),
('Bag', 'Bag', 'Container measurement', 'Count', 1.0000),
('Cone', 'Cone', 'Container measurement', 'Count', 1.0000);

-- ========================================
-- 9. TAXES TABLE
-- ========================================
CREATE TABLE Taxes (
    TaxId INT IDENTITY(1,1) PRIMARY KEY,
    TaxName NVARCHAR(50) NOT NULL,
    Rate DECIMAL(5,2) NOT NULL,
    TaxType NVARCHAR(20), -- 'CGST', 'SGST', 'IGST'
    IsActive BIT DEFAULT 1,
    EffectiveFrom DATETIME NOT NULL,
    EffectiveTo DATETIME NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT CK_Taxes_TaxType CHECK (TaxType IN ('CGST', 'SGST', 'IGST')),
    CONSTRAINT CK_Taxes_Rate CHECK (Rate > 0 AND Rate <= 100)
);

-- Insert standard tax rates
INSERT INTO Taxes (TaxName, Rate, TaxType, EffectiveFrom) VALUES
('CGST 2.5%', 2.50, 'CGST', '2024-01-01'),
('SGST 2.5%', 2.50, 'SGST', '2024-01-01'),
('IGST 5%', 5.00, 'IGST', '2024-01-01'),
('GST 12%', 12.00, 'IGST', '2024-01-01'),
('GST 18%', 18.00, 'IGST', '2024-01-01');

-- ========================================
-- 10. LOOM TYPES TABLE
-- ========================================
CREATE TABLE LoomTypes (
    LoomTypeId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(250),
    ChargePerBeam DECIMAL(18,2) NULL,
    ChargePerKg DECIMAL(18,2) NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT CK_LoomTypes_Charge CHECK (ChargePerBeam IS NULL OR ChargePerBeam > 0),
    CONSTRAINT CK_LoomTypes_ChargeKg CHECK (ChargePerKg IS NULL OR ChargePerKg > 0)
);

-- Insert standard loom types
INSERT INTO LoomTypes (Name, Description, ChargePerBeam, ChargePerKg) VALUES
('SULZER', 'Sulzer loom type', 50.00, 2.50),
('AIRJET', 'Airjet loom type', 45.00, 2.00),
('RAPPER', 'Rapper loom type', 40.00, 1.80),
('PROJECTILE', 'Projectile loom type', 55.00, 2.80),
('SHUTTLE', 'Shuttle loom type', 35.00, 1.50),
('WATERJET', 'Waterjet loom type', 60.00, 3.00);

-- ========================================
-- 11. VEHICLES TABLE
-- ========================================
CREATE TABLE Vehicles (
    VehicleId INT IDENTITY(1,1) PRIMARY KEY,
    VehicleNo NVARCHAR(50) UNIQUE NOT NULL,
    VehicleType NVARCHAR(50),
    DriverName NVARCHAR(100),
    DriverPhone NVARCHAR(50),
    DriverLicense NVARCHAR(50),
    CompanyId INT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Vehicles_Company FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId)
);

-- ========================================
-- 12. BEAMS TABLE
-- ========================================
CREATE TABLE Beams (
    BeamId INT IDENTITY(1,1) PRIMARY KEY,
    BeamNo NVARCHAR(50) UNIQUE NOT NULL,
    GrossWeight DECIMAL(18,3) NOT NULL,
    TareWeight DECIMAL(18,3) NOT NULL,
    YarnWeight AS (GrossWeight - TareWeight) PERSISTED,
    Status NVARCHAR(50) DEFAULT 'IN', -- IN, OUT, MAINTENANCE
    CurrentLocation NVARCHAR(100),
    LastUsedDate DATETIME2 NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT CK_Beams_Weight CHECK (GrossWeight > 0 AND TareWeight > 0 AND GrossWeight > TareWeight),
    CONSTRAINT CK_Beams_Status CHECK (Status IN ('IN', 'OUT', 'MAINTENANCE'))
);

-- ========================================
-- 13. SIZING CHARGES TABLE
-- ========================================
CREATE TABLE SizingCharges (
    SizingChargeId INT IDENTITY(1,1) PRIMARY KEY,
    PartyId INT NOT NULL,
    ChargePerKg DECIMAL(18,2) NOT NULL,
    ChargePerBeam DECIMAL(18,2) NULL,
    EffectiveFrom DATETIME NOT NULL,
    EffectiveTo DATETIME NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_SizingCharges_Party FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    CONSTRAINT CK_SizingCharges_Charge CHECK (ChargePerKg > 0),
    CONSTRAINT CK_SizingCharges_ChargeBeam CHECK (ChargePerBeam IS NULL OR ChargePerBeam > 0),
    CONSTRAINT CK_SizingCharges_DateRange CHECK (EffectiveTo IS NULL OR EffectiveTo > EffectiveFrom)
);

-- ========================================
-- 14. JOB CARDS TABLE
-- ========================================
CREATE TABLE JobCards (
    JobCardId INT IDENTITY(1,1) PRIMARY KEY,
    SetNo NVARCHAR(50) UNIQUE NOT NULL,
    Date DATETIME NOT NULL,
    CompanyId INT NOT NULL,
    PartyId INT NOT NULL,
    LoomTypeId INT NULL,
    MillName NVARCHAR(200),
    Count NVARCHAR(50),
    Ends INT NULL,
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
    CardType NVARCHAR(20) DEFAULT 'SIZING', -- SIZING or WARPING
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_JobCards_Company FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    CONSTRAINT FK_JobCards_Party FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    CONSTRAINT FK_JobCards_LoomType FOREIGN KEY (LoomTypeId) REFERENCES LoomTypes(LoomTypeId),
    CONSTRAINT CK_JobCards_CardType CHECK (CardType IN ('SIZING', 'WARPING')),
    CONSTRAINT CK_JobCards_Pickup CHECK (PickupPercentage >= 0),
    CONSTRAINT CK_JobCards_Elongation CHECK (ElongationPercentage >= 0)
);

-- ========================================
-- 15. JOB CARD BEAM DETAILS TABLE
-- ========================================
CREATE TABLE JobCardBeamDetails (
    JobCardBeamId INT IDENTITY(1,1) PRIMARY KEY,
    JobCardId INT NOT NULL,
    BeamNo NVARCHAR(50),
    GrossWeight DECIMAL(18,3),
    TareWeight DECIMAL(18,3),
    NetWeight AS (GrossWeight - TareWeight) PERSISTED,
    Breaks INT DEFAULT 0,
    Meter DECIMAL(12,2),
    Pieces INT DEFAULT 0,
    ClothMetres DECIMAL(12,2),
    ReadingMetres DECIMAL(12,2),
    TimeStart TIME NULL,
    TimeFinish TIME NULL,
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
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_JobCardBeamDetails_JobCard FOREIGN KEY (JobCardId) REFERENCES JobCards(JobCardId),
    CONSTRAINT CK_JobCardBeamDetails_Weight CHECK (GrossWeight > 0 AND TareWeight > 0 AND GrossWeight > TareWeight),
    CONSTRAINT CK_JobCardBeamDetails_Breaks CHECK (Breaks >= 0)
);

-- ========================================
-- 16. YARN STOCK TRANSACTIONS TABLE
-- ========================================
CREATE TABLE YarnStockTransactions (
    TransId BIGINT IDENTITY(1,1) PRIMARY KEY,
    JobCardId INT NULL,
    YarnReceiptId INT NULL,
    YarnReturnId INT NULL,
    YarnDeliveryId INT NULL,
    Type NVARCHAR(20) NOT NULL, -- IN, OUT, ADJUST
    QtyKg DECIMAL(18,3),
    BalanceKg DECIMAL(18,3),
    Notes NVARCHAR(400),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_YarnStockTransactions_JobCard FOREIGN KEY (JobCardId) REFERENCES JobCards(JobCardId),
    CONSTRAINT CK_YarnStockTransactions_Type CHECK (Type IN ('IN', 'OUT', 'ADJUST'))
);

-- ========================================
-- 17. YARN RECEIPTS TABLE
-- ========================================
CREATE TABLE YarnReceipts (
    YarnReceiptId INT IDENTITY(1,1) PRIMARY KEY,
    ReceiptNo NVARCHAR(50) UNIQUE NOT NULL,
    ReceiptDate DATETIME NOT NULL,
    PDCNo NVARCHAR(50),
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
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_YarnReceipts_Company FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    CONSTRAINT FK_YarnReceipts_Party FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    CONSTRAINT FK_YarnReceipts_Vehicle FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId)
);

-- ========================================
-- 18. YARN RECEIPT ITEMS TABLE
-- ========================================
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
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_YarnReceiptItems_YarnReceipt FOREIGN KEY (YarnReceiptId) REFERENCES YarnReceipts(YarnReceiptId),
    CONSTRAINT CK_YarnReceiptItems_Weight CHECK (Weight > 0)
);

-- ========================================
-- 19. YARN RETURNS TABLE
-- ========================================
CREATE TABLE YarnReturns (
    YarnReturnId INT IDENTITY(1,1) PRIMARY KEY,
    DCNo NVARCHAR(50) UNIQUE NOT NULL,
    DCDate DATETIME NOT NULL,
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
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_YarnReturns_Company FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    CONSTRAINT FK_YarnReturns_Party FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    CONSTRAINT FK_YarnReturns_Vehicle FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId)
);

-- ========================================
-- 20. YARN RETURN ITEMS TABLE
-- ========================================
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
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_YarnReturnItems_YarnReturn FOREIGN KEY (YarnReturnId) REFERENCES YarnReturns(YarnReturnId),
    CONSTRAINT CK_YarnReturnItems_Weight CHECK (Weight > 0)
);

-- ========================================
-- 21. YARN DELIVERIES TABLE
-- ========================================
CREATE TABLE YarnDeliveries (
    YarnDeliveryId INT IDENTITY(1,1) PRIMARY KEY,
    DCNo NVARCHAR(50) UNIQUE NOT NULL,
    Date DATETIME NOT NULL,
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
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_YarnDeliveries_Company FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    CONSTRAINT FK_YarnDeliveries_Party FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    CONSTRAINT FK_YarnDeliveries_Vehicle FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId)
);

-- ========================================
-- 22. YARN DELIVERY ITEMS TABLE
-- ========================================
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
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_YarnDeliveryItems_YarnDelivery FOREIGN KEY (YarnDeliveryId) REFERENCES YarnDeliveries(YarnDeliveryId),
    CONSTRAINT CK_YarnDeliveryItems_Amount CHECK (Amount > 0)
);

-- ========================================
-- 23. TAX INVOICES TABLE
-- ========================================
CREATE TABLE TaxInvoices (
    InvoiceId INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceNo NVARCHAR(50) UNIQUE NOT NULL,
    AckNo NVARCHAR(100),
    InvoiceDate DATETIME NOT NULL,
    AckDate DATETIME NULL,
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
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_TaxInvoices_Company FOREIGN KEY (CompanyId) REFERENCES Companies(CompanyId),
    CONSTRAINT FK_TaxInvoices_Party FOREIGN KEY (PartyId) REFERENCES Parties(PartyId),
    CONSTRAINT FK_TaxInvoices_DeliveredToParty FOREIGN KEY (DeliveredToPartyId) REFERENCES Parties(PartyId),
    CONSTRAINT FK_TaxInvoices_Vehicle FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId),
    CONSTRAINT FK_TaxInvoices_DeliveryPlace FOREIGN KEY (DeliveryPlaceId) REFERENCES DeliveryPlaces(DeliveryPlaceId),
    CONSTRAINT CK_TaxInvoices_Amount CHECK (NetAmount >= 0),
    CONSTRAINT CK_TaxInvoices_Taxable CHECK (TaxableAmount >= 0)
);

-- ========================================
-- 24. TAX INVOICE ITEMS TABLE
-- ========================================
CREATE TABLE TaxInvoiceItems (
    InvoiceItemId INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceId INT NOT NULL,
    SNo INT,
    Description NVARCHAR(400),
    HSN_SAC NVARCHAR(50),
    Quantity DECIMAL(18,3),
    Rate DECIMAL(18,2),
    Amount DECIMAL(18,2),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_TaxInvoiceItems_Invoice FOREIGN KEY (InvoiceId) REFERENCES TaxInvoices(InvoiceId),
    CONSTRAINT CK_TaxInvoiceItems_Amount CHECK (Amount > 0),
    CONSTRAINT CK_TaxInvoiceItems_Rate CHECK (Rate > 0),
    CONSTRAINT CK_TaxInvoiceItems_Quantity CHECK (Quantity > 0)
);

-- ========================================
-- 25. USERS TABLE
-- ========================================
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(100) UNIQUE NOT NULL,
    Email NVARCHAR(150) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(256) NOT NULL,
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Phone NVARCHAR(50),
    RoleId INT NULL,
    IsActive BIT DEFAULT 1,
    LastLogin DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT CK_Users_Email CHECK (Email LIKE '%@%')
);

-- ========================================
-- 26. ROLES TABLE
-- ========================================
CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) UNIQUE NOT NULL,
    Description NVARCHAR(250),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Insert default roles
INSERT INTO Roles (RoleName, Description) VALUES
('Administrator', 'Full system access'),
('Accountant', 'Financial operations access'),
('Operator', 'Day-to-day operations access'),
('Manager', 'Management access'),
('Auditor', 'Read-only access for auditing');

-- ========================================
-- 27. AUDIT LOG TABLE
-- ========================================
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
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_AuditLog_User FOREIGN KEY (UserId) REFERENCES Users(UserId),
    CONSTRAINT CK_AuditLog_Action CHECK (Action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- ========================================
-- 28. SYSTEM SETTINGS TABLE
-- ========================================
CREATE TABLE SystemSettings (
    SettingId INT IDENTITY(1,1) PRIMARY KEY,
    SettingKey NVARCHAR(100) UNIQUE NOT NULL,
    SettingValue NVARCHAR(MAX),
    Description NVARCHAR(250),
    Category NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- ========================================
-- 29. GST API CONFIG TABLE
-- ========================================
CREATE TABLE GSTApiConfig (
    ConfigId INT IDENTITY(1,1) PRIMARY KEY,
    ProviderName NVARCHAR(100),
    ApiKey NVARCHAR(500),
    ApiUrl NVARCHAR(200),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

-- ========================================
-- 30. BABY CONE DETAILS TABLE
-- ========================================
CREATE TABLE BabyConeDetails (
    BabyConeId INT IDENTITY(1,1) PRIMARY KEY,
    JobCardId INT NULL,
    YarnReceiptId INT NULL,
    YarnReturnId INT NULL,
    YarnDeliveryId INT NULL,
    Bags INT,
    Cones INT,
    Weight DECIMAL(18,3),
    MaterialName NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_BabyConeDetails_JobCard FOREIGN KEY (JobCardId) REFERENCES JobCards(JobCardId),
    CONSTRAINT FK_BabyConeDetails_YarnReceipt FOREIGN KEY (YarnReceiptId) REFERENCES YarnReceipts(YarnReceiptId),
    CONSTRAINT FK_BabyConeDetails_YarnReturn FOREIGN KEY (YarnReturnId) REFERENCES YarnReturns(YarnReturnId),
    CONSTRAINT FK_BabyConeDetails_YarnDelivery FOREIGN KEY (YarnDeliveryId) REFERENCES YarnDeliveries(YarnDeliveryId),
    CONSTRAINT CK_BabyConeDetails_Weight CHECK (Weight > 0)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
-- Companies
CREATE INDEX IX_Companies_GSTIN ON Companies(GSTIN);
CREATE INDEX IX_Companies_Name ON Companies(CompanyName);
CREATE INDEX IX_Companies_IsActive ON Companies(IsActive);

-- Parties
CREATE INDEX IX_Parties_GSTIN ON Parties(GSTIN);
CREATE INDEX IX_Parties_PartyName ON Parties(PartyName);
CREATE INDEX IX_Parties_CompanyId ON Parties(CompanyId);
CREATE INDEX IX_Parties_IsActive ON Parties(IsActive);

-- JobCards
CREATE INDEX IX_JobCards_SetNo ON JobCards(SetNo);
CREATE INDEX IX_JobCards_Date ON JobCards(Date);
CREATE INDEX IX_JobCards_PartyId ON JobCards(PartyId);
CREATE INDEX IX_JobCards_CompanyId ON JobCards(CompanyId);
CREATE INDEX IX_JobCards_CardType ON JobCards(CardType);

-- TaxInvoices
CREATE INDEX IX_TaxInvoices_InvoiceNo ON TaxInvoices(InvoiceNo);
CREATE INDEX IX_TaxInvoices_InvoiceDate ON TaxInvoices(InvoiceDate);
CREATE INDEX IX_TaxInvoices_PartyId ON TaxInvoices(PartyId);
CREATE INDEX IX_TaxInvoices_CompanyId ON TaxInvoices(CompanyId);
CREATE INDEX IX_TaxInvoices_SetNo ON TaxInvoices(SetNo);

-- Yarn Transactions
CREATE INDEX IX_YarnReceipts_ReceiptNo ON YarnReceipts(ReceiptNo);
CREATE INDEX IX_YarnReceipts_Date ON YarnReceipts(ReceiptDate);
CREATE INDEX IX_YarnReturns_DCNo ON YarnReturns(DCNo);
CREATE INDEX IX_YarnReturns_Date ON YarnReturns(DCDate);
CREATE INDEX IX_YarnDeliveries_DCNo ON YarnDeliveries(DCNo);
CREATE INDEX IX_YarnDeliveries_Date ON YarnDeliveries(Date);

-- Audit Log
CREATE INDEX IX_AuditLog_TableName ON AuditLog(TableName);
CREATE INDEX IX_AuditLog_CreatedAt ON AuditLog(CreatedAt);
CREATE INDEX IX_AuditLog_UserId ON AuditLog(UserId);

-- Beams
CREATE INDEX IX_Beams_BeamNo ON Beams(BeamNo);
CREATE INDEX IX_Beams_Status ON Beams(Status);
CREATE INDEX IX_Beams_IsActive ON Beams(IsActive);

-- Vehicles
CREATE INDEX IX_Vehicles_VehicleNo ON Vehicles(VehicleNo);
CREATE INDEX IX_Vehicles_CompanyId ON Vehicles(CompanyId);
CREATE INDEX IX_Vehicles_IsActive ON Vehicles(IsActive);

-- ========================================
-- STORED PROCEDURES FOR BUSINESS LOGIC
-- ========================================

-- Generate Invoice Number
CREATE PROCEDURE sp_GenerateInvoiceNumber
    @CompanyId INT,
    @InvoiceNo NVARCHAR(50) OUTPUT
AS
BEGIN
    DECLARE @Prefix NVARCHAR(20) = 'SZ'
    DECLARE @FinancialYear NVARCHAR(10) = FORMAT(GETDATE(), 'yy') + '-' + FORMAT(DATEADD(YEAR, 1, GETDATE()), 'yy')
    DECLARE @Sequence INT
    
    SELECT @Sequence = ISNULL(MAX(CAST(SUBSTRING(InvoiceNo, CHARINDEX('/', InvoiceNo) + 1, 4) AS INT)), 0) + 1
    FROM TaxInvoices 
    WHERE CompanyId = @CompanyId 
    AND InvoiceNo LIKE @Prefix + '%/' + @FinancialYear
    
    SET @InvoiceNo = @Prefix + RIGHT('000' + CAST(@Sequence AS NVARCHAR), 4) + '/' + @FinancialYear
END;

-- Calculate Sizing Charges
CREATE PROCEDURE sp_CalculateSizingCharges
    @PartyId INT,
    @NetWeight DECIMAL(18,3),
    @ChargePerKg DECIMAL(18,2) OUTPUT,
    @TotalCharge DECIMAL(18,2) OUTPUT
AS
BEGIN
    SELECT TOP 1 @ChargePerKg = ChargePerKg 
    FROM SizingCharges 
    WHERE PartyId = @PartyId 
    AND EffectiveFrom <= GETDATE()
    AND (EffectiveTo IS NULL OR EffectiveTo >= GETDATE())
    AND IsActive = 1
    ORDER BY EffectiveFrom DESC
    
    IF @ChargePerKg IS NULL
        SET @ChargePerKg = 0
    
    SET @TotalCharge = @NetWeight * @ChargePerKg
END;

-- Update Yarn Stock Balance
CREATE PROCEDURE sp_UpdateYarnStockBalance
    @PartyId INT,
    @TransactionType NVARCHAR(20), -- IN, OUT, ADJUST
    @Quantity DECIMAL(18,3),
    @Notes NVARCHAR(400)
AS
BEGIN
    DECLARE @CurrentBalance DECIMAL(18,3)
    DECLARE @NewBalance DECIMAL(18,3)
    
    -- Get current balance for party
    SELECT TOP 1 @CurrentBalance = BalanceKg
    FROM YarnStockTransactions 
    WHERE PartyId = @PartyId
    ORDER BY CreatedAt DESC
    
    IF @CurrentBalance IS NULL
        SET @CurrentBalance = 0
    
    -- Calculate new balance
    IF @TransactionType = 'IN'
        SET @NewBalance = @CurrentBalance + @Quantity
    ELSE IF @TransactionType = 'OUT'
        SET @NewBalance = @CurrentBalance - @Quantity
    ELSE
        SET @NewBalance = @Quantity
    
    -- Insert transaction record
    INSERT INTO YarnStockTransactions (Type, QtyKg, BalanceKg, Notes)
    VALUES (@TransactionType, @Quantity, @NewBalance, @Notes)
END;

-- Get Party Outstanding
CREATE PROCEDURE sp_GetPartyOutstanding
    @PartyId INT
AS
BEGIN
    SELECT 
        p.PartyName,
        p.GSTIN,
        SUM(i.NetAmount) AS TotalAmount,
        SUM(CASE WHEN i.InvoiceDate + ISNULL(p.DueDays, 45) < GETDATE() THEN i.NetAmount ELSE 0 END) AS OverdueAmount,
        COUNT(i.InvoiceId) AS TotalInvoices,
        COUNT(CASE WHEN i.InvoiceDate + ISNULL(p.DueDays, 45) < GETDATE() THEN 1 ELSE 0 END) AS OverdueInvoices
    FROM Parties p
    LEFT JOIN TaxInvoices i ON p.PartyId = i.PartyId AND i.IsActive = 1
    WHERE p.PartyId = @PartyId AND p.IsActive = 1
    GROUP BY p.PartyName, p.GSTIN, p.DueDays
END;

-- ========================================
-- TRIGGERS FOR AUDIT TRAIL
-- ========================================

-- Audit trigger for Companies
CREATE TRIGGER TR_Companies_Audit
ON Companies
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (SELECT * FROM inserted)
    BEGIN
        INSERT INTO AuditLog (TableName, Action, KeyValue, NewValues)
        SELECT 'Companies', 'INSERT', CAST(INSERTED.CompanyId AS NVARCHAR), 
               'CompanyId=' + CAST(INSERTED.CompanyId AS NVARCHAR) + 
               ',CompanyName=' + ISNULL('''' + INSERTED.CompanyName + '''', 'NULL') +
               ',GSTIN=' + ISNULL('''' + INSERTED.GSTIN + '''', 'NULL')
        FROM inserted;
    END
    
    IF EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLog (TableName, Action, KeyValue, OldValues)
        SELECT 'Companies', 'DELETE', CAST(DELETED.CompanyId AS NVARCHAR),
               'CompanyId=' + CAST(DELETED.CompanyId AS NVARCHAR) + 
               ',CompanyName=' + ISNULL('''' + DELETED.CompanyName + '''', 'NULL') +
               ',GSTIN=' + ISNULL('''' + DELETED.GSTIN + '''', 'NULL')
        FROM deleted;
    END
    
    IF EXISTS (SELECT * FROM inserted) AND EXISTS (SELECT * FROM deleted)
    BEGIN
        INSERT INTO AuditLog (TableName, Action, KeyValue, OldValues, NewValues)
        SELECT 'Companies', 'UPDATE', CAST(INSERTED.CompanyId AS NVARCHAR),
               'CompanyId=' + CAST(DELETED.CompanyId AS NVARCHAR) + 
               ',CompanyName=' + ISNULL('''' + DELETED.CompanyName + '''', 'NULL') +
               ',GSTIN=' + ISNULL('''' + DELETED.GSTIN + '''', 'NULL'),
               'CompanyId=' + CAST(INSERTED.CompanyId AS NVARCHAR) + 
               ',CompanyName=' + ISNULL('''' + INSERTED.CompanyName + '''', 'NULL') +
               ',GSTIN=' + ISNULL('''' + INSERTED.GSTIN + '''', 'NULL')
        FROM inserted, deleted;
    END
    
    SET NOCOUNT OFF;
END;

-- Similar audit triggers can be created for other critical tables...