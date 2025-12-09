"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Check, Building2, Plus, Edit, ArrowLeft, ExternalLink, ClipboardPaste, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { validateGSTIN, extractPANFromGSTIN, extractStateFromGSTIN, parseGSTPortalText, getGSTPortalURL, mapToCompanyForm } from "@/lib/gst-parser";

interface CompanyFormData {
  name: string;
  gstin: string;
  pan: string;
  address: string;
  state: string;
  stateCode: string;
  pinCode: string;
  phone: string;
  email: string;
  website: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  branch: string;
}

interface Company extends CompanyFormData {
  id: number;
  isActive: boolean;
  createdAt: string;
}

const initialFormData: CompanyFormData = {
  name: '',
  gstin: '',
  pan: '',
  address: '',
  state: '',
  stateCode: '',
  pinCode: '',
  phone: '',
  email: '',
  website: '',
  bankName: '',
  bankAccount: '',
  ifsc: '',
  branch: '',
};

// Indian States with codes
const indianStates = [
  { code: '01', name: 'Jammu and Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman and Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
];

export default function CompanyRegistration() {
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [gstinError, setGstinError] = useState('');

  // GST Portal Modal state
  const [showGSTModal, setShowGSTModal] = useState(false);
  const [gstPortalText, setGstPortalText] = useState('');
  const [parsedData, setParsedData] = useState<ReturnType<typeof mapToCompanyForm> | null>(null);
  const [parseError, setParseError] = useState('');

  // Fetch companies on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle GSTIN input change
  const handleGSTINChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setFormData(prev => ({ ...prev, gstin: upperValue }));
    setGstinError('');

    // Auto-extract state and PAN
    if (upperValue.length >= 2) {
      const stateInfo = extractStateFromGSTIN(upperValue);
      if (stateInfo) {
        setFormData(prev => ({
          ...prev,
          gstin: upperValue,
          state: stateInfo.name,
          stateCode: stateInfo.code,
        }));
      }
    }

    if (upperValue.length >= 12) {
      const pan = extractPANFromGSTIN(upperValue);
      setFormData(prev => ({ ...prev, pan }));
    }

    // Validate when complete
    if (upperValue.length === 15) {
      const validation = validateGSTIN(upperValue);
      if (!validation.isValid) {
        setGstinError(validation.error || 'Invalid GSTIN');
      }
    }
  };

  // Open GST Portal in new tab
  const handleOpenGSTPortal = () => {
    if (formData.gstin.length === 15) {
      window.open(getGSTPortalURL(), '_blank');
      setShowGSTModal(true);
      setGstPortalText('');
      setParsedData(null);
      setParseError('');
    } else {
      toast.error('Please enter a valid 15-digit GSTIN first');
    }
  };

  // Parse pasted text
  const handleParseText = () => {
    setParseError('');
    setParsedData(null);

    if (!gstPortalText.trim()) {
      setParseError('Please paste the text from GST portal');
      return;
    }

    const parsed = parseGSTPortalText(gstPortalText);
    if (!parsed) {
      setParseError('Could not parse the text. Please make sure you copied the complete details from the GST portal.');
      return;
    }

    const mapped = mapToCompanyForm(parsed);

    // If no GSTIN in parsed data, use the one already entered
    if (!mapped.gstin && formData.gstin) {
      mapped.gstin = formData.gstin;
      mapped.pan = extractPANFromGSTIN(formData.gstin);
      const stateInfo = extractStateFromGSTIN(formData.gstin);
      if (stateInfo) {
        mapped.state = stateInfo.name;
        mapped.stateCode = stateInfo.code;
      }
    }

    setParsedData(mapped);
  };

  // Apply parsed data to form
  const handleApplyParsedData = () => {
    if (parsedData) {
      setFormData(prev => ({
        ...prev,
        name: parsedData.name || prev.name,
        gstin: parsedData.gstin || prev.gstin,
        pan: parsedData.pan || prev.pan,
        address: parsedData.address || prev.address,
        state: parsedData.state || prev.state,
        stateCode: parsedData.stateCode || prev.stateCode,
        pinCode: parsedData.pinCode || prev.pinCode,
      }));
      setShowGSTModal(false);
      toast.success('GST details applied successfully!');
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle state selection
  const handleStateChange = (stateCode: string) => {
    const state = indianStates.find(s => s.code === stateCode);
    if (state) {
      setFormData(prev => ({
        ...prev,
        state: state.name,
        stateCode: state.code,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    if (formData.gstin && !validateGSTIN(formData.gstin).isValid) {
      toast.error('Invalid GSTIN format');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingId ? `/api/companies/${editingId}` : '/api/companies';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save company');
      }

      toast.success(editingId ? 'Company updated successfully!' : 'Company registered successfully!');
      setFormData(initialFormData);
      setShowForm(false);
      setEditingId(null);
      fetchCompanies();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save company');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (company: Company) => {
    setFormData({
      name: company.name || '',
      gstin: company.gstin || '',
      pan: company.pan || '',
      address: company.address || '',
      state: company.state || '',
      stateCode: company.stateCode || '',
      pinCode: company.pinCode || '',
      phone: company.phone || '',
      email: company.email || '',
      website: company.website || '',
      bankName: company.bankName || '',
      bankAccount: company.bankAccount || '',
      ifsc: company.ifsc || '',
      branch: company.branch || '',
    });
    setEditingId(company.id);
    setShowForm(true);
  };

  // Handle new company
  const handleNewCompany = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowForm(false);
    setGstinError('');
  };

  // Handle delete
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete company');
      }

      toast.success('Company deleted successfully');
      setDeleteConfirmation(null);
      fetchCompanies();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete company');
    }
  };

  // View Details Modal
  const [viewCompany, setViewCompany] = useState<Company | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="h-8 w-8 text-orange-600" />
                Company Setup
              </h1>
              <p className="text-gray-600">Register and manage your company details</p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={handleNewCompany} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          )}
        </div>

        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Company' : 'Register New Company'}</CardTitle>
              <CardDescription>
                Enter GSTIN and fetch details from GST Portal, or fill manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* GSTIN Input with Fetch Button */}
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <div className="flex gap-2">
                    <Input
                      id="gstin"
                      value={formData.gstin}
                      onChange={(e) => handleGSTINChange(e.target.value)}
                      placeholder="Enter 15-digit GSTIN"
                      maxLength={15}
                      className={`uppercase font-mono flex-1 ${gstinError ? 'border-red-500' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleOpenGSTPortal}
                      disabled={formData.gstin.length !== 15}
                      className="whitespace-nowrap"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Fetch from GST Portal
                    </Button>
                  </div>
                  {gstinError && <p className="text-sm text-red-500">{gstinError}</p>}
                  <p className="text-xs text-gray-500">
                    Enter GSTIN, click "Fetch from GST Portal", copy the details, and paste them
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  {/* PAN */}
                  <div className="space-y-2">
                    <Label htmlFor="pan">PAN</Label>
                    <Input
                      id="pan"
                      value={formData.pan}
                      onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                      placeholder="Auto-extracted from GSTIN"
                      maxLength={10}
                      className="uppercase font-mono"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Complete address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* State */}
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <select
                      id="state"
                      value={formData.stateCode}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.code} - {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State Code */}
                  <div className="space-y-2">
                    <Label htmlFor="stateCode">State Code</Label>
                    <Input
                      id="stateCode"
                      value={formData.stateCode}
                      readOnly
                      className="bg-gray-50 font-mono"
                    />
                  </div>

                  {/* PIN Code */}
                  <div className="space-y-2">
                    <Label htmlFor="pinCode">PIN Code</Label>
                    <Input
                      id="pinCode"
                      value={formData.pinCode}
                      onChange={(e) => handleInputChange('pinCode', e.target.value)}
                      placeholder="6-digit PIN"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Email address"
                    />
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="www.example.com"
                  />
                </div>

                {/* Bank Details Section */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        placeholder="Bank name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Account Number</Label>
                      <Input
                        id="bankAccount"
                        value={formData.bankAccount}
                        onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                        placeholder="Account number"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Input
                        id="branch"
                        value={formData.branch}
                        onChange={(e) => handleInputChange('branch', e.target.value)}
                        placeholder="Branch name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ifsc">IFSC Code</Label>
                      <Input
                        id="ifsc"
                        value={formData.ifsc}
                        onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())}
                        placeholder="IFSC code"
                        maxLength={11}
                        className="uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 mt-8">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {editingId ? 'Update Company' : 'Register Company'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Companies List */
          <Card>
            <CardHeader>
              <CardTitle>Registered Companies</CardTitle>
              <CardDescription>
                List of all registered companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No Companies Registered</h3>
                  <p className="text-gray-500 mt-2">Get started by adding your first company</p>
                  <Button onClick={handleNewCompany} className="mt-4 bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Company
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>GSTIN</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell className="font-mono text-sm">{company.gstin || '-'}</TableCell>
                          <TableCell>{company.state || '-'}</TableCell>
                          <TableCell>{company.phone || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={company.isActive ? "default" : "secondary"}>
                              {company.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" title="View Details" onClick={() => setViewCompany(company)}>
                                <ExternalLink className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(company)}>
                                <Edit className="h-4 w-4 text-orange-600" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteConfirmation(company.id)}>
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">How to Fetch GST Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Enter the 15-digit GSTIN in the field above</li>
              <li>Click <strong>"Fetch from GST Portal"</strong> - this opens the official GST portal</li>
              <li>On the GST portal, enter the GSTIN and solve the CAPTCHA</li>
              <li>Select all the details shown and copy them (Ctrl+A, Ctrl+C)</li>
              <li>Come back here and paste the copied text in the popup</li>
              <li>Click <strong>"Parse Details"</strong> to extract the information</li>
              <li>Review and click <strong>"Apply to Form"</strong></li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* GST Portal Paste Modal */}
      <Dialog open={showGSTModal} onOpenChange={setShowGSTModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardPaste className="h-5 w-5" />
              Paste GST Portal Details
            </DialogTitle>
            <DialogDescription>
              Copy all the details from the GST portal and paste them below. We'll extract the information automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>GSTIN Being Searched</Label>
              <Input value={formData.gstin} readOnly className="font-mono bg-gray-50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstPortalText">Paste Copied Text Here</Label>
              <Textarea
                id="gstPortalText"
                value={gstPortalText}
                onChange={(e) => setGstPortalText(e.target.value)}
                placeholder="Select all text from the GST portal search result and paste here..."
                rows={12}
                className="font-mono text-sm leading-relaxed"
              />
            </div>

            {parseError && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                <AlertCircle className="h-4 w-4" />
                {parseError}
              </div>
            )}

            {parsedData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-700 font-medium border-b border-green-200 pb-2">
                  <CheckCircle className="h-4 w-4" />
                  Successfully Parsed
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {parsedData.name && <div className="flex flex-col"><span className="text-gray-500 text-xs">Name</span><span className="font-medium">{parsedData.name}</span></div>}
                  {parsedData.gstin && <div className="flex flex-col"><span className="text-gray-500 text-xs">GSTIN</span><span className="font-medium">{parsedData.gstin}</span></div>}
                  {parsedData.pan && <div className="flex flex-col"><span className="text-gray-500 text-xs">PAN</span><span className="font-medium">{parsedData.pan}</span></div>}
                  {parsedData.state && <div className="flex flex-col"><span className="text-gray-500 text-xs">State</span><span className="font-medium">{parsedData.state}</span></div>}
                  {parsedData.pinCode && <div className="flex flex-col"><span className="text-gray-500 text-xs">PIN</span><span className="font-medium">{parsedData.pinCode}</span></div>}
                </div>
                {parsedData.address && (
                  <div className="flex flex-col text-sm pt-2 border-t border-green-200/50">
                    <span className="text-gray-500 text-xs">Address</span>
                    <span className="font-medium">{parsedData.address}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowGSTModal(false)}>
              Cancel
            </Button>
            {!parsedData ? (
              <Button onClick={handleParseText} disabled={!gstPortalText.trim()}>
                <ClipboardPaste className="h-4 w-4 mr-1" />
                Parse Details
              </Button>
            ) : (
              <Button onClick={handleApplyParsedData} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-1" />
                Apply to Form
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmation !== null} onOpenChange={(open) => !open && setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot be undone if there are no related records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmation && handleDelete(deleteConfirmation)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewCompany} onOpenChange={(open) => !open && setViewCompany(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewCompany?.name}</DialogTitle>
            <DialogDescription>Company Details</DialogDescription>
          </DialogHeader>
          {viewCompany && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold block">GSTIN:</span> {viewCompany.gstin}</div>
              <div><span className="font-semibold block">State:</span> {viewCompany.state}</div>
              <div><span className="font-semibold block">Phone:</span> {viewCompany.phone || '-'}</div>
              <div><span className="font-semibold block">Email:</span> {viewCompany.email || '-'}</div>
              <div><span className="font-semibold block">Website:</span> {viewCompany.website || '-'}</div>
              <div><span className="font-semibold block">Bank:</span> {viewCompany.bankName || '-'}</div>
              <div><span className="font-semibold block">Account:</span> {viewCompany.bankAccount || '-'}</div>
              <div><span className="font-semibold block">IFSC:</span> {viewCompany.ifsc || '-'}</div>
              <div className="col-span-2 border-t pt-2">
                <span className="font-semibold block">Address:</span> {viewCompany.address || '-'}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}