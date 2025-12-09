'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Package, Truck, Scale, Ruler, Calculator, Settings, Car, MapPin } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeliveryPlace {
  id: number;
  placeName: string;
  address?: string;
  contact?: string;
  phone?: string;
  isActive: boolean;
}

interface CountEnd {
  id: number;
  countNumber: string;
  countName?: string;
  // ends: number; // Schema doesn't have ends directly on Count? Schema has Count -> End relation. 
  // Wait, master/count-ends route maps `count-ends` to `db.count`. 
  // `db.count` has `countNumber`, `countName`.
  // The frontend expects `ends` and `count` (string).
  // Assuming `countNumber` maps to `count`.
  description?: string;
  isActive: boolean;
}

interface Unit {
  id: number;
  unitName: string;
  unitSymbol: string;
  unitType: 'WEIGHT' | 'LENGTH' | 'QUANTITY' | 'AREA';
  conversionFactor?: number;
  isActive: boolean;
}

interface Tax {
  id: number;
  taxName: string;
  taxType: 'CGST' | 'SGST' | 'IGST' | 'CESS';
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

interface LoomType {
  id: number;
  name: string;
  description?: string;
  chargePerBeam?: number;
  chargePerKg?: number;
  isActive: boolean;
}

interface Vehicle {
  id: number;
  vehicleNo: string;
  vehicleType: 'TRUCK' | 'VAN' | 'AUTO' | 'OTHER';
  // capacity?: number; // Not in schema
  driverName?: string;
  driverPhone?: string;
  isActive: boolean;
}

interface Beam {
  id: number;
  beamNo: string;
  // type: string; // Not in schema
  grossWeight: number;
  tareWeight: number;
  status: string; // IN, OUT etc
  isActive: boolean;
}

interface SizingCharge {
  id: number;
  partyId: number;
  partyName?: string; // Comes from included relation
  chargePerKg: number;
  chargePerBeam?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState('delivery-places');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const queryClient = useQueryClient();

  // Generic fetch hook for different master data types
  const useMasterData = (type: string) => {
    return useQuery({
      queryKey: [type],
      queryFn: async () => {
        const response = await fetch(`/api/master/${type}`);
        if (!response.ok) throw new Error(`Failed to fetch ${type}`);
        return response.json();
      }
    });
  };

  // Generic save mutation
  const useSaveMutation = (type: string) => {
    return useMutation({
      mutationFn: async (data: any) => {
        const isEdit = editingItem && editingItem.id;
        const url = isEdit ? `/api/master/${type}/${editingItem.id}` : `/api/master/${type}`;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error(`Failed to save ${type}`);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [activeTab] });
        setIsDialogOpen(false);
        resetForm();
        toast.success(`${activeTab.replace('-', ' ')} saved successfully`);
      },
      onError: (error: any) => {
        toast.error(error.message || `Failed to save ${activeTab}`);
      }
    });
  };

  // Generic delete mutation
  const useDeleteMutation = (type: string) => {
    return useMutation({
      mutationFn: async (id: number) => {
        const response = await fetch(`/api/master/${type}/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Failed to delete ${type}`);
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [activeTab] });
        toast.success(`${activeTab.replace('-', ' ')} deleted successfully`);
      },
      onError: (error: any) => {
        toast.error(error.message || `Failed to delete ${activeTab}`);
      }
    });
  };

  const { data: deliveryPlaces } = useMasterData('delivery-places');
  const { data: countEnds } = useMasterData('count-ends');
  const { data: units } = useMasterData('units');
  const { data: taxes } = useMasterData('taxes');
  const { data: loomTypes } = useMasterData('loom-types');
  const { data: vehicles } = useMasterData('vehicles');
  const { data: beams } = useMasterData('beams');

  // Fetch parties for Sizing Charges dropdown
  const { data: parties } = useQuery({
    queryKey: ['parties'],
    queryFn: async () => {
      const response = await fetch('/api/parties');
      if (!response.ok) throw new Error('Failed to fetch parties');
      return response.json();
    }
  });
  const { data: sizingCharges } = useMasterData('sizing-charges');

  const saveMutation = useSaveMutation(activeTab);
  const deleteMutation = useDeleteMutation(activeTab);

  const resetForm = () => {
    setFormData({});
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const renderForm = () => {
    switch (activeTab) {
      case 'delivery-places':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Place Name</Label>
                <Input
                  value={formData.placeName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, placeName: e.target.value }))}
                  placeholder="Main Warehouse"
                />
              </div>
              <div>
                <Label>Contact Person</Label>
                <Input
                  value={formData.contact || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {/* City, State, PinCode merged into address in schema, removing specific inputs or keeping them dummy? 
                  Better to simple use Address as single field for now or keep them but note they might not persist if API expects single string.
                  I will remove them to align with schema simplicity for now or map them later. 
                  Given the API change I made earlier, I should stick to what schema supports.
              */}
            </div>
          </div>
        );

      case 'count-ends':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Count Number</Label>
                <Input
                  value={formData.countNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, countNumber: e.target.value }))}
                  placeholder="30's"
                />
              </div>
              <div>
                <Label>Count Name</Label>
                <Input
                  value={formData.countName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, countName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
        );

      case 'units':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit Name</Label>
                <Input
                  value={formData.unitName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitName: e.target.value }))}
                  placeholder="Kilogram"
                />
              </div>
              <div>
                <Label>Symbol</Label>
                <Input
                  value={formData.unitSymbol || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitSymbol: e.target.value }))}
                  placeholder="kg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  value={formData.unitType || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitType: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  <option value="WEIGHT">Weight</option>
                  <option value="LENGTH">Length</option>
                  <option value="QUANTITY">Quantity</option>
                  <option value="AREA">Area</option>
                </select>
              </div>
              <div>
                <Label>Conversion Factor</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={formData.conversionFactor || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, conversionFactor: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        );

      case 'taxes':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tax Name</Label>
                <Input
                  value={formData.taxName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxName: e.target.value }))}
                  placeholder="CGST"
                />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  value={formData.taxType || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxType: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="CGST">CGST</option>
                  <option value="SGST">SGST</option>
                  <option value="IGST">IGST</option>
                  <option value="CESS">CESS</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Percentage</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                  placeholder="2.5"
                />
              </div>
              <div>
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom ? new Date(formData.effectiveFrom).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 'loom-types':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loom Type</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="SULZER"
                />
              </div>
              <div>
                <Label>Charge per Beam</Label>
                <Input
                  type="number"
                  value={formData.chargePerBeam || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, chargePerBeam: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Charge per Kg</Label>
                <Input
                  type="number"
                  value={formData.chargePerKg || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, chargePerKg: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 'vehicles':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vehicle Number</Label>
                <Input
                  value={formData.vehicleNo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleNo: e.target.value }))}
                  placeholder="TN56R2935"
                />
              </div>
              <div>
                <Label>Type</Label>
                <select
                  value={formData.vehicleType || ''} // consistent naming: vehicleType
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="TRUCK">Truck</option>
                  <option value="VAN">Van</option>
                  <option value="AUTO">Auto</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Driver Name</Label>
                <Input
                  value={formData.driverName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Driver Phone</Label>
                <Input
                  value={formData.driverPhone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, driverPhone: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 'beams':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Beam Number</Label>
                <Input
                  value={formData.beamNo || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, beamNo: e.target.value }))}
                  placeholder="B001"
                />
              </div>
              <div>
                <Label>Status</Label>
                <select
                  value={formData.status || 'IN'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gross Weight</Label>
                <Input
                  type="number"
                  value={formData.grossWeight || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, grossWeight: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label>Tare Weight</Label>
                <Input
                  type="number"
                  value={formData.tareWeight || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, tareWeight: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        );

      case 'sizing-charges':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Party</Label>
                <select
                  value={formData.partyId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, partyId: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Party</option>
                  {parties?.map((party: any) => (
                    <option key={party.id} value={party.id}>{party.partyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Charge per KG (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.chargePerKg || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, chargePerKg: parseFloat(e.target.value) }))}
                  placeholder="19.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Charge per Beam (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.chargePerBeam || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, chargePerBeam: parseFloat(e.target.value) }))}
                  placeholder="500.00"
                />
              </div>
              <div>
                <Label>Effective From</Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveFrom: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Effective To (Optional)</Label>
              <Input
                type="date"
                value={formData.effectiveTo || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, effectiveTo: e.target.value }))}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTable = () => {
    const getData = () => {
      switch (activeTab) {
        case 'delivery-places': return deliveryPlaces;
        case 'count-ends': return countEnds;
        case 'units': return units;
        case 'taxes': return taxes;
        case 'loom-types': return loomTypes;
        case 'vehicles': return vehicles;
        case 'beams': return beams;
        case 'sizing-charges': return sizingCharges;
        default: return [];
      }
    };

    const data = getData();

    // Define columns config to avoid conditional hooks/logic inside render loop
    const getColumns = (tab: string) => {
      switch (tab) {
        case 'delivery-places':
          return [
            { header: 'Name', accessor: (item: any) => item.placeName },
            { header: 'Address', accessor: (item: any) => item.address || '-' },
            { header: 'Contact Person', accessor: (item: any) => item.contact || '-' },
          ];
        case 'count-ends':
          return [
            { header: 'Count', accessor: (item: any) => item.countNumber },
            { header: 'Ends', accessor: (item: any) => '-' },
            { header: 'Description', accessor: (item: any) => item.description || '-' },
          ];
        case 'units':
          return [
            { header: 'Name', accessor: (item: any) => item.unitName },
            { header: 'Symbol', accessor: (item: any) => item.unitSymbol },
            { header: 'Category', accessor: (item: any) => item.unitType },
            { header: 'Conversion Factor', accessor: (item: any) => item.conversionFactor || '-' },
          ];
        case 'taxes':
          return [
            { header: 'Name', accessor: (item: any) => item.taxName },
            { header: 'Type', accessor: (item: any) => item.taxType },
            { header: 'Percentage', accessor: (item: any) => `${item.rate}%` },
            { header: 'Effective From', accessor: (item: any) => new Date(item.effectiveFrom).toLocaleDateString() },
          ];
        case 'loom-types':
          return [
            { header: 'Name', accessor: (item: any) => item.name },
            { header: 'Charge / Beam', accessor: (item: any) => item.chargePerBeam || '-' },
            { header: 'Charge / Kg', accessor: (item: any) => item.chargePerKg || '-' },
            { header: 'Description', accessor: (item: any) => item.description || '-' },
          ];
        case 'vehicles':
          return [
            { header: 'Vehicle No', accessor: (item: any) => item.vehicleNo },
            { header: 'Type', accessor: (item: any) => item.vehicleType },
            { header: 'Driver Name', accessor: (item: any) => item.driverName || '-' },
            { header: 'Driver Phone', accessor: (item: any) => item.driverPhone || '-' },
          ];
        case 'beams':
          return [
            { header: 'Beam No', accessor: (item: any) => item.beamNo },
            { header: 'Gross Weight', accessor: (item: any) => item.grossWeight || '-' },
            { header: 'Tare Weight', accessor: (item: any) => item.tareWeight || '-' },
            { header: 'Status', accessor: (item: any) => item.status },
          ];
        case 'sizing-charges':
          return [
            { header: 'Party Name', accessor: (item: any) => item.partyName || '-' },
            { header: 'Charge / Kg', accessor: (item: any) => `₹${item.chargePerKg?.toFixed(2) || '0.00'}` },
            { header: 'Charge / Beam', accessor: (item: any) => `₹${item.chargePerBeam?.toFixed(2) || '0.00'}` },
            { header: 'Effective From', accessor: (item: any) => new Date(item.effectiveFrom).toLocaleDateString() },
          ];
        default:
          return [];
      }
    };

    const columns = getColumns(activeTab);

    return (
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index}>{col.header}</TableHead>
              ))}
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((item: any) => (
              <TableRow key={item.id}>
                {columns.map((col, index) => (
                  <TableCell key={index} className={index === 0 ? "font-medium" : ""}>
                    {col.accessor(item)}
                  </TableCell>
                ))}
                <TableCell>
                  <Badge className={getStatusColor(item.isActive ? 'ACTIVE' : 'INACTIVE')}>
                    {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Master Data Management</h1>
          <p className="text-muted-foreground">Manage all master data configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit' : 'Add New'} {activeTab.replace('-', ' ')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderForm()}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="delivery-places" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Places
          </TabsTrigger>
          <TabsTrigger value="count-ends" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Counts & Ends
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            Units
          </TabsTrigger>
          <TabsTrigger value="taxes" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Taxes
          </TabsTrigger>
        </TabsList>

        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="loom-types" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Loom Types
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="beams" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Beams
          </TabsTrigger>
          <TabsTrigger value="sizing-charges" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Sizing Charges
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab.replace('-', ' ').charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')} Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}