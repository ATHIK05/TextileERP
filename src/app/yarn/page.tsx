'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Truck, RotateCcw, FileText, Plus, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface YarnTransaction {
  id: number;
  type: 'RECEIPT' | 'RETURN' | 'DELIVERY';
  transactionNo: string;
  date: string;
  partyId: number;
  partyName: string;
  vehicleNo?: string;
  dcNo?: string;
  pdDcNo?: string;
  items: YarnTransactionItem[];
  totalBags: number;
  totalCones: number;
  totalWeight: number;
  status: string;
  remarks?: string;
}

interface YarnTransactionItem {
  id: number;
  millName: string;
  lotNo?: string;
  count: string;
  hsnCode?: string;
  bags: number;
  cones: number;
  weight: number;
  rate?: number;
  amount?: number;
}

interface Party {
  id: number;
  partyName: string;
  gstin: string;
  address?: string;
}

export default function YarnManagement() {
  const [activeTab, setActiveTab] = useState('receipt');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    partyId: '',
    vehicleNo: '',
    dcNo: '',
    pdDcNo: '',
    remarks: '',
    items: [{ millName: '', lotNo: '', count: '', hsnCode: '', bags: 0, cones: 0, weight: 0, rate: 0 }]
  });

  const queryClient = useQueryClient();

  // Fetch transactions
  const { data: transactions, isLoading } = useQuery<YarnTransaction[]>({
    queryKey: ['yarn-transactions'],
    queryFn: async () => {
      const response = await fetch('/api/yarn/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
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

  // Create transaction mutation
  const createTransaction = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/yarn/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: activeTab.toUpperCase()
        })
      });
      if (!response.ok) throw new Error('Failed to create transaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yarn-transactions'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} created successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create transaction');
    }
  });

  const resetForm = () => {
    setFormData({
      partyId: '',
      vehicleNo: '',
      dcNo: '',
      pdDcNo: '',
      remarks: '',
      items: [{ millName: '', lotNo: '', count: '', hsnCode: '', bags: 0, cones: 0, weight: 0, rate: 0 }]
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { millName: '', lotNo: '', count: '', hsnCode: '', bags: 0, cones: 0, weight: 0, rate: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotals = () => {
    return formData.items.reduce(
      (acc, item) => ({
        bags: acc.bags + (item.bags || 0),
        cones: acc.cones + (item.cones || 0),
        weight: acc.weight + (item.weight || 0),
        amount: acc.amount + ((item.weight || 0) * (item.rate || 0))
      }),
      { bags: 0, cones: 0, weight: 0, amount: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totals = calculateTotals();
    createTransaction.mutate({
      ...formData,
      ...totals,
      partyId: parseInt(formData.partyId)
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'RECEIPT': return <Package className="h-4 w-4" />;
      case 'RETURN': return <RotateCcw className="h-4 w-4" />;
      case 'DELIVERY': return <Truck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'RECEIPT': return 'bg-green-100 text-green-800';
      case 'RETURN': return 'bg-orange-100 text-orange-800';
      case 'DELIVERY': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = transactions?.filter(t =>
    activeTab === 'receipt' ? t.type === 'RECEIPT' :
      activeTab === 'return' ? t.type === 'RETURN' : t.type === 'DELIVERY'
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Yarn Management</h1>
          <p className="text-muted-foreground">Manage yarn receipts, returns, and deliveries</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setActiveTab('receipt')}>
              <Plus className="h-4 w-4 mr-2" />
              New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Create New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="partyId">Party</Label>
                  <Select value={formData.partyId} onValueChange={(value) => setFormData(prev => ({ ...prev, partyId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select party" />
                    </SelectTrigger>
                    <SelectContent>
                      {parties?.map(party => (
                        <SelectItem key={party.id} value={party.id.toString()}>
                          {party.partyName} ({party.gstin})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vehicleNo">Vehicle No</Label>
                  <Input
                    id="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleNo: e.target.value }))}
                    placeholder="TN56R2935"
                  />
                </div>
                {(activeTab === 'return' || activeTab === 'delivery') && (
                  <>
                    <div>
                      <Label htmlFor="dcNo">DC No</Label>
                      <Input
                        id="dcNo"
                        value={formData.dcNo}
                        onChange={(e) => setFormData(prev => ({ ...prev, dcNo: e.target.value }))}
                        placeholder="56"
                      />
                    </div>
                  </>
                )}
                {activeTab === 'receipt' && (
                  <div>
                    <Label htmlFor="pdDcNo">P.DC.No</Label>
                    <Input
                      id="pdDcNo"
                      value={formData.pdDcNo}
                      onChange={(e) => setFormData(prev => ({ ...prev, pdDcNo: e.target.value }))}
                      placeholder="823"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Items</Label>
                <div className="space-y-4 border rounded-lg p-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-8 gap-2 items-end">
                      <div>
                        <Label className="text-xs">Mill Name</Label>
                        <Input
                          value={item.millName}
                          onChange={(e) => updateItem(index, 'millName', e.target.value)}
                          placeholder="LUCKY"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Lot No</Label>
                        <Input
                          value={item.lotNo}
                          onChange={(e) => updateItem(index, 'lotNo', e.target.value)}
                          placeholder="WY-008"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Count</Label>
                        <Input
                          value={item.count}
                          onChange={(e) => updateItem(index, 'count', e.target.value)}
                          placeholder="30's vortex"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Bags</Label>
                        <Input
                          type="number"
                          value={item.bags}
                          onChange={(e) => updateItem(index, 'bags', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Cones</Label>
                        <Input
                          type="number"
                          value={item.cones}
                          onChange={(e) => updateItem(index, 'cones', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Weight</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={item.weight}
                          onChange={(e) => updateItem(index, 'weight', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      {activeTab === 'delivery' && (
                        <div>
                          <Label className="text-xs">Rate</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTransaction.isPending}>
                  {createTransaction.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="receipt">Yarn Receipt</TabsTrigger>
          <TabsTrigger value="return">Yarn Return</TabsTrigger>
          <TabsTrigger value="delivery">Yarn Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {activeTab === 'receipt' && <Package className="h-5 w-5" />}
                {activeTab === 'return' && <RotateCcw className="h-5 w-5" />}
                {activeTab === 'delivery' && <Truck className="h-5 w-5" />}
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction No</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Party</TableHead>
                        <TableHead>Vehicle No</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total Weight</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions?.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.transactionNo}</TableCell>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.partyName}</TableCell>
                          <TableCell>{transaction.vehicleNo || '-'}</TableCell>
                          <TableCell>{transaction.items.length} items</TableCell>
                          <TableCell>{transaction.totalWeight.toFixed(3)} kg</TableCell>
                          <TableCell>
                            <Badge className={getTransactionColor(transaction.type)}>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}