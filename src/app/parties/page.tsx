"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Check, Plus, Edit, ArrowLeft, ExternalLink, ClipboardPaste, AlertCircle, CheckCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { validateGSTIN, extractPANFromGSTIN, extractStateFromGSTIN, parseGSTPortalText, getGSTPortalURL, mapToPartyForm } from "@/lib/gst-parser";

interface PartyFormData {
  partyName: string;
  companyId: string;
  gstin: string;
  pan: string;
  address: string;
  state: string;
  stateCode: string;
  phone: string;
  email: string;
  organizationType: string;
  bankName: string;
  bankAccount: string;
  ifsc: string;
  branch: string;
  noOfLooms: string;
  commissionPerBag: string;
  commissionPercent: string;
  dueDays: string;
  ledgerTypeId: string;
  accountGroupId: string;
  accountMaintenance: string;
}

interface Party extends PartyFormData {
  id: number;
  isActive: boolean;
  createdAt: string;
}

const initialFormData: PartyFormData = {
  partyName: '',
  companyId: '',
  gstin: '',
  pan: '',
  address: '',
  state: '',
  stateCode: '',
  phone: '',
  email: '',
  organizationType: '',
  bankName: '',
  bankAccount: '',
  ifsc: '',
  branch: '',
  noOfLooms: '',
  commissionPerBag: '',
  commissionPercent: '',
  dueDays: '45',
  ledgerTypeId: '',
  accountGroupId: '',
  accountMaintenance: 'Balance Only',
};

export default function PartyRegistration() {
  const [formData, setFormData] = useState<PartyFormData>(initialFormData);
  const [parties, setParties] = useState<Party[]>([]);
  const [companies, setCompanies] = useState<Array<{ id: number; name: string }>>([]);
  const [ledgerTypes, setLedgerTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [accountGroups, setAccountGroups] = useState<Array<{ id: number; groupName: string }>>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [gstinError, setGstinError] = useState('');

  // Handle delete
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/parties/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete party');
      }

      toast.success('Party deleted successfully');
      setDeleteConfirmation(null);
      fetchParties();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete party');
    }
  };

  // View Details Modal
  const [viewParty, setViewParty] = useState<Party | null>(null);

  // GST Portal Modal state
  const [showGSTModal, setShowGSTModal] = useState(false);
  const [gstPortalText, setGstPortalText] = useState('');
  const [parsedData, setParsedData] = useState<ReturnType<typeof mapToPartyForm> | null>(null);
  const [parseError, setParseError] = useState('');

  useEffect(() => {
    fetchParties();
    fetchMasterData();
  }, []);

  const fetchParties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/parties');
      if (response.ok) {
        const data = await response.json();
        setParties(data);
      }
    } catch (error) {
      console.error('Failed to fetch parties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [companiesRes, ledgerRes, accountGroupsRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/ledger-types'),
        fetch('/api/account-groups'),
      ]);
      if (companiesRes.ok) setCompanies(await companiesRes.json());
      if (ledgerRes.ok) setLedgerTypes(await ledgerRes.json());
      if (accountGroupsRes.ok) setAccountGroups(await accountGroupsRes.json());
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  const handleGSTINChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setFormData(prev => ({ ...prev, gstin: upperValue }));
    setGstinError('');

    if (upperValue.length >= 2) {
      const stateInfo = extractStateFromGSTIN(upperValue);
      if (stateInfo) {
        setFormData(prev => ({ ...prev, state: stateInfo.name, stateCode: stateInfo.code }));
      }
    }
    if (upperValue.length >= 12) {
      setFormData(prev => ({ ...prev, pan: extractPANFromGSTIN(upperValue) }));
    }
    if (upperValue.length === 15) {
      const validation = validateGSTIN(upperValue);
      if (!validation.isValid) setGstinError(validation.error || 'Invalid GSTIN');
    }
  };

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

  const handleParseText = () => {
    setParseError('');
    setParsedData(null);

    if (!gstPortalText.trim()) {
      setParseError('Please paste the text from GST portal');
      return;
    }

    const parsed = parseGSTPortalText(gstPortalText);
    if (!parsed) {
      setParseError('Could not parse the text. Please make sure you copied the complete details.');
      return;
    }

    const mapped = mapToPartyForm(parsed);
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

  const handleApplyParsedData = () => {
    if (parsedData) {
      setFormData(prev => ({
        ...prev,
        partyName: parsedData.partyName || prev.partyName,
        gstin: parsedData.gstin || prev.gstin,
        pan: parsedData.pan || prev.pan,
        address: parsedData.address || prev.address,
        state: parsedData.state || prev.state,
        stateCode: parsedData.stateCode || prev.stateCode,
        organizationType: parsedData.organizationType || prev.organizationType,
      }));
      setShowGSTModal(false);
      toast.success('GST details applied successfully!');
    }
  };

  const handleInputChange = (field: keyof PartyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partyName.trim()) { toast.error('Party name is required'); return; }
    if (!formData.companyId) { toast.error('Please select a company'); return; }
    if (formData.gstin && !validateGSTIN(formData.gstin).isValid) { toast.error('Invalid GSTIN format'); return; }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/parties/${editingId}` : '/api/parties';
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to save');
      toast.success(editingId ? 'Party updated!' : 'Party registered!');
      setFormData(initialFormData);
      setShowForm(false);
      setEditingId(null);
      fetchParties();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (party: Party) => {
    setFormData({
      partyName: party.partyName || '',
      companyId: party.companyId || '',
      gstin: party.gstin || '',
      pan: party.pan || '',
      address: party.address || '',
      state: party.state || '',
      stateCode: party.stateCode || '',
      phone: party.phone || '',
      email: party.email || '',
      organizationType: party.organizationType || '',
      bankName: party.bankName || '',
      bankAccount: party.bankAccount || '',
      ifsc: party.ifsc || '',
      branch: party.branch || '',
      noOfLooms: party.noOfLooms || '',
      commissionPerBag: party.commissionPerBag || '',
      commissionPercent: party.commissionPercent || '',
      dueDays: party.dueDays || '45',
      ledgerTypeId: party.ledgerTypeId || '',
      accountGroupId: party.accountGroupId || '',
      accountMaintenance: party.accountMaintenance || 'Balance Only',
    });
    setEditingId(party.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-8 w-8 text-orange-600" /> Party Registration
              </h1>
              <p className="text-gray-600">Register parties with GST details</p>
            </div>
          </div>
          {!showForm && (
            <Button onClick={() => { setFormData(initialFormData); setEditingId(null); setShowForm(true); }} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" /> Add Party
            </Button>
          )}
        </div>

        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Party' : 'Register New Party'}</CardTitle>
              <CardDescription>Enter GSTIN and fetch details from GST Portal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Selection */}
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Select value={formData.companyId} onValueChange={(v) => handleInputChange('companyId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* GSTIN with Portal Button */}
                <div className="space-y-2">
                  <Label>GSTIN</Label>
                  <div className="flex gap-2">
                    <Input value={formData.gstin} onChange={(e) => handleGSTINChange(e.target.value)}
                      placeholder="Enter 15-digit GSTIN" maxLength={15}
                      className={`uppercase font-mono flex-1 ${gstinError ? 'border-red-500' : ''}`} />
                    <Button type="button" variant="outline" onClick={handleOpenGSTPortal} disabled={formData.gstin.length !== 15}>
                      <ExternalLink className="h-4 w-4 mr-1" /> Fetch from GST Portal
                    </Button>
                  </div>
                  {gstinError && <p className="text-sm text-red-500">{gstinError}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Party Name *</Label>
                    <Input value={formData.partyName} onChange={(e) => handleInputChange('partyName', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>PAN</Label>
                    <Input value={formData.pan} onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                      maxLength={10} className="uppercase font-mono" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} rows={3} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>State Code</Label>
                    <Input value={formData.stateCode} onChange={(e) => handleInputChange('stateCode', e.target.value)} maxLength={2} className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Organization Type</Label>
                    <Input value={formData.organizationType} onChange={(e) => handleInputChange('organizationType', e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ledger Type</Label>
                    <Select value={formData.ledgerTypeId} onValueChange={(v) => handleInputChange('ledgerTypeId', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{ledgerTypes.map((t) => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Account Group</Label>
                    <Select value={formData.accountGroupId} onValueChange={(v) => handleInputChange('accountGroupId', v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{accountGroups.map((g) => <SelectItem key={g.id} value={g.id.toString()}>{g.groupName}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Business Details */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Business Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>No of Looms</Label>
                      <Input type="number" value={formData.noOfLooms} onChange={(e) => handleInputChange('noOfLooms', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Due Days</Label>
                      <Input type="number" value={formData.dueDays} onChange={(e) => handleInputChange('dueDays', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Commission/Bag</Label>
                      <Input type="number" step="0.01" value={formData.commissionPerBag} onChange={(e) => handleInputChange('commissionPerBag', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Commission %</Label>
                      <Input type="number" step="0.01" value={formData.commissionPercent} onChange={(e) => handleInputChange('commissionPercent', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input value={formData.bankName} onChange={(e) => handleInputChange('bankName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input value={formData.bankAccount} onChange={(e) => handleInputChange('bankAccount', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <Input value={formData.branch} onChange={(e) => handleInputChange('branch', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input value={formData.ifsc} onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())} maxLength={11} className="uppercase font-mono" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <Button type="button" variant="outline" onClick={() => { setFormData(initialFormData); setShowForm(false); setEditingId(null); }}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
                    {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : <><Check className="h-4 w-4 mr-2" />{editingId ? 'Update' : 'Register'}</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Registered Parties</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>
              ) : parties.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600">No Parties Registered</h3>
                  <Button onClick={() => setShowForm(true)} className="mt-4 bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" /> Add Party
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Party Name</TableHead>
                      <TableHead>GSTIN</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parties.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.partyName}</TableCell>
                        <TableCell className="font-mono text-sm">{p.gstin || '-'}</TableCell>
                        <TableCell>{p.state || '-'}</TableCell>
                        <TableCell><Badge variant={p.isActive ? "default" : "secondary"}>{p.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" title="View Details" onClick={() => setViewParty(p)}>
                              <ExternalLink className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(p)}>
                              <Edit className="h-4 w-4 text-orange-600" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteConfirmation(p.id)}>
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-sm">How to Fetch GST Details</CardTitle></CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Enter 15-digit GSTIN</li>
              <li>Click "Fetch from GST Portal" to open official portal</li>
              <li>Search and copy all details (Ctrl+A, Ctrl+C)</li>
              <li>Paste in the popup and click "Parse Details"</li>
              <li>Review and apply to form</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* GST Portal Modal */}
      <Dialog open={showGSTModal} onOpenChange={setShowGSTModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ClipboardPaste className="h-5 w-5" /> Paste GST Portal Details</DialogTitle>
            <DialogDescription>Copy all details from GST portal and paste below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>GSTIN</Label><Input value={formData.gstin} readOnly className="font-mono bg-gray-50" /></div>
            <div>
              <Label>Paste Text Here</Label>
              <Textarea
                value={gstPortalText}
                onChange={(e) => setGstPortalText(e.target.value)}
                rows={12}
                className="font-mono text-sm leading-relaxed"
                placeholder="Paste copied text..."
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
                  Parsed Successfully
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {parsedData.partyName && <div className="flex flex-col"><span className="text-gray-500 text-xs">Name</span><span className="font-medium">{parsedData.partyName}</span></div>}
                  {parsedData.gstin && <div className="flex flex-col"><span className="text-gray-500 text-xs">GSTIN</span><span className="font-medium">{parsedData.gstin}</span></div>}
                  {parsedData.state && <div className="flex flex-col"><span className="text-gray-500 text-xs">State</span><span className="font-medium">{parsedData.state}</span></div>}
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGSTModal(false)}>Cancel</Button>
            {!parsedData ? (
              <Button onClick={handleParseText} disabled={!gstPortalText.trim()}><ClipboardPaste className="h-4 w-4 mr-1" />Parse</Button>
            ) : (
              <Button onClick={handleApplyParsedData} className="bg-green-600 hover:bg-green-700"><Check className="h-4 w-4 mr-1" />Apply</Button>
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
              Are you sure you want to delete this party? This action cannot be undone if there are no related records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmation && handleDelete(deleteConfirmation)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewParty} onOpenChange={(open) => !open && setViewParty(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewParty?.partyName}</DialogTitle>
            <DialogDescription>Party Details</DialogDescription>
          </DialogHeader>
          {viewParty && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="font-semibold block">GSTIN:</span> {viewParty.gstin}</div>
              <div><span className="font-semibold block">State:</span> {viewParty.state}</div>
              <div><span className="font-semibold block">Phone:</span> {viewParty.phone || '-'}</div>
              <div><span className="font-semibold block">Email:</span> {viewParty.email || '-'}</div>
              <div><span className="font-semibold block">Bank:</span> {viewParty.bankName || '-'}</div>
              <div><span className="font-semibold block">Account:</span> {viewParty.bankAccount || '-'}</div>
              <div><span className="font-semibold block">IFSC:</span> {viewParty.ifsc || '-'}</div>
              <div><span className="font-semibold block">Due Days:</span> {viewParty.dueDays || '-'}</div>
              <div className="col-span-2 border-t pt-2">
                <span className="font-semibold block">Address:</span> {viewParty.address || '-'}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}