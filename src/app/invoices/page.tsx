'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, Download, Edit, Trash2, Calculator, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Invoice {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  companyId: number;
  companyName: string;
  partyId: number;
  partyName: string;
  setNo?: string;
  ends?: number;
  count?: string;
  meters?: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  netAmount: number;
  amountInWords?: string;
  paymentTerms?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: number;
  sNo: number;
  description: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface JobCard {
  id: number;
  setNo: string;
  date: string;
  partyId: number;
  partyName: string;
  companyId: number;
  companyName: string;
  count: string;
  ends: number;
  loomTypeName?: string;
  millName?: string;
  beamWidth?: string;
  warpingMetres?: number;
  pickupPercentage?: number;
  elongationPercentage?: number;
  status: string;
  warpingCard?: {
    id: number;
    lengthInMtrs: number;
    beams: Array<{
      beamNo: string;
      metre: number;
      ends: number;
      grossWeight: number;
      netWeight: number;
    }>;
  };
  sizingCard?: {
    id: number;
    setLength: number;
    noOfBeams: number;
    beamWidth: number;
    beams: Array<{
      beamNo: string;
      grossWeight: number;
      netWeight: number;
      clothMetres: number;
    }>;
  };
  sizingDetails?: Array<{
    no: number;
    ends: number;
    grossWeight: number;
    netWeight: number;
  }>;
  deliveryDetails?: Array<{
    beamNo: string;
    grossWeight: number;
    netWeight: number;
    metre: number;
    dcNo: string;
    deliveryTo: string;
  }>;
}

interface SizingCharge {
  id: number;
  partyId: number;
  partyName: string;
  chargePerKg: number;
  chargePerBeam: number | null;
}

interface Company {
  id: number;
  name: string;
  gstin: string;
  pan?: string;
  address?: string;
  state?: string;
  stateCode?: string;
  email?: string;
  phone?: string;
  bankName?: string;
  bankAccount?: string;
  ifsc?: string;
  branch?: string;
}

interface Party {
  id: number;
  partyName: string;
  gstin?: string;
  pan?: string;
  address?: string;
  state?: string;
  stateCode?: string;
  phone?: string;
  dueDays?: number;
}

export default function InvoiceManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taxType, setTaxType] = useState<'GST' | 'IGST'>('GST'); // GST = CGST + SGST, IGST for inter-state
  const [taxRate, setTaxRate] = useState(5); // Default 5% (2.5% CGST + 2.5% SGST or 5% IGST)
  const [formData, setFormData] = useState({
    companyId: '',
    partyId: '',
    setNo: '',
    // Job Card Details (auto-filled)
    count: '',
    ends: '',
    loomType: '',
    millName: '',
    meters: '',
    noOfBeams: '',
    beamWidth: '',
    // Warping Details
    warpingMetres: '',
    // Sizing Details
    totalWeight: '',
    pickupPercentage: '',
    elongationPercentage: '',
    // Invoice Items
    items: [
      { sno: 1, particulars: '', hsnSac: '998821', quantity: 0, rate: 0, amount: 0 }
    ],
    paymentTerms: '45',
    remarks: ''
  });
  const [jobCardData, setJobCardData] = useState<JobCard | null>(null);
  const [sizingCharge, setSizingCharge] = useState<SizingCharge | null>(null);
  const [isLoadingJobCard, setIsLoadingJobCard] = useState(false);

  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      return response.json();
    }
  });

  // Fetch companies
  const { data: companies } = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Failed to fetch companies');
      return response.json();
    }
  });

  // Fetch parties
  const { data: parties } = useQuery<Party[]>({
    queryKey: ['parties'],
    queryFn: async () => {
      const response = await fetch('/api/parties');
      if (!response.ok) throw new Error('Failed to fetch parties');
      return response.json();
    }
  });

  // Fetch sizing charges
  const { data: sizingCharges } = useQuery<SizingCharge[]>({
    queryKey: ['sizing-charges'],
    queryFn: async () => {
      const response = await fetch('/api/master/sizing-charges');
      if (!response.ok) throw new Error('Failed to fetch sizing charges');
      return response.json();
    }
  });

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create invoice');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Invoice created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create invoice');
    }
  });

  const resetForm = () => {
    setFormData({
      companyId: '',
      partyId: '',
      setNo: '',
      count: '',
      ends: '',
      loomType: '',
      millName: '',
      meters: '',
      noOfBeams: '',
      beamWidth: '',
      warpingMetres: '',
      totalWeight: '',
      pickupPercentage: '',
      elongationPercentage: '',
      items: [{ sno: 1, particulars: '', hsnSac: '998821', quantity: 0, rate: 0, amount: 0 }],
      paymentTerms: '45',
      remarks: ''
    });
    setJobCardData(null);
    setSizingCharge(null);
    setTaxType('GST');
    setTaxRate(5);
  };

  const addItem = () => {
    const newSno = formData.items.length + 1;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { sno: newSno, particulars: '', hsnSac: '998821', quantity: 0, rate: 0, amount: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sno: i + 1 }))
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          // Calculate amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = (updatedItem.quantity || 0) * (updatedItem.rate || 0);
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const calculateTotals = useCallback(() => {
    const taxableAmount = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const halfRate = taxRate / 2; // For CGST/SGST split

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (taxType === 'GST') {
      cgstAmount = taxableAmount * (halfRate / 100);
      sgstAmount = taxableAmount * (halfRate / 100);
    } else {
      igstAmount = taxableAmount * (taxRate / 100);
    }

    const totalAmount = taxableAmount + cgstAmount + sgstAmount + igstAmount;
    const roundOff = Math.round(totalAmount) - totalAmount;
    const netAmount = Math.round(totalAmount);

    return {
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount,
      roundOff,
      netAmount
    };
  }, [formData.items, taxType, taxRate]);

  // Handle Set No change - fetch job card data
  const handleSetNoChange = async (setNo: string) => {
    setFormData(prev => ({ ...prev, setNo }));

    if (setNo.length >= 3) {
      setIsLoadingJobCard(true);
      try {
        const response = await fetch(`/api/job-cards/${setNo}`);
        if (response.ok) {
          const jobCard: JobCard = await response.json();
          setJobCardData(jobCard);

          // Calculate total weight from sizing details or sizing card
          let totalWeight = 0;
          let totalMeters = 0;

          if (jobCard.sizingCard?.beams?.length) {
            totalWeight = jobCard.sizingCard.beams.reduce((sum, beam) => sum + Number(beam.netWeight || 0), 0);
            totalMeters = jobCard.sizingCard.beams.reduce((sum, beam) => sum + Number(beam.clothMetres || 0), 0);
          } else if (jobCard.sizingDetails?.length) {
            totalWeight = jobCard.sizingDetails.reduce((sum, detail) => sum + Number(detail.netWeight || 0), 0);
          }

          if (jobCard.warpingCard?.beams?.length) {
            if (totalMeters === 0) {
              totalMeters = jobCard.warpingCard.beams.reduce((sum, beam) => sum + Number(beam.metre || 0), 0);
            }
          }

          // Auto-fill form with job card data
          setFormData(prev => {
            // Find sizing charge for this party
            const partyCharge = sizingCharges?.find(sc => sc.partyId === jobCard.partyId);
            if (partyCharge) {
              setSizingCharge(partyCharge);
            }

            // Calculate default particulars text
            const particulars = `${jobCard.ends || ''}/${jobCard.count || ''} - SIZING CHARGES`;

            // Update items with auto-calculated values
            const updatedItems = prev.items.map((item, idx) => {
              if (idx === 0) {
                return {
                  ...item,
                  particulars,
                  quantity: totalWeight,
                  rate: partyCharge?.chargePerKg || 0,
                  amount: totalWeight * (partyCharge?.chargePerKg || 0)
                };
              }
              return item;
            });

            return {
              ...prev,
              companyId: jobCard.companyId?.toString() || prev.companyId,
              partyId: jobCard.partyId?.toString() || prev.partyId,
              count: jobCard.count || '',
              ends: jobCard.ends?.toString() || '',
              loomType: jobCard.loomTypeName || '',
              millName: jobCard.millName || '',
              meters: totalMeters.toFixed(2),
              noOfBeams: jobCard.sizingCard?.noOfBeams?.toString() || '',
              beamWidth: jobCard.beamWidth || jobCard.sizingCard?.beamWidth?.toString() || '',
              warpingMetres: jobCard.warpingMetres?.toString() || (jobCard.warpingCard?.lengthInMtrs?.toString() || ''),
              totalWeight: totalWeight.toFixed(3),
              pickupPercentage: jobCard.pickupPercentage?.toString() || '',
              elongationPercentage: jobCard.elongationPercentage?.toString() || '',
              items: updatedItems
            };
          });

          toast.success(`Job Card ${setNo} loaded successfully!`);
        } else if (response.status === 404) {
          toast.info(`Job Card ${setNo} not found`);
        }
      } catch (error) {
        console.error('Error fetching job card:', error);
        toast.error('Failed to fetch job card details');
      } finally {
        setIsLoadingJobCard(false);
      }
    }
  };

  const handlePartyChange = (partyId: string) => {
    const party = parties?.find(p => p.id.toString() === partyId);
    if (party) {
      // Find sizing charge for this party
      const partyCharge = sizingCharges?.find(sc => sc.partyId.toString() === partyId);
      setSizingCharge(partyCharge || null);

      // Check if party is from same state for tax calculation
      const company = companies?.find(c => c.id.toString() === formData.companyId);
      if (company && party.stateCode && company.stateCode) {
        if (party.stateCode !== company.stateCode) {
          setTaxType('IGST');
          toast.info('Inter-state transaction detected - IGST will be applied');
        } else {
          setTaxType('GST');
        }
      }

      setFormData(prev => {
        // Update rate in items if sizing charge exists
        const updatedItems = prev.items.map((item, idx) => {
          if (idx === 0 && partyCharge) {
            return { ...item, rate: partyCharge.chargePerKg, amount: item.quantity * partyCharge.chargePerKg };
          }
          return item;
        });

        return {
          ...prev,
          partyId,
          paymentTerms: party.dueDays?.toString() || '45',
          items: updatedItems
        };
      });
    }
  };

  const handleCompanyChange = (companyId: string) => {
    setFormData(prev => ({ ...prev, companyId }));

    // Re-check tax type based on company state
    const company = companies?.find(c => c.id.toString() === companyId);
    const party = parties?.find(p => p.id.toString() === formData.partyId);
    if (company && party && party.stateCode && company.stateCode) {
      if (party.stateCode !== company.stateCode) {
        setTaxType('IGST');
      } else {
        setTaxType('GST');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totals = calculateTotals();
    createInvoice.mutate({
      ...formData,
      taxableAmount: totals.taxableAmount,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      totalAmount: totals.totalAmount,
      roundOff: totals.roundOff,
      netAmount: totals.netAmount,
      companyId: parseInt(formData.companyId),
      partyId: parseInt(formData.partyId),
      taxType,
      taxRate
    });
  };

  const downloadPDF = (invoiceId: number) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totals = calculateTotals();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Create and manage tax invoices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-[1400px] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tax Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company, Party and Set No Selection */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="companyId">Company *</Label>
                  <Select value={formData.companyId} onValueChange={handleCompanyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map(company => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="partyId">Party (Bill To) *</Label>
                  <Select value={formData.partyId} onValueChange={handlePartyChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select party" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties?.map(party => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.partyName} {party.gstin ? `(${party.gstin})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {sizingCharge && (
                    <p className="text-xs text-green-600 mt-1">
                      Sizing Rate: ₹{sizingCharge.chargePerKg.toFixed(2)}/kg
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="setNo">Set No (Job Card)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="setNo"
                      value={formData.setNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, setNo: e.target.value }))}
                      placeholder="e.g., 394A"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleSetNoChange(formData.setNo)}
                      disabled={isLoadingJobCard}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {isLoadingJobCard && (
                    <p className="text-xs text-blue-600 mt-1">Loading job card...</p>
                  )}
                  {jobCardData && (
                    <p className="text-xs text-blue-600 mt-1">
                      ✓ {jobCardData.partyName} | {jobCardData.count}
                    </p>
                  )}
                </div>
              </div>

              {/* Job Card Details Section */}
              <Card className="border-2 border-dashed">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium">Job Card Details (Auto-filled from SET No)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-3">
                    <div>
                      <Label className="text-xs">Count</Label>
                      <Input
                        value={formData.count}
                        onChange={(e) => setFormData(prev => ({ ...prev, count: e.target.value }))}
                        placeholder="30's vortex"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Ends</Label>
                      <Input
                        value={formData.ends}
                        onChange={(e) => setFormData(prev => ({ ...prev, ends: e.target.value }))}
                        placeholder="4080"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Loom Type</Label>
                      <Input
                        value={formData.loomType}
                        onChange={(e) => setFormData(prev => ({ ...prev, loomType: e.target.value }))}
                        placeholder="SULZER"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Mill Name</Label>
                      <Input
                        value={formData.millName}
                        onChange={(e) => setFormData(prev => ({ ...prev, millName: e.target.value }))}
                        placeholder="Kumaragiri"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">No. of Beams</Label>
                      <Input
                        value={formData.noOfBeams}
                        onChange={(e) => setFormData(prev => ({ ...prev, noOfBeams: e.target.value }))}
                        placeholder="2"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Beam Width</Label>
                      <Input
                        value={formData.beamWidth}
                        onChange={(e) => setFormData(prev => ({ ...prev, beamWidth: e.target.value }))}
                        placeholder="74"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <div>
                      <Label className="text-xs">Warping Metres</Label>
                      <Input
                        value={formData.warpingMetres}
                        onChange={(e) => setFormData(prev => ({ ...prev, warpingMetres: e.target.value }))}
                        placeholder="15800.00"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total Meters</Label>
                      <Input
                        value={formData.meters}
                        onChange={(e) => setFormData(prev => ({ ...prev, meters: e.target.value }))}
                        placeholder="22070.00"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Pickup %</Label>
                      <Input
                        value={formData.pickupPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, pickupPercentage: e.target.value }))}
                        placeholder="8.13"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Elongation %</Label>
                      <Input
                        value={formData.elongationPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, elongationPercentage: e.target.value }))}
                        placeholder="4.81"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Items Table with Borders */}
              <div>
                <Label className="text-lg font-semibold mb-2 block">Invoice Items</Label>
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                        <TableHead className="border-r border-gray-300 w-16 text-center font-bold">NO OF BEAMS</TableHead>
                        <TableHead className="border-r border-gray-300 font-bold">PARTICULARS</TableHead>
                        <TableHead className="border-r border-gray-300 w-24 text-center font-bold">HSN/SAC</TableHead>
                        <TableHead className="border-r border-gray-300 w-28 text-center font-bold">QUANTITY IN KGS</TableHead>
                        <TableHead className="border-r border-gray-300 w-24 text-center font-bold">RATE/KG</TableHead>
                        <TableHead className="w-28 text-center font-bold">AMOUNT</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index} className="border-b border-gray-300">
                          <TableCell className="border-r border-gray-300 text-center">{item.sno}</TableCell>
                          <TableCell className="border-r border-gray-300">
                            <Input
                              value={item.particulars}
                              onChange={(e) => updateItem(index, 'particulars', e.target.value)}
                              placeholder="4080/30's vortex - SIZING CHARGES"
                              className="border-0 h-8 focus-visible:ring-0"
                            />
                          </TableCell>
                          <TableCell className="border-r border-gray-300">
                            <Input
                              value={item.hsnSac}
                              onChange={(e) => updateItem(index, 'hsnSac', e.target.value)}
                              placeholder="998821"
                              className="border-0 h-8 text-center focus-visible:ring-0"
                            />
                          </TableCell>
                          <TableCell className="border-r border-gray-300">
                            <Input
                              type="number"
                              step="0.001"
                              value={item.quantity || ''}
                              onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              placeholder="0.000"
                              className="border-0 h-8 text-right focus-visible:ring-0"
                            />
                          </TableCell>
                          <TableCell className="border-r border-gray-300">
                            <Input
                              type="number"
                              step="0.01"
                              value={item.rate || ''}
                              onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="border-0 h-8 text-right focus-visible:ring-0"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{item.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length === 1}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <Button type="button" variant="outline" onClick={addItem} className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* Tax Calculation Section */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left side - Payment Terms */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Payment & Tax Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Payment Terms (days)</Label>
                        <Input
                          type="number"
                          value={formData.paymentTerms}
                          onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Total Weight (KGS)</Label>
                        <Input
                          value={formData.totalWeight}
                          onChange={(e) => setFormData(prev => ({ ...prev, totalWeight: e.target.value }))}
                          className="h-8 bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Tax Type</Label>
                        <Select value={taxType} onValueChange={(v: 'GST' | 'IGST') => setTaxType(v)}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GST">CGST + SGST (Same State)</SelectItem>
                            <SelectItem value="IGST">IGST (Inter-State)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Tax Rate (%)</Label>
                        <Select value={taxRate.toString()} onValueChange={(v) => setTaxRate(parseInt(v))}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="12">12%</SelectItem>
                            <SelectItem value="18">18%</SelectItem>
                            <SelectItem value="28">28%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right side - Tax Summary Table */}
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                  <Table>
                    <TableBody>
                      <TableRow className="border-b border-gray-300">
                        <TableCell className="font-medium border-r border-gray-300">TAXABLE AMOUNT</TableCell>
                        <TableCell className="text-right font-bold">₹{totals.taxableAmount.toFixed(2)}</TableCell>
                      </TableRow>
                      {taxType === 'GST' ? (
                        <>
                          <TableRow className="border-b border-gray-300">
                            <TableCell className="border-r border-gray-300">CGST {(taxRate / 2).toFixed(1)}%</TableCell>
                            <TableCell className="text-right">₹{totals.cgstAmount.toFixed(2)}</TableCell>
                          </TableRow>
                          <TableRow className="border-b border-gray-300">
                            <TableCell className="border-r border-gray-300">SGST {(taxRate / 2).toFixed(1)}%</TableCell>
                            <TableCell className="text-right">₹{totals.sgstAmount.toFixed(2)}</TableCell>
                          </TableRow>
                        </>
                      ) : (
                        <TableRow className="border-b border-gray-300">
                          <TableCell className="border-r border-gray-300">IGST {taxRate}%</TableCell>
                          <TableCell className="text-right">₹{totals.igstAmount.toFixed(2)}</TableCell>
                        </TableRow>
                      )}
                      <TableRow className="border-b border-gray-300">
                        <TableCell className="border-r border-gray-300">ROUND OFF</TableCell>
                        <TableCell className="text-right">{totals.roundOff >= 0 ? '' : '-'}₹{Math.abs(totals.roundOff).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow className="bg-gray-100">
                        <TableCell className="font-bold border-r border-gray-300">NET AMOUNT</TableCell>
                        <TableCell className="text-right font-bold text-lg">₹{totals.netAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createInvoice.isPending || !formData.companyId || !formData.partyId}>
                  {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoices List with Bordered Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 border-b-2 border-gray-300">
                    <TableHead className="border-r border-gray-300 font-bold">Invoice No</TableHead>
                    <TableHead className="border-r border-gray-300 font-bold">Date</TableHead>
                    <TableHead className="border-r border-gray-300 font-bold">Set No</TableHead>
                    <TableHead className="border-r border-gray-300 font-bold">Party</TableHead>
                    <TableHead className="border-r border-gray-300 font-bold text-right">Net Amount</TableHead>
                    <TableHead className="border-r border-gray-300 font-bold">Payment Terms</TableHead>
                    <TableHead className="font-bold text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No invoices found. Create your first invoice!
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices?.map((invoice) => (
                      <TableRow key={invoice.id} className="border-b border-gray-300 hover:bg-gray-50">
                        <TableCell className="border-r border-gray-300 font-medium">{invoice.invoiceNo}</TableCell>
                        <TableCell className="border-r border-gray-300">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell className="border-r border-gray-300">{invoice.setNo || '-'}</TableCell>
                        <TableCell className="border-r border-gray-300">{invoice.partyName}</TableCell>
                        <TableCell className="border-r border-gray-300 text-right font-bold">₹{invoice.netAmount.toFixed(2)}</TableCell>
                        <TableCell className="border-r border-gray-300">{invoice.paymentTerms || '-'}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm" onClick={() => downloadPDF(invoice.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}