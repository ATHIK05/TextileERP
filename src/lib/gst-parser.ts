// GST Portal Text Parser
// Parses text copied from gst.gov.in taxpayer search results

export interface ParsedGSTDetails {
    gstin: string;
    legalName: string;
    tradeName: string;
    constitutionOfBusiness: string;
    taxpayerType: string;
    gstinStatus: string;
    dateOfRegistration: string;
    address: string;
    state: string;
    stateCode: string;
    pinCode: string;
    natureOfBusiness: string[];
}

// State code to state name mapping
const STATE_CODES: Record<string, string> = {
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
    '27': 'Maharashtra',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana',
    '37': 'Andhra Pradesh',
};

/**
 * Validate GSTIN format
 */
export function validateGSTIN(gstin: string): { isValid: boolean; error?: string } {
    if (!gstin) {
        return { isValid: false, error: 'GSTIN is required' };
    }

    const cleanGSTIN = gstin.trim().toUpperCase();

    if (cleanGSTIN.length !== 15) {
        return { isValid: false, error: 'GSTIN must be exactly 15 characters' };
    }

    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstinRegex.test(cleanGSTIN)) {
        return { isValid: false, error: 'Invalid GSTIN format' };
    }

    const stateCode = cleanGSTIN.substring(0, 2);
    if (!STATE_CODES[stateCode]) {
        return { isValid: false, error: `Invalid state code: ${stateCode}` };
    }

    return { isValid: true };
}

/**
 * Extract state info from GSTIN
 */
export function extractStateFromGSTIN(gstin: string): { code: string; name: string } | null {
    if (gstin.length < 2) return null;
    const stateCode = gstin.substring(0, 2);
    const stateName = STATE_CODES[stateCode];
    if (!stateName) return null;
    return { code: stateCode, name: stateName };
}

/**
 * Extract PAN from GSTIN
 */
export function extractPANFromGSTIN(gstin: string): string {
    if (gstin.length < 12) return '';
    return gstin.substring(2, 12).toUpperCase();
}

/**
 * Parse the copied text from GST portal
 * Supports both same-line "Label: Value" and multi-line "Label \n Value" formats
 */
export function parseGSTPortalText(text: string): Partial<ParsedGSTDetails> | null {
    if (!text || text.trim().length === 0) {
        return null;
    }

    const result: Partial<ParsedGSTDetails> = {};

    // Normalize the text
    const normalizedText = text
        .replace(/\r\n/g, '\n')
        .replace(/\t+/g, '\n')
        .replace(/\n{3,}/g, '\n') // Reduce multiple newlines
        .trim();

    const lines = normalizedText.split('\n').map(line => line.trim()).filter(Boolean);

    // 1. Try to extract GSTIN first (15 character alphanumeric)
    // Look for pattern like "33ABCDE1234F1Z5"
    const gstinMatch = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z])\b/i);
    if (gstinMatch) {
        result.gstin = gstinMatch[1].toUpperCase();
        const stateInfo = extractStateFromGSTIN(result.gstin);
        if (stateInfo) {
            result.stateCode = stateInfo.code;
            result.state = stateInfo.name;
        }
    }

    // 2. Define Patterns for Fields
    // We use strict patterns for labels to identify them
    const fieldPatterns: Record<keyof ParsedGSTDetails, RegExp[]> = {
        legalName: [
            /^Legal\s*Name(?:\s*of\s*Business)?/i,
            /^Name\s*of\s*the\s*Tax\s*Payer/i
        ],
        tradeName: [
            /^Trade\s*Name/i,
            /^Business\s*Name/i
        ],
        constitutionOfBusiness: [
            /^Constitution\s*(?:of\s*Business)?/i
        ],
        taxpayerType: [
            /^Tax\s*Payer\s*Type/i,
            /^Taxpayer\s*Type/i
        ],
        gstinStatus: [
            /^GSTIN\s*\/?\s*UIN\s*Status/i,
            /^Status$/i
        ],
        dateOfRegistration: [
            /^Date\s*of\s*Registration/i,
            /^Registration\s*Date/i,
            /^Effective\s*Date\s*of\s*registration/i
        ],
        address: [
            /^(?:Principal\s*)?(?:Place\s*of\s*)?(?:Business\s*)?Address/i
        ],
        // These are not direct text fields to parse usually, but kept for type safety
        gstin: [],
        state: [],
        stateCode: [],
        pinCode: [],
        natureOfBusiness: []
    };

    /**
     * Helper to check if a line is a known label
     */
    const isLabel = (line: string): boolean => {
        // Check against all patterns
        for (const key of Object.keys(fieldPatterns)) {
            if (key === 'gstin' || key === 'state' || key === 'stateCode' || key === 'pinCode' || key === 'natureOfBusiness') continue;

            for (const regex of fieldPatterns[key as keyof ParsedGSTDetails]) {
                // Strip colon or hyphen at end before check
                const cleanLine = line.replace(/[:\-]+$/, '').trim();
                if (regex.test(cleanLine)) return true;
            }
        }
        // Also check for specific ignore labels from the sample text
        if (/^Administrative\s*Office/i.test(line)) return true;
        if (/^Other\s*Office/i.test(line)) return true;
        if (/^Jurisdiction/i.test(line)) return true;
        if (/^State\s*-/i.test(line)) return true;
        if (/^Zone\s*-/i.test(line)) return true;
        if (/^Division\s*-/i.test(line)) return true;
        if (/^Commissionerate\s*-/i.test(line)) return true;
        if (/^Range\s*-/i.test(line)) return true;
        if (/^Circle\s*-/i.test(line)) return true;

        return false;
    };

    // 3. Iterate lines to find Label -> Value pairs
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check each field type
        for (const key of Object.keys(fieldPatterns)) {
            if (key === 'gstin' || key === 'state' || key === 'stateCode' || key === 'pinCode' || key === 'natureOfBusiness') continue;

            // Skip if we already have this value
            if (result[key as keyof ParsedGSTDetails]) continue;

            const patterns = fieldPatterns[key as keyof ParsedGSTDetails];
            let matched = false;

            for (const regex of patterns) {
                // Check if line STARTS with the label
                // Remove trailing colon/hyphen for the check
                const cleanLine = line.replace(/[:\-]+$/, '').trim();

                if (regex.test(cleanLine)) {
                    // FOUND A LABEL
                    matched = true;

                    // Case 1: Value is on the same line (Label: Value)
                    const matchResult = line.match(regex);
                    if (matchResult && line.includes(':')) {
                        const parts = line.split(':');
                        if (parts.length > 1) {
                            const val = parts.slice(1).join(':').trim();
                            if (val) {
                                (result as any)[key] = val;
                                break;
                            }
                        }
                    }

                    // Case 2: Value is on the next line
                    // Ensure next line exists
                    if (i + 1 < lines.length) {
                        const nextLine = lines[i + 1];
                        // Check if next line is safe to consume
                        if (!isLabel(nextLine)) {
                            (result as any)[key] = nextLine;
                            i++; // Skip processing next line as a label
                        }
                    }
                    break;
                }
            }
            if (matched) break;
        }
    }

    // 4. Special Handling for Address if it wasn't picked up
    if (!result.address) {
        // Look for line starting with "Principal Place of Business" manual scan
        const addrIndex = lines.findIndex(l => /Principal\s*Place\s*of\s*Business/i.test(l));
        if (addrIndex !== -1 && addrIndex + 1 < lines.length) {
            const possibleAddress = lines[addrIndex + 1];
            if (!isLabel(possibleAddress)) {
                result.address = possibleAddress;
            }
        }
    }

    // 5. PIN Code Extraction - Global Scan
    if (!result.pinCode) {
        if (result.address) {
            const pinMatch = result.address.match(/\b(\d{6})\b/);
            if (pinMatch) result.pinCode = pinMatch[1];
        }

        // Fallback scan
        if (!result.pinCode) {
            for (const l of lines) {
                const matches = l.match(/\b([1-9][0-9]{5})\b/);
                if (matches) {
                    result.pinCode = matches[1];
                    // If we found a PIN, and it looks like a loose address line, capture it if address is missing
                    if (!result.address && l.length > 15 && l.includes(',')) {
                        result.address = l;
                    }
                    break;
                }
            }
        }
    }

    return result;
}

/**
 * Get the GST portal search URL for a given GSTIN
 */
export function getGSTPortalURL(gstin?: string): string {
    return 'https://services.gst.gov.in/services/searchtp';
}

/**
 * Map parsed GST details to company form fields
 */
export function mapToCompanyForm(details: Partial<ParsedGSTDetails>) {
    return {
        // Prefer Trade Name, fallback to Legal Name
        name: details.tradeName || details.legalName || '',
        gstin: details.gstin || '',
        pan: details.gstin ? extractPANFromGSTIN(details.gstin) : '',
        address: details.address || '',
        state: details.state || '',
        stateCode: details.stateCode || '',
        pinCode: details.pinCode || '',
    };
}

/**
 * Map parsed GST details to party form fields
 */
export function mapToPartyForm(details: Partial<ParsedGSTDetails>) {
    return {
        partyName: details.tradeName || details.legalName || '',
        gstin: details.gstin || '',
        pan: details.gstin ? extractPANFromGSTIN(details.gstin) : '',
        address: details.address || '',
        state: details.state || '',
        stateCode: details.stateCode || '',
        organizationType: details.taxpayerType || details.constitutionOfBusiness || '',
    };
}

export { STATE_CODES };
