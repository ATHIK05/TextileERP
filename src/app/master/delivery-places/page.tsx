'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface DeliveryPlace {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  contactPerson?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function DeliveryPlacesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<DeliveryPlace | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    contactPerson: '',
    phone: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  const queryClient = useQueryClient();

  // Fetch delivery places
  const { data: deliveryPlaces, isLoading } = useQuery<DeliveryPlace[]>({
    queryKey: ['delivery-places'],
    queryFn: async () => {
      const response = await fetch('/api/master/delivery-places');
      if (!response.ok) throw new Error('Failed to fetch delivery places');
      return response.json();
    }
  });

  // Create/Update delivery place mutation
  const saveDeliveryPlace = useMutation({
    mutationFn: async (data: any) => {
      if (editingPlace) {
        const response = await fetch(`/api/master/delivery-places/${editingPlace.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update delivery place');
        return response.json();
      } else {
        const response = await fetch('/api/master/delivery-places', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create delivery place');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-places'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success(editingPlace ? 'Delivery place updated successfully' : 'Delivery place created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save delivery place');
    }
  });

  // Delete delivery place mutation
  const deleteDeliveryPlace = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/master/delivery-places/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete delivery place');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-places'] });
      toast.success('Delivery place deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete delivery place');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pinCode: '',
      contactPerson: '',
      phone: '',
      status: 'ACTIVE'
    });
    setEditingPlace(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveDeliveryPlace.mutate(formData);
  };

  const handleEdit = (place: DeliveryPlace) => {
    setEditingPlace(place);
    setFormData({
      name: place.name,
      address: place.address || '',
      city: place.city || '',
      state: place.state || '',
      pinCode: place.pinCode || '',
      contactPerson: place.contactPerson || '',
      phone: place.phone || '',
      status: place.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this delivery place?')) {
      deleteDeliveryPlace.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Delivery Places</h1>
          <p className="text-muted-foreground">Manage delivery locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Delivery Place
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlace ? 'Edit Delivery Place' : 'Add New Delivery Place'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Place Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Main Warehouse"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123, Main Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Chennai"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Tamil Nadu"
                  />
                </div>
                <div>
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input
                    id="pinCode"
                    value={formData.pinCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
                    placeholder="600001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="9876543210"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveDeliveryPlace.isPending}>
                  {saveDeliveryPlace.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Places List
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
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveryPlaces?.map((place) => (
                    <TableRow key={place.id}>
                      <TableCell className="font-medium">{place.name}</TableCell>
                      <TableCell>{place.address || '-'}</TableCell>
                      <TableCell>{place.city || '-'}</TableCell>
                      <TableCell>{place.state || '-'}</TableCell>
                      <TableCell>{place.contactPerson || '-'}</TableCell>
                      <TableCell>{place.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(place.status)}>
                          {place.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(place)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(place.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}