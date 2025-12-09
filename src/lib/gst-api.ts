// GST API Integration Service
// This service integrates with GST API to fetch company details automatically

export interface GSTDetails {
  tradeNam?: string;        // Trade Name
  lgnm?: string;            // Legal Name
  stj?: string;             // State Jurisdiction
  stcd?: string;            // State Code (numeric)
  addr?: {
    bnm?: string;           // Building Number
    st?: string;            // Street
    loc?: string;           // Location
    city?: string;          // City
    dst?: string;           // District
    pincode?: string;       // PIN Code
    stcd?: string;          // State Code
  };
  nba?: string[];           // Nature of Business Activities
  ctin?: string;            // Constitution
  cxdt?: string;            // Date of Constitution
  rgdt?: string;            // Date of Registration
  efbdt?: string;           // Date of Effect from
  gstin?: string;           // GSTIN
  dty?: string;             // Domain Type
  psta?: string;            // State PAN Status
  sts?: string;             // Status
  updt?: string;            // Last Updated
  bl?: string;              // Block Level
  geofenced?: boolean;      // Geofenced
  lstupdt?: string;         // Last Updated
  currcode?: string;        // Currency Code
  rjcd?: string;            // Return Jurisdiction Code
  lgnmDtls?: {
    llgNm?: string;         // Long Legal Name
    llgNmDtls?: {
      orgNm?: string;       // Organization Name
      mnm?: string;         // Middle Name
      flnmN?: string;       // First Name
      lnm?: string;         // Last Name
    };
  };
}

export interface GSTValidationResult {
  isValid: boolean;
  gstin?: string;
  error?: string;
}

class GSTAPIService {
  private apiKey: string;
  private apiUrl: string;
  private provider: string;

  constructor() {
    // Load GST API configuration from database or environment
    this.apiKey = process.env.GST_API_KEY || '';
    this.apiUrl = process.env.GST_API_URL || 'https://api.mastergst.com';
    this.provider = process.env.GST_API_PROVIDER || 'mastergst';
  }

  /**
   * Validate GSTIN format
   */
  validateGSTIN(gstin: string): GSTValidationResult {
    // Remove spaces and convert to uppercase
    const cleanGSTIN = gstin.replace(/\s/g, '').toUpperCase();

    // GSTIN validation regex (15 characters: 2 digits + 1 letter + 4 digits + 1 letter + 1 digit + 1 letter + 1 digit + 1 letter)
    const gstinRegex = /^[0-9]{2}[A-Z]{3}[ABCFGHLJPT][A-Z]{1}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[A-Z]{1}[0-9]{1}$/;

    if (!gstinRegex.test(cleanGSTIN)) {
      return {
        isValid: false,
        error: 'Invalid GSTIN format. GSTIN should be 15 characters in the format: 2 digits + 1 letter + 4 digits + 1 letter + 1 digit + 1 letter + 1 digit + 1 letter + 1 digit + 1 letter'
      };
    }

    return {
      isValid: true,
      gstin: cleanGSTIN
    };
  }

  /**
   * Fetch GST details for a given GSTIN
   */
  async fetchGSTDetails(gstin: string): Promise<GSTDetails | null> {
    try {
      // First validate GSTIN format
      const validation = this.validateGSTIN(gstin);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid GSTIN format');
      }

      const validGSTIN = validation.gstin!;

      // Prepare request based on provider
      let url: string;
      let headers: Record<string, string>;

      if (this.provider === 'mastergst') {
        url = `${this.apiUrl}/common/gstininfo`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Api-Key': this.apiKey,
        };
      } else if (this.provider === 'gstportal') {
        url = `${this.apiUrl}/search/gstin`;
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        };
      } else {
        throw new Error(`Unsupported GST API provider: ${this.provider}`);
      }

      const requestBody = {
        gstin: validGSTIN,
        // Add other required fields based on provider
        ...(this.provider === 'mastergst' && {
          sec_key: this.apiKey,
        }),
      };

      console.log(`Fetching GST details for: ${validGSTIN}`);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GST API Error: ${response.status} - ${errorText}`);
        throw new Error(`GST API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('GST API Response:', data);

      // Parse response based on provider
      let gstDetails: GSTDetails | null = null;

      if (this.provider === 'mastergst') {
        if (data.success && data.data) {
          gstDetails = {
            tradeNam: data.data.tradeNam,
            lgnm: data.data.lgnm,
            stj: data.data.stj,
            stcd: data.data.stcd,
            addr: data.data.addr,
            nba: data.data.nba,
            ctin: data.data.ctin,
            cxdt: data.data.cxdt,
            rgdt: data.data.rgdt,
            efbdt: data.data.efbdt,
            gstin: data.data.gstin,
            dty: data.data.dty,
            psta: data.data.psta,
            sts: data.data.sts,
            updt: data.data.updt,
            bl: data.data.bl,
            geofenced: data.data.geofenced,
            lstupdt: data.data.lstupdt,
            currcode: data.data.currcode,
            rjcd: data.data.rjcd,
            lgnmDtls: data.data.lgnmDtls,
          };
        }
      } else if (this.provider === 'gstportal') {
        // Parse GST Portal response format
        if (data.success && data.result) {
          gstDetails = {
            tradeNam: data.result.tradeName,
            lgnm: data.result.legalName,
            stj: data.result.stateCode,
            stcd: data.result.stateCode,
            addr: {
              bnm: data.result.address?.buildingNumber,
              st: data.result.address?.street,
              loc: data.result.address?.location,
              city: data.result.address?.city,
              dst: data.result.address?.district,
              pincode: data.result.address?.pincode,
              stcd: data.result.address?.stateCode,
            },
            gstin: data.result.gstin,
            sts: data.result.status,
            updt: data.result.lastUpdated,
          };
        }
      }

      return gstDetails;

    } catch (error) {
      console.error('GST API Error:', error);
      throw new Error(`Failed to fetch GST details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map GST details to company/party form fields
   */
  mapGSTDetailsToForm(gstDetails: GSTDetails): Partial<CompanyForm> | Partial<PartyForm> {
    if (!gstDetails) {
      return {};
    }

    return {
      // Company/Party Name
      name: gstDetails.tradeNam || gstDetails.lgnm,

      // Address
      address: this.formatAddress(gstDetails.addr),
      state: this.getStateName(gstDetails.stcd),
      stateCode: gstDetails.stcd,
      pinCode: gstDetails.addr?.pincode,

      // Contact (if available in GST data)
      phone: '', // GST API typically doesn't provide phone

      // GST Details
      gstin: gstDetails.gstin,
      pan: this.extractPANFromGSTIN(gstDetails.gstin),

      // Business Type
      organizationType: this.mapBusinessNature(gstDetails.nba),

      // Constitution
      constitution: gstDetails.ctin,

      // Registration Date
      registrationDate: gstDetails.rgdt ? new Date(gstDetails.rgdt) : undefined,
    };
  }

  /**
   * Format address from GST API response
   */
  private formatAddress(addr: any): string {
    if (!addr) return '';

    const parts = [
      addr.bnm,
      addr.st,
      addr.loc,
      addr.city,
      addr.dst,
      addr.pincode ? `PIN: ${addr.pincode}` : '',
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Get state name from state code
   */
  private getStateName(stateCode?: string): string {
    const stateMap: Record<string, string> = {
      '01': 'Jammu and Kashmir',
      '02': 'Himachal Pradesh',
      '03': 'Punjab',
      '04': 'Chandigarh',
      '05': 'Uttarakhand',
      '06': 'Haryana',
      '07': 'Delhi',
      '08': 'Rajasthan',
      '09': 'Uttar Pradesh',
      '10': 'Bihar',
      '11': 'Sikkim',
      '12': 'Arunachal Pradesh',
      '13': 'Nagaland',
      '14': 'Manipur',
      '15': 'Mizoram',
      '16': 'Tripura',
      '17': 'Meghalaya',
      '18': 'Assam',
      '19': 'West Bengal',
      '20': 'Jharkhand',
      '21': 'Odisha',
      '22': 'Chhattisgarh',
      '23': 'Madhya Pradesh',
      '24': 'Gujarat',
      '25': 'Dadra and Nagar Haveli and Daman and Diu',
      '26': 'Daman and Diu',
      '27': 'Dadra and Nagar Haveli',
      '28': 'Maharashtra',
      '29': 'Andhra Pradesh',
      '30': 'Karnataka',
      '31': 'Lakshadweep',
      '32': 'Kerala',
      '33': 'Tamil Nadu',
      '34': 'Puducherry',
      '35': 'Andaman and Nicobar Islands',
      '36': 'Telangana',
      '37': 'Andhra Pradesh',
    };

    return stateCode ? stateMap[stateCode] || stateCode : '';
  }

  /**
   * Extract PAN from GSTIN (first 10 characters after removing state code)
   */
  private extractPANFromGSTIN(gstin?: string): string {
    if (!gstin || gstin.length < 12) return '';

    // Remove state code (first 2 characters) and extract next 10 characters as PAN
    return gstin.substring(2, 12);
  }

  /**
   * Map GST nature of business activities to organization type
   */
  private mapBusinessNature(nba?: string[]): string {
    if (!nba || nba.length === 0) return '';

    const businessMap: Record<string, string> = {
      'Manufacturer': 'Manufacturer',
      'Wholesale Business': 'Wholesale',
      'Retail Business': 'Retail',
      'Service Provider': 'Service Provider',
      'Works Contract': 'Works Contract',
      'Other': 'Others',
    };

    // Return the first matching business type
    for (const business of nba) {
      if (businessMap[business]) {
        return businessMap[business];
      }
    }

    return 'Others';
  }

  /**
   * Test GST API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const testGSTIN = '33AAAPG5900B1ZC'; // Valid test GSTIN

      const result = await this.fetchGSTDetails(testGSTIN);
      return result !== null;
    } catch (error) {
      console.error('GST API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get API configuration
   */
  getAPIConfig(): { provider: string; apiKey: string; apiUrl: string } {
    return {
      provider: this.provider,
      apiKey: this.apiKey,
      apiUrl: this.apiUrl,
    };
  }

  /**
   * Update API configuration
   */
  updateAPIConfig(config: { provider?: string; apiKey?: string; apiUrl?: string }): void {
    if (config.provider) this.provider = config.provider;
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.apiUrl) this.apiUrl = config.apiUrl;
  }
}

export interface CompanyForm {
  name?: string;
  address?: string;
  state?: string;
  stateCode?: string;
  pinCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  organizationType?: string;
  constitution?: string;
  registrationDate?: Date;
  bankName?: string;
  bankAccount?: string;
  ifsc?: string;
  branch?: string;
}

export interface PartyForm extends CompanyForm {
  partyName?: string;
  dueDays?: number;
  noOfLooms?: number;
  commissionPerBag?: number;
  commissionPercent?: number;
  bankName?: string;
  bankAccount?: string;
  ifsc?: string;
  branch?: string;
}

export default GSTAPIService;